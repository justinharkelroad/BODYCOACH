import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import Anthropic from '@anthropic-ai/sdk';
import type { MealSuggestionRequest, MealSuggestion, MealSuggestionsResponse } from '@/features/ai-suggestions/types';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic();

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// Helper to extract JSON from markdown code blocks if present
function extractJSON(text: string): string {
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return text.trim();
}

// Generate unique ID
function generateId(): string {
  return `meal_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export async function POST(request: NextRequest) {
  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

  // Rate limiting - AI routes are expensive
  const identifier = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(`meal-suggestions:${identifier}`, RATE_LIMITS.ai);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  const supabase = await createClientForApi(request);

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  // Parse request body
  let body: MealSuggestionRequest;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: 'Invalid request body' }, { status: 400, headers: corsHeaders });
  }

  // Validate required fields
  const { remainingCalories, remainingProtein, remainingCarbs, remainingFat, mealType, preferences } = body;

  if (
    typeof remainingCalories !== 'number' ||
    typeof remainingProtein !== 'number' ||
    typeof remainingCarbs !== 'number' ||
    typeof remainingFat !== 'number' ||
    !['breakfast', 'lunch', 'dinner', 'snack'].includes(mealType)
  ) {
    return Response.json(
      { error: 'Missing or invalid required fields' },
      { status: 400, headers: corsHeaders }
    );
  }

  try {
    // Fetch user profile for dietary context
    const { data: profile } = await supabase
      .from('profiles')
      .select('dietary_restrictions, fitness_goal, is_female')
      .eq('id', user.id)
      .single();

    // Build preferences string
    const preferencesText = [];
    if (preferences?.dietaryRestrictions?.length) {
      preferencesText.push(`Dietary restrictions: ${preferences.dietaryRestrictions.join(', ')}`);
    } else if (profile?.dietary_restrictions?.length) {
      preferencesText.push(`Dietary restrictions: ${profile.dietary_restrictions.join(', ')}`);
    }
    if (preferences?.quickPrepOnly) {
      preferencesText.push('Quick prep only (under 15 minutes)');
    }
    if (preferences?.cuisinePreference) {
      preferencesText.push(`Cuisine preference: ${preferences.cuisinePreference}`);
    }

    const systemPrompt = `You are a nutrition-savvy meal planner helping users hit their daily macro targets. Your suggestions should be practical, realistic, and achievable with common ingredients.

IMPORTANT: Return ONLY a valid JSON object, no markdown code blocks, no explanations.

The JSON must follow this exact structure:
{
  "suggestions": [
    {
      "name": "Meal Name",
      "description": "Brief appetizing description (1-2 sentences)",
      "items": [
        {
          "name": "Food Item Name",
          "servingSize": "e.g., 1 cup, 4 oz, 2 slices",
          "calories": 200,
          "protein": 15,
          "carbs": 20,
          "fat": 8
        }
      ],
      "totalCalories": 400,
      "totalProtein": 30,
      "totalCarbs": 35,
      "totalFat": 15,
      "prepTime": "10 minutes",
      "isRestaurant": false,
      "restaurantName": null
    }
  ]
}

Guidelines:
- Suggest exactly 3 different meals
- Each meal's total macros should fit within the remaining targets (don't exceed them)
- Include 2-4 food items per meal
- Make macros realistic and accurate for common foods
- Include at least one high-protein option
- For snacks, keep it simple (1-2 items)
- Include one restaurant/takeout option if macros allow for it
- Prep times should be realistic`;

    const userMessage = `I need meal suggestions for ${mealType.toUpperCase()}.

REMAINING MACROS TO FIT:
- Calories: ${remainingCalories} kcal
- Protein: ${remainingProtein}g
- Carbs: ${remainingCarbs}g
- Fat: ${remainingFat}g

${preferencesText.length > 0 ? `USER PREFERENCES:\n${preferencesText.join('\n')}` : ''}

Please suggest 3 ${mealType} options that fit within these remaining macros. Return only the JSON object.`;

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [
        {
          role: 'user',
          content: userMessage,
        },
      ],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const rawText = textBlock?.type === 'text' ? textBlock.text : '{}';
    const jsonText = extractJSON(rawText);

    let suggestions: MealSuggestion[];
    try {
      const parsed = JSON.parse(jsonText);
      suggestions = (parsed.suggestions || []).map((s: Omit<MealSuggestion, 'id'>) => ({
        ...s,
        id: generateId(),
      }));
    } catch {
      // If parsing fails, return a fallback response
      console.error('Failed to parse AI response:', rawText);
      suggestions = [
        {
          id: generateId(),
          name: 'Grilled Chicken Salad',
          description: 'A light and protein-packed salad perfect for any meal.',
          items: [
            { name: 'Grilled Chicken Breast', servingSize: '4 oz', calories: 140, protein: 26, carbs: 0, fat: 3 },
            { name: 'Mixed Greens', servingSize: '2 cups', calories: 20, protein: 2, carbs: 4, fat: 0 },
            { name: 'Olive Oil Dressing', servingSize: '1 tbsp', calories: 120, protein: 0, carbs: 0, fat: 14 },
          ],
          totalCalories: 280,
          totalProtein: 28,
          totalCarbs: 4,
          totalFat: 17,
          prepTime: '15 minutes',
          isRestaurant: false,
        },
      ];
    }

    const result: MealSuggestionsResponse = {
      suggestions,
      requestId: generateId(),
    };

    return Response.json(result, { headers: corsHeaders });
  } catch (error) {
    console.error('Meal suggestions API error:', error);
    return Response.json(
      { error: 'Failed to generate meal suggestions' },
      { status: 500, headers: corsHeaders }
    );
  }
}

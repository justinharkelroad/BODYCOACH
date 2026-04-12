import Anthropic from '@anthropic-ai/sdk';

// Initialize the Anthropic client
// The SDK automatically uses ANTHROPIC_API_KEY from environment
const anthropic = new Anthropic();

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export async function streamChatResponse(
  systemPrompt: string,
  messages: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> {
  let fullResponse = '';

  const stream = await anthropic.messages.stream({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      const text = event.delta.text;
      fullResponse += text;
      onChunk(text);
    }
  }

  return fullResponse;
}

export async function getChatResponse(
  systemPrompt: string,
  messages: ChatMessage[]
): Promise<string> {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    system: systemPrompt,
    messages: messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  return textBlock?.type === 'text' ? textBlock.text : '';
}

export interface PhotoAnalysisContext {
  goal: string;
  photoType: 'front' | 'side' | 'back';
  previousAnalysis?: Record<string, unknown> | null;
}

export interface PhotoAnalysisResult {
  summary: string;
  observations: string[];
  improvements: string[];
  focusAreas: string[];
  comparisonNotes?: string;
}

// Helper to extract JSON from markdown code blocks if present
function extractJSON(text: string): string {
  // Remove markdown code blocks if present
  const codeBlockMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (codeBlockMatch) {
    return codeBlockMatch[1].trim();
  }
  return text.trim();
}

export interface PhotoSetAnalysisResult {
  summary: string;
  bodyComposition: {
    overall: string;
    muscleGroups: string[];
    areasOfProgress: string[];
  };
  recommendations: string[];
  encouragement: string;
  comparisonWithPrevious?: {
    changes: string[];
    improvements: string[];
    timeframe: string;
  };
}

export interface PhotoSetContext {
  goal: string;
  currentWeight?: number;
  targetWeight?: number;
  previousSetDate?: string;
  previousSetAnalysis?: PhotoSetAnalysisResult | null;
}

export async function analyzeProgressPhotoSet(
  photos: Array<{
    type: 'front' | 'side' | 'back';
    base64: string;
    mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif';
  }>,
  context: PhotoSetContext
): Promise<PhotoSetAnalysisResult> {
  const goalPhrases: Record<string, string> = {
    gain_muscle: 'build muscle and increase strength',
    lose_fat: 'lose fat while maintaining muscle',
    maintain: 'maintain current physique and stay healthy',
  };

  const hasComparison = context.previousSetAnalysis && context.previousSetDate;

  const systemPrompt = `You are a supportive, encouraging fitness coach analyzing a complete set of progress photos (front, side, and back views).

The user's fitness goal is to ${goalPhrases[context.goal] || context.goal}.
${context.currentWeight ? `Current weight: ${context.currentWeight} lbs` : ''}
${context.targetWeight ? `Target weight: ${context.targetWeight} lbs` : ''}

${hasComparison ? `
IMPORTANT: This is a COMPARISON analysis. The user previously took photos on ${context.previousSetDate}.
Previous analysis summary: ${context.previousSetAnalysis?.summary || 'Not available'}
Previous observations: ${JSON.stringify(context.previousSetAnalysis?.bodyComposition || {})}

Focus on highlighting PROGRESS and CHANGES since the previous photos.
` : 'This is the user\'s first complete photo set. Focus on establishing a baseline.'}

Respond with a JSON object (no markdown code blocks, just raw JSON):

{
  "summary": "2-3 encouraging sentences about overall physique and progress",
  "bodyComposition": {
    "overall": "Overall assessment of current physique",
    "muscleGroups": ["Notable muscle group 1", "Notable muscle group 2"],
    "areasOfProgress": ["Area showing good development 1", "Area 2"]
  },
  "recommendations": ["Specific actionable recommendation 1", "Recommendation 2", "Recommendation 3"],
  "encouragement": "A motivating, personalized message to keep them going"${hasComparison ? `,
  "comparisonWithPrevious": {
    "changes": ["Visible change 1", "Visible change 2"],
    "improvements": ["Improvement 1", "Improvement 2"],
    "timeframe": "X weeks/days of progress"
  }` : ''}
}

Guidelines:
- Be ENCOURAGING and SUPPORTIVE - celebrate wins, no matter how small
- Focus on fitness progress indicators, not appearance judgments
- Be specific but kind - if suggesting improvements, frame positively
- This is visual estimation only, not a medical assessment
- Return ONLY the JSON object, no markdown`;

  // Build the content array with all photos
  const imageContent = photos.map((photo) => ({
    type: 'image' as const,
    source: {
      type: 'base64' as const,
      media_type: photo.mediaType,
      data: photo.base64,
    },
  }));

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2048,
    messages: [
      {
        role: 'user',
        content: [
          ...imageContent,
          {
            type: 'text',
            text: `Analyze these ${photos.length} progress photos (${photos.map(p => p.type).join(', ')} views). ${hasComparison ? 'Compare with the previous set and highlight progress.' : 'This is the first set - establish a baseline.'} Return only a JSON object.`,
          },
        ],
      },
    ],
    system: systemPrompt,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const rawText = textBlock?.type === 'text' ? textBlock.text : '{}';
  const jsonText = extractJSON(rawText);

  try {
    return JSON.parse(jsonText) as PhotoSetAnalysisResult;
  } catch {
    return {
      summary: 'Analysis complete. Great job staying consistent with your progress photos!',
      bodyComposition: {
        overall: rawText.slice(0, 300),
        muscleGroups: [],
        areasOfProgress: [],
      },
      recommendations: ['Keep up the consistent photo tracking!'],
      encouragement: 'Every photo is a step toward your goals. Keep going!',
    };
  }
}

export async function analyzeProgressPhoto(
  imageBase64: string,
  mediaType: 'image/jpeg' | 'image/png' | 'image/webp' | 'image/gif',
  context: PhotoAnalysisContext
): Promise<PhotoAnalysisResult> {
  const goalPhrases: Record<string, string> = {
    gain_muscle: 'build muscle and strength',
    lose_weight: 'lose weight and reduce body fat',
    gain_weight: 'gain healthy weight',
  };

  const systemPrompt = `You are a supportive fitness coach analyzing a progress photo.
The user's goal is to ${goalPhrases[context.goal] || context.goal}.
This is a ${context.photoType} view photo.

${context.previousAnalysis ? `Previous analysis for comparison: ${JSON.stringify(context.previousAnalysis)}` : 'This is their first photo of this type.'}

Respond with a JSON object (no markdown, no code blocks, just raw JSON) with these fields:

{
  "summary": "2-3 encouraging sentences about what you observe",
  "observations": ["observation 1", "observation 2", "observation 3"],
  "improvements": ["improvement 1", "improvement 2"],
  "focusAreas": ["focus area 1", "focus area 2"],
  "comparisonNotes": "optional comparison to previous if applicable"
}

Guidelines:
- Be supportive and constructive
- Focus on fitness progress, not appearance judgments
- This is visual estimation only, not medical assessment
- Do NOT wrap in markdown code blocks
- Return ONLY the JSON object`;

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 1024,
    messages: [
      {
        role: 'user',
        content: [
          {
            type: 'image',
            source: {
              type: 'base64',
              media_type: mediaType,
              data: imageBase64,
            },
          },
          {
            type: 'text',
            text: 'Analyze this progress photo. Return only a JSON object with summary, observations, improvements, and focusAreas fields.',
          },
        ],
      },
    ],
    system: systemPrompt,
  });

  const textBlock = response.content.find((block) => block.type === 'text');
  const rawText = textBlock?.type === 'text' ? textBlock.text : '{}';
  const jsonText = extractJSON(rawText);

  try {
    return JSON.parse(jsonText) as PhotoAnalysisResult;
  } catch {
    // If parsing fails, return a structured error response
    return {
      summary: 'Analysis complete. Please see observations below.',
      observations: [rawText.slice(0, 200)],
      improvements: [],
      focusAreas: [],
    };
  }
}

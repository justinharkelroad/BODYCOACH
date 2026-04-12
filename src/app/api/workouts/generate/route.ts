import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';
import { checkRateLimit, getClientIdentifier, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import Anthropic from '@anthropic-ai/sdk';
import type { Profile } from '@/types/database';

export const dynamic = 'force-dynamic';

const anthropic = new Anthropic();

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

// Handle CORS preflight
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders });
}

const workoutTypeDescriptions: Record<string, string> = {
  full_body: 'a full body workout hitting all major muscle groups',
  upper: 'an upper body workout focusing on chest, back, shoulders, and arms',
  lower: 'a lower body workout focusing on quads, hamstrings, glutes, and calves',
  push: 'a push day workout targeting chest, shoulders, and triceps',
  pull: 'a pull day workout targeting back, biceps, and rear delts',
  legs: 'a comprehensive leg day workout',
};

const equipmentDescriptions: Record<string, string> = {
  full_gym: 'full gym equipment including barbells, dumbbells, cables, and machines',
  dumbbells: 'only dumbbells',
  bodyweight: 'no equipment (bodyweight exercises only)',
  home: 'basic home gym equipment (dumbbells, pull-up bar, resistance bands)',
};

export async function POST(request: NextRequest) {
  // Rate limiting - AI routes are expensive
  const identifier = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(`workout-generate:${identifier}`, RATE_LIMITS.ai);
  if (!rateLimitResult.success) {
    return rateLimitResponse(rateLimitResult);
  }

  const supabase = await createClientForApi(request);

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { workoutType, duration, equipment } = await request.json();

  // Fetch user profile for context
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single() as { data: Profile | null };

  const goalContext = profile?.goal
    ? `The user's goal is to ${profile.goal.replace('_', ' ')}.`
    : '';

  const prompt = `Generate ${workoutTypeDescriptions[workoutType] || 'a workout'} that takes approximately ${duration} minutes using ${equipmentDescriptions[equipment] || 'available equipment'}.

${goalContext}

Respond with ONLY valid JSON in this exact format (no markdown, no explanation):
{
  "name": "Workout name",
  "description": "Brief description of the workout",
  "warmup": ["warmup item 1", "warmup item 2"],
  "exercises": [
    {
      "name": "Exercise name",
      "sets": 3,
      "reps": "8-12",
      "rest": "60-90 sec",
      "notes": "Optional form tip or note"
    }
  ],
  "cooldown": ["cooldown item 1", "cooldown item 2"]
}

Include 5-8 exercises appropriate for the duration. Make sure exercise selection matches the workout type and available equipment.`;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1500,
      messages: [{ role: 'user', content: prompt }],
    });

    const textBlock = response.content.find((block) => block.type === 'text');
    const text = textBlock?.type === 'text' ? textBlock.text : '';

    // Parse JSON from response
    const workout = JSON.parse(text);

    return Response.json({ workout }, { headers: corsHeaders });
  } catch (error) {
    console.error('Workout generation error:', error);
    return Response.json(
      { error: 'Failed to generate workout' },
      { status: 500, headers: corsHeaders }
    );
  }
}

// Save generated workout
export async function PUT(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders });
  }

  const { workout, duration } = await request.json();

  // Create workout log
  const { data: workoutLog, error: workoutError } = await supabase
    .from('workout_logs')
    .insert({
      user_id: user.id,
      workout_date: new Date().toISOString().split('T')[0],
      name: workout.name,
      duration_minutes: duration,
      notes: workout.description,
      ai_generated: true,
    })
    .select('id')
    .single();

  if (workoutError) {
    return Response.json({ error: workoutError.message }, { status: 500, headers: corsHeaders });
  }

  // Create workout exercises
  const exercisesToInsert = workout.exercises.map((ex: { name: string; sets: number; reps: string; notes?: string }, index: number) => ({
    workout_log_id: workoutLog.id,
    exercise_name: ex.name,
    sets: ex.sets,
    reps: parseInt(ex.reps) || null,
    notes: ex.notes || null,
    order_index: index,
  }));

  const { error: exercisesError } = await supabase
    .from('workout_exercises')
    .insert(exercisesToInsert);

  if (exercisesError) {
    return Response.json({ error: exercisesError.message }, { status: 500, headers: corsHeaders });
  }

  return Response.json({ success: true, workoutId: workoutLog.id }, { headers: corsHeaders });
}

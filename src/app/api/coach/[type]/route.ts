import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';
import { getChatResponse } from '@/lib/ai/client';
import {
  buildNutritionCoachPrompt,
  buildWorkoutCoachPrompt,
  buildContextFromProfile,
} from '@/lib/ai/prompts';
import { checkRateLimit, getClientIdentifier, rateLimitResponse, RATE_LIMITS } from '@/lib/rateLimit';
import type { Profile, BodyStat, WorkoutLog, CoachMessage } from '@/types/database';

export const dynamic = 'force-dynamic';

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

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ type: string }> }
) {
  const { type } = await params;

  const corsHeaders = { 'Access-Control-Allow-Origin': '*' };

  // Validate coach type
  if (type !== 'nutrition' && type !== 'workout') {
    return Response.json({ error: 'Invalid coach type' }, { status: 400, headers: corsHeaders });
  }

  // Rate limiting - AI routes are expensive
  const identifier = getClientIdentifier(request);
  const rateLimitResult = await checkRateLimit(`coach:${type}:${identifier}`, RATE_LIMITS.ai);
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
  const { message, conversationId } = await request.json();
  if (!message || typeof message !== 'string') {
    return Response.json({ error: 'Message is required' }, { status: 400, headers: corsHeaders });
  }

  try {
    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single() as { data: Profile | null };

    if (!profile) {
      return Response.json({ error: 'Profile not found' }, { status: 404, headers: corsHeaders });
    }

    // Fetch recent stats (last 14 days)
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

    const { data: stats } = await supabase
      .from('body_stats')
      .select('*')
      .eq('user_id', user.id)
      .gte('recorded_at', twoWeeksAgo.toISOString().split('T')[0])
      .order('recorded_at', { ascending: false }) as { data: BodyStat[] | null };

    // Fetch recent workouts (last 7 days)
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const { data: workouts } = await supabase
      .from('workout_logs')
      .select('*')
      .eq('user_id', user.id)
      .gte('workout_date', weekAgo.toISOString().split('T')[0])
      .order('workout_date', { ascending: false }) as { data: WorkoutLog[] | null };

    // Build context
    const context = buildContextFromProfile(profile, stats || [], workouts || []);

    // Build system prompt based on coach type
    const systemPrompt = type === 'nutrition'
      ? buildNutritionCoachPrompt(context)
      : buildWorkoutCoachPrompt(context);

    // Get or create conversation
    let activeConversationId = conversationId;

    if (!activeConversationId) {
      // Create new conversation
      const { data: newConversation, error: convError } = await supabase
        .from('coach_conversations')
        .insert({
          user_id: user.id,
          coach_type: type,
        })
        .select('id')
        .single();

      if (convError) {
        console.error('Error creating conversation:', convError);
        return Response.json({ error: 'Failed to create conversation' }, { status: 500, headers: corsHeaders });
      }
      activeConversationId = newConversation.id;
    }

    // Save user message
    await supabase.from('coach_messages').insert({
      conversation_id: activeConversationId,
      role: 'user',
      content: message,
    });

    // Fetch conversation history (last 10 messages for context)
    const { data: history } = await supabase
      .from('coach_messages')
      .select('role, content')
      .eq('conversation_id', activeConversationId)
      .order('created_at', { ascending: true })
      .limit(10) as { data: Pick<CoachMessage, 'role' | 'content'>[] | null };

    // Format messages for Claude
    const messages = (history || []).map((m) => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    // Get AI response
    const aiResponse = await getChatResponse(systemPrompt, messages);

    // Save assistant message
    await supabase.from('coach_messages').insert({
      conversation_id: activeConversationId,
      role: 'assistant',
      content: aiResponse,
    });

    // Update conversation timestamp
    await supabase
      .from('coach_conversations')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', activeConversationId);

    return Response.json(
      {
        response: aiResponse,
        conversationId: activeConversationId,
      },
      { headers: corsHeaders }
    );
  } catch (error) {
    console.error('Coach API error:', error);
    return Response.json(
      { error: 'Failed to get response from coach' },
      { status: 500, headers: corsHeaders }
    );
  }
}

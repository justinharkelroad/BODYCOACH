import { createClientForApi } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - List pending and recent check-ins
export async function GET(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status'); // 'pending', 'completed', 'all'

  let query = supabase
    .from('check_ins')
    .select('*')
    .eq('user_id', user.id)
    .order('scheduled_for', { ascending: false })
    .limit(50);

  if (status === 'pending') {
    query = query.is('completed_at', null).eq('skipped', false);
  } else if (status === 'completed') {
    query = query.not('completed_at', 'is', null);
  }

  const { data: checkIns, error } = await query;

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch check-ins' }, { status: 500 });
  }

  return NextResponse.json({ checkIns });
}

// POST - Create a check-in (usually done by cron, but available for manual creation)
export async function POST(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { check_in_type, scheduled_for } = body;

  if (!check_in_type) {
    return NextResponse.json({ error: 'check_in_type is required' }, { status: 400 });
  }

  const { data: checkIn, error } = await supabase
    .from('check_ins')
    .insert({
      user_id: user.id,
      check_in_type,
      scheduled_for: scheduled_for || new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create check-in:', error);
    return NextResponse.json({ error: 'Failed to create check-in' }, { status: 500 });
  }

  return NextResponse.json({ checkIn });
}

import { createClientForApi } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - List user's commitments
export async function GET(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: commitments, error } = await supabase
    .from('commitments')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch commitments' }, { status: 500 });
  }

  return NextResponse.json({ commitments });
}

// POST - Create a new commitment
export async function POST(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { commitment_type, description, frequency, days_of_week, time_of_day } = body;

  if (!commitment_type || !description) {
    return NextResponse.json({ error: 'commitment_type and description are required' }, { status: 400 });
  }

  const { data: commitment, error } = await supabase
    .from('commitments')
    .insert({
      user_id: user.id,
      commitment_type,
      description,
      frequency: frequency || 'daily',
      days_of_week: days_of_week || null,
      time_of_day: time_of_day || null,
      active: true,
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to create commitment:', error);
    return NextResponse.json({ error: 'Failed to create commitment' }, { status: 500 });
  }

  return NextResponse.json({ commitment });
}

// PUT - Update a commitment
export async function PUT(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { id, ...updates } = body;

  if (!id) {
    return NextResponse.json({ error: 'Commitment ID required' }, { status: 400 });
  }

  const { data: commitment, error } = await supabase
    .from('commitments')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to update commitment' }, { status: 500 });
  }

  return NextResponse.json({ commitment });
}

// DELETE - Delete a commitment
export async function DELETE(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ error: 'Commitment ID required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('commitments')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete commitment' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

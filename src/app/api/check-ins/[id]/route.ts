import { createClientForApi } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// POST - Complete a check-in
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json();
  const { responses, skipped } = body;

  // Verify ownership
  const { data: existing } = await supabase
    .from('check_ins')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single();

  if (!existing) {
    return NextResponse.json({ error: 'Check-in not found' }, { status: 404 });
  }

  const updateData: Record<string, unknown> = {};

  if (skipped) {
    updateData.skipped = true;
  } else {
    updateData.completed_at = new Date().toISOString();
    updateData.responses = responses || {};
  }

  const { data: checkIn, error } = await supabase
    .from('check_ins')
    .update(updateData)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to complete check-in:', error);
    return NextResponse.json({ error: 'Failed to complete check-in' }, { status: 500 });
  }

  // If this was a weight check-in, also log to body_stats
  if (!skipped && responses?.weight && checkIn.check_in_type === 'daily_weight') {
    await supabase.from('body_stats').upsert({
      user_id: user.id,
      recorded_at: new Date().toISOString().split('T')[0],
      weight_lbs: responses.weight,
      notes: responses.notes || null,
    }, {
      onConflict: 'user_id,recorded_at',
    });
  }

  return NextResponse.json({ checkIn });
}

// DELETE - Delete a check-in
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { id } = await params;

  const { error } = await supabase
    .from('check_ins')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: 'Failed to delete check-in' }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

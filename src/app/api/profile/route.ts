import { createClientForApi } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';

// GET - Get current user's profile
export async function GET(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch profile' }, { status: 500 });
  }

  return NextResponse.json({ profile });
}

// PUT - Update current user's profile
export async function PUT(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();

  // Only allow updating specific fields
  const allowedFields = [
    'full_name',
    'phone',
    'goal',
    'activity_level',
    'birth_date',
    'gender',
    'height_in',
    'timezone',
    'notification_preferences',
  ];

  const updates: Record<string, unknown> = {};
  for (const field of allowedFields) {
    if (field in body) {
      updates[field] = body[field];
    }
  }

  const { data: profile, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', user.id)
    .select()
    .single();

  if (error) {
    console.error('Failed to update profile:', error);
    return NextResponse.json({ error: 'Failed to update profile' }, { status: 500 });
  }

  return NextResponse.json({ profile });
}

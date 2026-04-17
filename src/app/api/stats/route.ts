import { createClientForApi } from '@/lib/supabase/server';
import { NextRequest, NextResponse } from 'next/server';
import { getDateStringInTimezone } from '@/lib/date';

async function getUserTimezone(
  supabase: Awaited<ReturnType<typeof createClientForApi>>,
  userId: string,
): Promise<string> {
  const { data } = await supabase
    .from('profiles')
    .select('timezone')
    .eq('id', userId)
    .single();
  return (data as { timezone?: string } | null)?.timezone || 'UTC';
}

// GET - List body stats
export async function GET(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const days = parseInt(searchParams.get('days') || '90');

  const userTimezone = await getUserTimezone(supabase, user.id);
  const startDate = getDateStringInTimezone(
    userTimezone,
    new Date(Date.now() - days * 86400000),
  );

  const { data: stats, error } = await supabase
    .from('body_stats')
    .select('*')
    .eq('user_id', user.id)
    .gte('recorded_at', startDate)
    .order('recorded_at', { ascending: false });

  if (error) {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 });
  }

  const normalizedStats = (stats || []) as Array<{
    recorded_at: string;
    weight_lbs: number | null;
    body_fat_pct: number | null;
  }>;

  const latestStat = normalizedStats[0];

  return NextResponse.json({
    stats: normalizedStats,
    weight: latestStat?.weight_lbs ?? null,
    bodyFat: latestStat?.body_fat_pct ?? null,
    recentWeights: normalizedStats
      .filter((stat) => typeof stat.weight_lbs === 'number')
      .map((stat) => ({
        date: stat.recorded_at,
        weight: stat.weight_lbs as number,
      })),
  });
}

// POST - Create or update a body stat
export async function POST(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const { recorded_at, ...statsData } = body;

  const userTimezone = await getUserTimezone(supabase, user.id);
  const date = recorded_at || getDateStringInTimezone(userTimezone);

  // Upsert - update if exists for this date, otherwise insert
  const { data: stat, error } = await supabase
    .from('body_stats')
    .upsert({
      user_id: user.id,
      recorded_at: date,
      ...statsData,
    }, {
      onConflict: 'user_id,recorded_at',
    })
    .select()
    .single();

  if (error) {
    console.error('Failed to save stat:', error);
    return NextResponse.json({ error: 'Failed to save stat' }, { status: 500 });
  }

  return NextResponse.json({ stat });
}

import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'coach') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { data: relationship } = await supabase
    .from('coach_clients')
    .select('id')
    .eq('coach_id', user.id)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .maybeSingle();

  if (!relationship) {
    return Response.json({ error: 'Client not found' }, { status: 404 });
  }

  const body = await request.json();
  const weight = body.weight_lbs;
  const recorded_at: string = body.recorded_at || new Date().toISOString().slice(0, 10);
  const notes: string | null = body.notes || null;

  const weightNum = typeof weight === 'string' ? parseFloat(weight) : weight;
  if (typeof weightNum !== 'number' || !isFinite(weightNum) || weightNum <= 0) {
    return Response.json({ error: 'Invalid weight' }, { status: 400 });
  }

  const { data: stat, error } = await supabase
    .from('body_stats')
    .upsert(
      {
        user_id: clientId,
        recorded_at,
        weight_lbs: weightNum,
        notes,
      },
      { onConflict: 'user_id,recorded_at' }
    )
    .select()
    .single();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ stat });
}

import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

type AuthResult =
  | { ok: true; supabase: Awaited<ReturnType<typeof createClientForApi>> }
  | { ok: false; response: Response };

async function authorizeCoachForClient(request: NextRequest, clientId: string): Promise<AuthResult> {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, response: Response.json({ error: 'Unauthorized' }, { status: 401 }) };
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'coach') {
    return { ok: false, response: Response.json({ error: 'Forbidden' }, { status: 403 }) };
  }

  const { data: relationship } = await supabase
    .from('coach_clients')
    .select('id')
    .eq('coach_id', user.id)
    .eq('client_id', clientId)
    .eq('status', 'active')
    .maybeSingle();

  if (!relationship) {
    return { ok: false, response: Response.json({ error: 'Client not found' }, { status: 404 }) };
  }

  return { ok: true, supabase };
}

function isValidDate(value: unknown): value is string {
  return typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function parseWeight(raw: unknown): number | null {
  const n = typeof raw === 'string' ? parseFloat(raw) : raw;
  if (typeof n !== 'number' || !isFinite(n) || n <= 0) return null;
  return n;
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const auth = await authorizeCoachForClient(request, clientId);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const body = await request.json();
  const recorded_at: string = isValidDate(body.recorded_at)
    ? body.recorded_at
    : new Date().toISOString().slice(0, 10);
  const notes: string | null = body.notes || null;

  const weightNum = parseWeight(body.weight_lbs);
  if (weightNum === null) {
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const auth = await authorizeCoachForClient(request, clientId);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const body = await request.json();
  const statId: unknown = body.statId;
  if (typeof statId !== 'string' || !statId) {
    return Response.json({ error: 'statId is required' }, { status: 400 });
  }

  const updates: Record<string, unknown> = {};
  if (body.weight_lbs !== undefined) {
    const weightNum = parseWeight(body.weight_lbs);
    if (weightNum === null) {
      return Response.json({ error: 'Invalid weight' }, { status: 400 });
    }
    updates.weight_lbs = weightNum;
  }
  if (body.recorded_at !== undefined) {
    if (!isValidDate(body.recorded_at)) {
      return Response.json({ error: 'Invalid date' }, { status: 400 });
    }
    updates.recorded_at = body.recorded_at;
  }
  if (body.notes !== undefined) {
    updates.notes = body.notes || null;
  }

  if (Object.keys(updates).length === 0) {
    return Response.json({ error: 'No fields to update' }, { status: 400 });
  }

  const { data: stat, error } = await supabase
    .from('body_stats')
    .update(updates)
    .eq('id', statId)
    .eq('user_id', clientId)
    .select()
    .maybeSingle();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
  if (!stat) {
    return Response.json({ error: 'Entry not found' }, { status: 404 });
  }

  return Response.json({ stat });
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const auth = await authorizeCoachForClient(request, clientId);
  if (!auth.ok) return auth.response;
  const { supabase } = auth;

  const { searchParams } = new URL(request.url);
  const statId = searchParams.get('statId');
  if (!statId) {
    return Response.json({ error: 'statId is required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('body_stats')
    .delete()
    .eq('id', statId)
    .eq('user_id', clientId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

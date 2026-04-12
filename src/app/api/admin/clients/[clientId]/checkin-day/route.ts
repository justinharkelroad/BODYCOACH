import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function PUT(
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

  const { checkin_day } = await request.json();

  // null means no scheduled day, 0-6 for Sun-Sat
  if (checkin_day !== null && (checkin_day < 0 || checkin_day > 6)) {
    return Response.json({ error: 'Invalid day' }, { status: 400 });
  }

  const { error } = await supabase
    .from('coach_clients')
    .update({ checkin_day })
    .eq('coach_id', user.id)
    .eq('client_id', clientId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

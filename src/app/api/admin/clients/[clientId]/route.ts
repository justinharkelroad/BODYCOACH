import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

// Archive or reactivate a client
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Verify user is a coach
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'coach') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { action } = await request.json();

  if (action !== 'archive' && action !== 'reactivate') {
    return Response.json({ error: 'Invalid action' }, { status: 400 });
  }

  const newStatus = action === 'archive' ? 'removed' : 'active';

  const { error } = await supabase
    .from('coach_clients')
    .update({ status: newStatus })
    .eq('coach_id', user.id)
    .eq('client_id', clientId);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true, status: newStatus });
}

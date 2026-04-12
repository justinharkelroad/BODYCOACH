import { NextRequest } from 'next/server';
import { createClient as createSupabaseClient } from '@supabase/supabase-js';
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

// Permanently delete a client relationship
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'coach') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Verify the client actually belongs to this coach before nuking the auth user
  const { data: relationship, error: relError } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', user.id)
    .eq('client_id', clientId)
    .maybeSingle();

  if (relError) {
    return Response.json({ error: relError.message }, { status: 500 });
  }
  if (!relationship) {
    return Response.json({ error: 'Client not found' }, { status: 404 });
  }

  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    return Response.json(
      { error: 'Server is not configured to delete accounts. Contact support.' },
      { status: 500 }
    );
  }

  const admin = createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    serviceRoleKey,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const { error: deleteError } = await admin.auth.admin.deleteUser(clientId);

  if (deleteError) {
    return Response.json({ error: deleteError.message }, { status: 500 });
  }

  return Response.json({ success: true });
}

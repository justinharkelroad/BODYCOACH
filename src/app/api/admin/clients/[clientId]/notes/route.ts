import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { data: notes, error } = await supabase
    .from('coach_notes')
    .select('*')
    .eq('coach_id', user.id)
    .eq('client_id', clientId)
    .order('created_at', { ascending: false });

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ notes });
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { content } = await request.json();
  if (!content || typeof content !== 'string') {
    return Response.json({ error: 'Content is required' }, { status: 400 });
  }

  const { data: note, error } = await supabase
    .from('coach_notes')
    .insert({ coach_id: user.id, client_id: clientId, content })
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ note });
}

export async function PUT(
  request: NextRequest,
) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { noteId, content } = await request.json();
  if (!noteId || !content) {
    return Response.json({ error: 'noteId and content are required' }, { status: 400 });
  }

  const { error } = await supabase
    .from('coach_notes')
    .update({ content, updated_at: new Date().toISOString() })
    .eq('id', noteId)
    .eq('coach_id', user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

export async function DELETE(
  request: NextRequest,
) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const noteId = searchParams.get('noteId');
  if (!noteId) return Response.json({ error: 'noteId is required' }, { status: 400 });

  const { error } = await supabase
    .from('coach_notes')
    .delete()
    .eq('id', noteId)
    .eq('coach_id', user.id);

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ success: true });
}

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

  const { data: plan } = await supabase
    .from('client_macro_plans')
    .select('*')
    .eq('client_id', clientId)
    .single();

  return Response.json({ plan });
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ clientId: string }> }
) {
  const { clientId } = await params;
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  const { calories, protein, carbs, fat, notes } = await request.json();

  if (!calories || !protein || !carbs || !fat) {
    return Response.json({ error: 'All macro fields are required' }, { status: 400 });
  }

  const { data: plan, error } = await supabase
    .from('client_macro_plans')
    .upsert(
      {
        coach_id: user.id,
        client_id: clientId,
        calories: parseInt(calories),
        protein: parseInt(protein),
        carbs: parseInt(carbs),
        fat: parseInt(fat),
        notes: notes || null,
        updated_at: new Date().toISOString(),
      },
      { onConflict: 'client_id' }
    )
    .select()
    .single();

  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json({ plan });
}

import { NextRequest } from 'next/server';
import { createClientForApi } from '@/lib/supabase/server';
import { sendEmail, weeklyCheckinFormEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  const supabase = await createClientForApi(request);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

  // Verify coach role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  if (!profile || profile.role !== 'coach') {
    return Response.json({ error: 'Forbidden' }, { status: 403 });
  }

  // Get all active clients
  const { data: relationships } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('coach_id', user.id)
    .eq('status', 'active');

  if (!relationships || relationships.length === 0) {
    return Response.json({ error: 'No active clients' }, { status: 400 });
  }

  const clientIds = relationships.map(r => r.client_id);

  // Fetch client profiles for names and emails
  const { data: clients } = await supabase
    .from('profiles')
    .select('email, full_name')
    .in('id', clientIds);

  // Send emails
  const results = [];
  for (const client of clients || []) {
    const name = client.full_name?.split(' ')[0] || 'there';
    const emailContent = weeklyCheckinFormEmail(name);

    const result = await sendEmail({
      to: client.email,
      subject: emailContent.subject,
      html: emailContent.html,
    });

    results.push({ email: client.email, ...result });
  }

  const sent = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;

  return Response.json({
    success: true,
    sent,
    failed,
    total: results.length,
  });
}

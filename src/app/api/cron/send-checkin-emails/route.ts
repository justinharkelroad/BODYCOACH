import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { sendEmail, weeklyCheckinFormEmail } from '@/lib/notifications/email';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  // Verify this is called by Vercel Cron (not a random visitor)
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Use service role key to bypass RLS
  const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );

  // Get today's day (0=Sun, 1=Mon, ..., 6=Sat)
  const today = new Date().getDay();

  // Find all active clients whose check-in day is today
  const { data: relationships } = await supabase
    .from('coach_clients')
    .select('client_id')
    .eq('status', 'active')
    .eq('checkin_day', today);

  if (!relationships || relationships.length === 0) {
    return Response.json({ message: 'No clients scheduled for today', sent: 0 });
  }

  const clientIds = relationships.map(r => r.client_id);

  // Fetch client profiles
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
    message: `Sent ${sent} check-in emails for day ${today}`,
    sent,
    failed,
    total: results.length,
  });
}

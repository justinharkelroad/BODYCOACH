// Supabase Edge Function: process-notifications
// Runs every 5 minutes to send pending notifications

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Notification {
  id: string;
  user_id: string;
  channel: string;
  notification_type: string;
  subject: string | null;
  body: string;
  metadata: Record<string, unknown> | null;
  scheduled_for: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const fromEmail = Deno.env.get('NOTIFICATION_FROM_EMAIL') || 'BODYCOACH <notifications@bodyglowai.com>';

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const resendApiKey = Deno.env.get('RESEND_API_KEY');
    const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
    const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
    const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Get pending notifications scheduled for now or earlier
    const now = new Date().toISOString();
    const { data: notifications, error: fetchError } = await supabase
      .from('notifications')
      .select('*')
      .is('sent_at', null)
      .is('failed_at', null)
      .lte('scheduled_for', now)
      .limit(50);

    if (fetchError) {
      throw new Error(`Failed to fetch notifications: ${fetchError.message}`);
    }

    let sent = 0;
    let failed = 0;

    for (const notification of (notifications || []) as Notification[]) {
      try {
        // Get user profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('email, full_name, phone')
          .eq('id', notification.user_id)
          .single() as { data: Profile | null };

        if (!profile) {
          throw new Error('User profile not found');
        }

        let success = false;

        if (notification.channel === 'email' && resendApiKey) {
          // Send email via Resend
          const response = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${resendApiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              from: fromEmail,
              to: profile.email,
              subject: notification.subject || 'BODYCOACH Notification',
              html: notification.body,
            }),
          });

          success = response.ok;
          if (!success) {
            const error = await response.text();
            throw new Error(`Resend error: ${error}`);
          }
        } else if (notification.channel === 'sms' && twilioSid && twilioToken && twilioPhone && profile.phone) {
          // Send SMS via Twilio
          const formattedPhone = profile.phone.startsWith('+') ? profile.phone : `+1${profile.phone.replace(/\D/g, '')}`;

          const response = await fetch(
            `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
            {
              method: 'POST',
              headers: {
                'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
                'Content-Type': 'application/x-www-form-urlencoded',
              },
              body: new URLSearchParams({
                From: twilioPhone,
                To: formattedPhone,
                Body: notification.body.replace(/<[^>]*>/g, ''), // Strip HTML
              }),
            }
          );

          success = response.ok;
          if (!success) {
            const error = await response.text();
            throw new Error(`Twilio error: ${error}`);
          }
        } else if (notification.channel === 'push') {
          // Push notifications not implemented yet
          console.log('Push notifications not implemented');
          success = false;
        }

        if (success) {
          // Mark as sent
          await supabase
            .from('notifications')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', notification.id);
          sent++;
        } else {
          throw new Error('Channel not configured or no recipient');
        }
      } catch (error) {
        // Mark as failed
        await supabase
          .from('notifications')
          .update({
            failed_at: new Date().toISOString(),
            error_message: error.message,
          })
          .eq('id', notification.id);
        failed++;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        processed: (notifications || []).length,
        sent,
        failed,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});

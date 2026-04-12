// Supabase Edge Function: escalate-missed
// Runs hourly to send escalation notifications for missed check-ins

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CheckIn {
  id: string;
  user_id: string;
  check_in_type: string;
  scheduled_for: string;
}

interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  phone: string | null;
  notification_preferences: {
    email: boolean;
    sms: boolean;
    push: boolean;
  };
}

// Escalation thresholds in hours
const ESCALATION_THRESHOLDS: Record<string, number> = {
  daily_weight: 2,
  workout_reminder: 4,
  photo_reminder: 24,
  nutrition_check: 2,
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const now = new Date();
    let escalationsCreated = 0;

    // Get missed check-ins (not completed, not skipped, past scheduled time)
    const { data: missedCheckIns, error: fetchError } = await supabase
      .from('check_ins')
      .select('*')
      .is('completed_at', null)
      .eq('skipped', false)
      .lt('scheduled_for', now.toISOString());

    if (fetchError) {
      throw new Error(`Failed to fetch check-ins: ${fetchError.message}`);
    }

    for (const checkIn of (missedCheckIns || []) as CheckIn[]) {
      const scheduledTime = new Date(checkIn.scheduled_for);
      const hoursSinceMissed = (now.getTime() - scheduledTime.getTime()) / (1000 * 60 * 60);
      const threshold = ESCALATION_THRESHOLDS[checkIn.check_in_type] || 2;

      // Check if past escalation threshold
      if (hoursSinceMissed >= threshold) {
        // Check if escalation notification already sent
        const todayStart = new Date(now);
        todayStart.setHours(0, 0, 0, 0);

        const { data: existingNotification } = await supabase
          .from('notifications')
          .select('id')
          .eq('user_id', checkIn.user_id)
          .eq('notification_type', 'missed_checkin')
          .gte('scheduled_for', todayStart.toISOString())
          .limit(1);

        if (!existingNotification || existingNotification.length === 0) {
          // Get user profile for notification preferences
          const { data: profile } = await supabase
            .from('profiles')
            .select('full_name, notification_preferences')
            .eq('id', checkIn.user_id)
            .single() as { data: Profile | null };

          if (profile) {
            const name = profile.full_name || 'there';
            const checkInLabel = checkIn.check_in_type.replace('_', ' ');

            // Create escalation notification(s) based on preferences
            const channels: string[] = [];
            if (profile.notification_preferences?.email) channels.push('email');
            if (profile.notification_preferences?.sms) channels.push('sms');

            for (const channel of channels) {
              const body = channel === 'email'
                ? `<div style="font-family: sans-serif; max-width: 500px; margin: 0 auto; padding: 20px;">
                    <h2>Hey ${name},</h2>
                    <p>We noticed you missed your ${checkInLabel} check-in today. No worries - life happens!</p>
                    <p>But consistency is important for reaching your goals. Can you take a moment to log it now?</p>
                    <a href="${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://bodycoach.app'}/check-in"
                       style="display: inline-block; background: #6c5ce7; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; margin-top: 16px;">
                      Complete Check-in
                    </a>
                  </div>`
                : `Hey ${name}, you missed your ${checkInLabel} check-in. Take a sec to log it: ${Deno.env.get('NEXT_PUBLIC_APP_URL') || 'https://bodycoach.app'}/check-in`;

              await supabase.from('notifications').insert({
                user_id: checkIn.user_id,
                channel,
                notification_type: 'missed_checkin',
                subject: 'We missed you today',
                body,
                metadata: { check_in_id: checkIn.id, check_in_type: checkIn.check_in_type },
                scheduled_for: now.toISOString(),
              });

              escalationsCreated++;
            }
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        missedCheckIns: (missedCheckIns || []).length,
        escalationsCreated,
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

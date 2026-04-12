// Supabase Edge Function: schedule-check-ins
// Runs daily to create check-in records based on user commitments

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Commitment {
  id: string;
  user_id: string;
  commitment_type: string;
  frequency: string;
  days_of_week: number[] | null;
  time_of_day: string | null;
  active: boolean;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const today = new Date();
    const dayOfWeek = today.getDay(); // 0 = Sunday

    // Get all active commitments
    const { data: commitments, error: commitmentError } = await supabase
      .from('commitments')
      .select('*')
      .eq('active', true);

    if (commitmentError) {
      throw new Error(`Failed to fetch commitments: ${commitmentError.message}`);
    }

    let checkInsCreated = 0;

    for (const commitment of (commitments || []) as Commitment[]) {
      let shouldCreateCheckIn = false;

      if (commitment.frequency === 'daily') {
        shouldCreateCheckIn = true;
      } else if (commitment.frequency === 'weekly' && commitment.days_of_week) {
        shouldCreateCheckIn = commitment.days_of_week.includes(dayOfWeek);
      }

      if (shouldCreateCheckIn) {
        // Calculate scheduled time
        const scheduledFor = new Date(today);
        if (commitment.time_of_day) {
          const [hours, minutes] = commitment.time_of_day.split(':').map(Number);
          scheduledFor.setHours(hours, minutes, 0, 0);
        } else {
          scheduledFor.setHours(8, 0, 0, 0); // Default to 8 AM
        }

        // Map commitment type to check-in type
        const checkInTypeMap: Record<string, string> = {
          weigh_in: 'daily_weight',
          workout: 'workout_reminder',
          photo: 'photo_reminder',
          nutrition: 'nutrition_check',
        };

        const checkInType = checkInTypeMap[commitment.commitment_type] || commitment.commitment_type;

        // Check if check-in already exists for today
        const todayStart = new Date(today);
        todayStart.setHours(0, 0, 0, 0);
        const todayEnd = new Date(today);
        todayEnd.setHours(23, 59, 59, 999);

        const { data: existing } = await supabase
          .from('check_ins')
          .select('id')
          .eq('user_id', commitment.user_id)
          .eq('check_in_type', checkInType)
          .gte('scheduled_for', todayStart.toISOString())
          .lte('scheduled_for', todayEnd.toISOString())
          .limit(1);

        if (!existing || existing.length === 0) {
          // Create the check-in
          const { error: insertError } = await supabase
            .from('check_ins')
            .insert({
              user_id: commitment.user_id,
              check_in_type: checkInType,
              scheduled_for: scheduledFor.toISOString(),
            });

          if (!insertError) {
            checkInsCreated++;
          }
        }
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: `Created ${checkInsCreated} check-ins`,
        date: today.toISOString().split('T')[0],
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

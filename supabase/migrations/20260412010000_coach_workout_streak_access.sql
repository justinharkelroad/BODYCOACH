-- Coach access to workout_logs, workout_exercises, and user_streaks
-- Allows coaches to view their clients' workout and streak data in the admin dashboard

-- Coach can view client workout logs
CREATE POLICY "Coaches can view client workouts"
  ON public.workout_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = workout_logs.user_id
        AND coach_clients.status = 'active'
    )
  );

-- Coach can view client workout exercises (via workout_logs ownership)
CREATE POLICY "Coaches can view client workout exercises"
  ON public.workout_exercises FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.workout_logs
      JOIN public.coach_clients ON coach_clients.client_id = workout_logs.user_id
      WHERE workout_logs.id = workout_exercises.workout_log_id
        AND coach_clients.coach_id = auth.uid()
        AND coach_clients.status = 'active'
    )
  );

-- Coach can view client streaks
CREATE POLICY "Coaches can view client streaks"
  ON public.user_streaks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = user_streaks.user_id
        AND coach_clients.status = 'active'
    )
  );

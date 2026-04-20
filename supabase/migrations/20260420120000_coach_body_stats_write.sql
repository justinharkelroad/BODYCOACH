-- Let coaches write body_stats for their active clients (for coach-entered weigh-ins)

CREATE POLICY "Coaches can insert client stats"
  ON public.body_stats FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = body_stats.user_id
        AND coach_clients.status = 'active'
    )
  );

CREATE POLICY "Coaches can update client stats"
  ON public.body_stats FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = body_stats.user_id
        AND coach_clients.status = 'active'
    )
  );

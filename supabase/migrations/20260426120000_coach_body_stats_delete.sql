-- Let coaches delete body_stats for their active clients (for fixing mistyped weigh-ins)

CREATE POLICY "Coaches can delete client stats"
  ON public.body_stats FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = body_stats.user_id
        AND coach_clients.status = 'active'
    )
  );

-- Fix: Allow coaches to view archived client profiles (for reactivation UI)
-- The original policy filtered on status = 'active', which prevented
-- the coach from seeing archived client names/emails.

DROP POLICY IF EXISTS "Coaches can view client profiles" ON public.profiles;

CREATE POLICY "Coaches can view client profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = profiles.id
    )
  );

-- Coach Dashboard: roles, coach-client relationships, and cross-user RLS policies

-- 1. Add role column to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'client';

-- 2. Set coach role for Corina (case-insensitive match)
UPDATE public.profiles SET role = 'coach' WHERE lower(email) = lower('Corinahark@gmail.com');

-- 3. Create coach_clients junction table
CREATE TABLE public.coach_clients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  status text NOT NULL DEFAULT 'active',
  created_at timestamptz DEFAULT now(),
  UNIQUE(coach_id, client_id)
);

CREATE INDEX idx_coach_clients_coach ON public.coach_clients(coach_id);
CREATE INDEX idx_coach_clients_client ON public.coach_clients(client_id);

ALTER TABLE public.coach_clients ENABLE ROW LEVEL SECURITY;

-- Coaches can view their own client relationships
CREATE POLICY "Coaches can view own clients"
  ON public.coach_clients FOR SELECT
  USING (auth.uid() = coach_id);

-- Coaches can manage (insert/update/delete) their own client relationships
CREATE POLICY "Coaches can manage own clients"
  ON public.coach_clients FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

-- Clients can see who coaches them
CREATE POLICY "Clients can view own coach"
  ON public.coach_clients FOR SELECT
  USING (auth.uid() = client_id);

-- 4. Auto-assign trigger: new signups become clients of the coach
CREATE OR REPLACE FUNCTION public.auto_assign_coach()
RETURNS TRIGGER AS $$
DECLARE
  coach_user_id uuid;
BEGIN
  -- Skip if the new user IS a coach
  IF NEW.role = 'coach' THEN
    RETURN NEW;
  END IF;

  -- Find the coach
  SELECT id INTO coach_user_id FROM public.profiles WHERE role = 'coach' LIMIT 1;

  -- If a coach exists, create the relationship
  IF coach_user_id IS NOT NULL AND coach_user_id != NEW.id THEN
    INSERT INTO public.coach_clients (coach_id, client_id, status)
    VALUES (coach_user_id, NEW.id, 'active')
    ON CONFLICT (coach_id, client_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_profile_created_assign_coach
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_coach();

-- 5. Backfill: assign all existing non-coach users to the coach
INSERT INTO public.coach_clients (coach_id, client_id, status)
SELECT
  coach.id,
  client.id,
  'active'
FROM public.profiles coach
CROSS JOIN public.profiles client
WHERE coach.role = 'coach'
  AND client.role = 'client'
  AND coach.id != client.id
ON CONFLICT (coach_id, client_id) DO NOTHING;

-- 6. RLS policies for coach data access
-- These are additive SELECT policies; Supabase uses OR logic between same-operation policies

-- Coach can view client profiles
CREATE POLICY "Coaches can view client profiles"
  ON public.profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = profiles.id
        AND coach_clients.status = 'active'
    )
  );

-- Coach can view client body stats
CREATE POLICY "Coaches can view client stats"
  ON public.body_stats FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = body_stats.user_id
        AND coach_clients.status = 'active'
    )
  );

-- Coach can view client progress photos
CREATE POLICY "Coaches can view client photos"
  ON public.progress_photos FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = progress_photos.user_id
        AND coach_clients.status = 'active'
    )
  );

-- Coach can view client daily check-ins
CREATE POLICY "Coaches can view client checkins"
  ON public.daily_checkins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = daily_checkins.user_id
        AND coach_clients.status = 'active'
    )
  );

-- 7. Storage policy: coach can view client progress photos in storage bucket
CREATE POLICY "Coaches can view client progress photos"
  ON storage.objects FOR SELECT
  USING (
    bucket_id = 'progress-photos' AND
    EXISTS (
      SELECT 1 FROM public.coach_clients
      WHERE coach_clients.coach_id = auth.uid()
        AND coach_clients.client_id = (storage.foldername(name))[1]::uuid
        AND coach_clients.status = 'active'
    )
  );

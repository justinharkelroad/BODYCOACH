-- App Simplification: new check-in fields, coach notes, client macro plans, coach settings

-- 1. Add new check-in fields (keep old columns for historical data)
ALTER TABLE public.daily_checkins ADD COLUMN IF NOT EXISTS sleep_hours integer;
ALTER TABLE public.daily_checkins ADD COLUMN IF NOT EXISTS water_oz integer;
ALTER TABLE public.daily_checkins ADD COLUMN IF NOT EXISTS stress_level integer;

-- 2. Coach notes table
CREATE TABLE public.coach_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

CREATE INDEX idx_coach_notes_client ON public.coach_notes(coach_id, client_id);

ALTER TABLE public.coach_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Coaches can manage own notes"
  ON public.coach_notes FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

-- 3. Client macro plans table
CREATE TABLE public.client_macro_plans (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  coach_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  client_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  calories integer NOT NULL,
  protein integer NOT NULL,
  carbs integer NOT NULL,
  fat integer NOT NULL,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(client_id)
);

CREATE INDEX idx_client_macro_plans_client ON public.client_macro_plans(client_id);

ALTER TABLE public.client_macro_plans ENABLE ROW LEVEL SECURITY;

-- Coaches can manage macro plans for their clients
CREATE POLICY "Coaches can manage client macro plans"
  ON public.client_macro_plans FOR ALL
  USING (auth.uid() = coach_id)
  WITH CHECK (auth.uid() = coach_id);

-- Clients can view their own macro plan
CREATE POLICY "Clients can view own macro plan"
  ON public.client_macro_plans FOR SELECT
  USING (auth.uid() = client_id);

-- 4. Coach settings on profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS coach_settings jsonb DEFAULT '{}';

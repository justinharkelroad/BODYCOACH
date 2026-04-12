-- Per-purchase access codes issued after Stripe checkout completes.
-- The Stripe webhook inserts a row; the signup route consumes it.

CREATE TABLE public.access_codes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code text NOT NULL UNIQUE,
  buyer_email text NOT NULL,
  buyer_name text,
  stripe_session_id text UNIQUE,
  used_at timestamptz,
  used_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX idx_access_codes_code ON public.access_codes(code) WHERE used_at IS NULL;
CREATE INDEX idx_access_codes_session ON public.access_codes(stripe_session_id);

ALTER TABLE public.access_codes ENABLE ROW LEVEL SECURITY;

-- Only coaches can read access codes (for audit/debugging in admin).
CREATE POLICY "Coaches can view access codes"
  ON public.access_codes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid()
        AND profiles.role = 'coach'
    )
  );

-- Inserts and updates happen via the service role from /api/stripe/webhook and
-- /api/auth/signup; RLS denies everything else by default.

-- THE TEST TROOP: PUBLIC CONTEST REGISTRATION FORM (NO LOGIN REQUIRED)
-- Copy and paste into Supabase Dashboard -> SQL Editor -> Run

-- 1. Registrations no longer require a logged-in user_id (public visitors register directly)
ALTER TABLE public.contest_registrations ALTER COLUMN user_id DROP NOT NULL;

ALTER TABLE public.contest_registrations
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS mobile_number TEXT,
  ADD COLUMN IF NOT EXISTS linkedin_url TEXT,
  ADD COLUMN IF NOT EXISTS city_state TEXT,
  ADD COLUMN IF NOT EXISTS age_confirmed BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS consent_temp_account BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS rules_acknowledged BOOLEAN DEFAULT FALSE NOT NULL,
  ADD COLUMN IF NOT EXISTS rules_acknowledged_at TIMESTAMPTZ;

-- One registration per email per contest (case-insensitive)
DROP INDEX IF EXISTS contest_registrations_contest_email_idx;
CREATE UNIQUE INDEX contest_registrations_contest_email_idx
  ON public.contest_registrations (contest_id, lower(email))
  WHERE email IS NOT NULL;

-- 2. Rule-decline log — records anyone who declined the Bugathon rules, with their reason
CREATE TABLE IF NOT EXISTS public.contest_rule_declines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    full_name TEXT,
    email TEXT,
    mobile_number TEXT,
    reason TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

ALTER TABLE public.contest_rule_declines ENABLE ROW LEVEL SECURITY;

-- 3. RLS — registrations now hold PII (email, mobile, LinkedIn), so only admins may read them.
-- Public (anonymous) visitors may only INSERT a registration, and only when they have
-- confirmed age, consent, and rules acknowledgement — enforced at the database layer too.
DROP POLICY IF EXISTS "Public can view all registrations" ON public.contest_registrations;
DROP POLICY IF EXISTS "Users can register for open contests" ON public.contest_registrations;

CREATE POLICY "Admins can view registrations" ON public.contest_registrations
    FOR SELECT USING (public.is_admin());

CREATE POLICY "Public can register with full consent" ON public.contest_registrations
    FOR INSERT WITH CHECK (
        age_confirmed = TRUE
        AND consent_temp_account = TRUE
        AND rules_acknowledged = TRUE
    );

DROP POLICY IF EXISTS "Admins can view rule declines" ON public.contest_rule_declines;
CREATE POLICY "Admins can view rule declines" ON public.contest_rule_declines
    FOR SELECT USING (public.is_admin());

DROP POLICY IF EXISTS "Public can log rule declines" ON public.contest_rule_declines;
CREATE POLICY "Public can log rule declines" ON public.contest_rule_declines
    FOR INSERT WITH CHECK (true);

-- THE TEST TROOP: SUBMISSION LOGIN, BUG REPORTS & POST-TEST FEEDBACK (NO ACCOUNT REQUIRED)
-- Copy and paste into Supabase Dashboard -> SQL Editor -> Run

-- 1. Contest credentials live on the registration row (temporary, per-contest)
ALTER TABLE public.contest_registrations
  ADD COLUMN IF NOT EXISTS temp_password TEXT,
  ADD COLUMN IF NOT EXISTS promo_code TEXT,
  ADD COLUMN IF NOT EXISTS credentials_sent_at TIMESTAMPTZ;

DROP POLICY IF EXISTS "Admins can update registrations" ON public.contest_registrations;
CREATE POLICY "Admins can update registrations" ON public.contest_registrations
    FOR UPDATE USING (public.is_admin());

-- 2. Submissions / bug reports / UI feedback / suggestions now key off the
--    registration (no account exists to key off user_id anymore).
ALTER TABLE public.submissions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES public.contest_registrations(id) ON DELETE CASCADE;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS is_late BOOLEAN DEFAULT FALSE NOT NULL;
ALTER TABLE public.submissions DROP CONSTRAINT IF EXISTS submissions_contest_id_user_id_key;
DROP INDEX IF EXISTS submissions_contest_registration_idx;
CREATE UNIQUE INDEX submissions_contest_registration_idx
  ON public.submissions (contest_id, registration_id) WHERE registration_id IS NOT NULL;

ALTER TABLE public.bug_reports ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.bug_reports ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES public.contest_registrations(id) ON DELETE CASCADE;

ALTER TABLE public.ui_feedback ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.ui_feedback ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES public.contest_registrations(id) ON DELETE CASCADE;

ALTER TABLE public.suggestions ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.suggestions ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES public.contest_registrations(id) ON DELETE CASCADE;

ALTER TABLE public.contest_reviews ALTER COLUMN user_id DROP NOT NULL;
ALTER TABLE public.contest_reviews ADD COLUMN IF NOT EXISTS registration_id UUID REFERENCES public.contest_registrations(id) ON DELETE CASCADE;

ALTER TABLE public.contest_winners ALTER COLUMN winner_user_id DROP NOT NULL;
ALTER TABLE public.contest_winners ADD COLUMN IF NOT EXISTS winner_registration_id UUID REFERENCES public.contest_registrations(id) ON DELETE SET NULL;

-- 3. Post-testing feedback (star rating, recommend, open-ended questions)
CREATE TABLE IF NOT EXISTS public.contest_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    registration_id UUID NOT NULL REFERENCES public.contest_registrations(id) ON DELETE CASCADE,
    improvement_point_1 TEXT,
    improvement_point_2 TEXT,
    improvement_point_3 TEXT,
    overall_rating SMALLINT CHECK (overall_rating BETWEEN 1 AND 5),
    would_recommend BOOLEAN,
    favorite_feature TEXT,
    missing_feature TEXT,
    contest_experience TEXT,
    contest_improvement_suggestion TEXT,
    is_late BOOLEAN DEFAULT FALSE NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(contest_id, registration_id)
);
ALTER TABLE public.contest_feedback ENABLE ROW LEVEL SECURITY;

-- 4. Secure login check for the submission page: given contest + email + temp
--    password, returns only the matching registration's id/name (never the
--    full row) — safe to expose to anonymous visitors.
CREATE OR REPLACE FUNCTION public.verify_submission_login(p_contest_id UUID, p_email TEXT, p_password TEXT)
RETURNS TABLE(registration_id UUID, full_name TEXT) AS $$
  SELECT id, full_name
  FROM public.contest_registrations
  WHERE contest_id = p_contest_id
    AND lower(email) = lower(p_email)
    AND temp_password IS NOT NULL
    AND temp_password = p_password
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

GRANT EXECUTE ON FUNCTION public.verify_submission_login(UUID, TEXT, TEXT) TO anon, authenticated;

-- 5. RLS — submission-pipeline tables now hold participant-authored content
-- tied to a registration rather than an auth user. Only admins may read;
-- anonymous visitors may insert only when tied to a real registration row
-- (registration ids are unguessable UUIDs, only known after a successful
-- verify_submission_login call).
DROP POLICY IF EXISTS "Users can view own submission" ON public.submissions;
DROP POLICY IF EXISTS "Users can create submission" ON public.submissions;
DROP POLICY IF EXISTS "Admins can view submissions" ON public.submissions;
CREATE POLICY "Admins can view submissions" ON public.submissions FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Registered testers can create submission" ON public.submissions;
CREATE POLICY "Registered testers can create submission" ON public.submissions
    FOR INSERT WITH CHECK (
        registration_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM public.contest_registrations r WHERE r.id = registration_id)
    );

DROP POLICY IF EXISTS "Users can view own bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Users can insert own bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Admins can view bug reports" ON public.bug_reports;
CREATE POLICY "Admins can view bug reports" ON public.bug_reports FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Registered testers can insert bug reports" ON public.bug_reports;
CREATE POLICY "Registered testers can insert bug reports" ON public.bug_reports
    FOR INSERT WITH CHECK (
        registration_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM public.contest_registrations r WHERE r.id = registration_id)
    );

DROP POLICY IF EXISTS "Users can view own UI feedback" ON public.ui_feedback;
DROP POLICY IF EXISTS "Users can insert own UI feedback" ON public.ui_feedback;
DROP POLICY IF EXISTS "Admins can view UI feedback" ON public.ui_feedback;
CREATE POLICY "Admins can view UI feedback" ON public.ui_feedback FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Registered testers can insert UI feedback" ON public.ui_feedback;
CREATE POLICY "Registered testers can insert UI feedback" ON public.ui_feedback
    FOR INSERT WITH CHECK (
        registration_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM public.contest_registrations r WHERE r.id = registration_id)
    );

DROP POLICY IF EXISTS "Users can view own suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Users can insert own suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Admins can view suggestions" ON public.suggestions;
CREATE POLICY "Admins can view suggestions" ON public.suggestions FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Registered testers can insert suggestions" ON public.suggestions;
CREATE POLICY "Registered testers can insert suggestions" ON public.suggestions
    FOR INSERT WITH CHECK (
        registration_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM public.contest_registrations r WHERE r.id = registration_id)
    );

DROP POLICY IF EXISTS "Admins can view contest feedback" ON public.contest_feedback;
CREATE POLICY "Admins can view contest feedback" ON public.contest_feedback FOR SELECT USING (public.is_admin());
DROP POLICY IF EXISTS "Registered testers can insert contest feedback" ON public.contest_feedback;
CREATE POLICY "Registered testers can insert contest feedback" ON public.contest_feedback
    FOR INSERT WITH CHECK (
        registration_id IS NOT NULL
        AND EXISTS (SELECT 1 FROM public.contest_registrations r WHERE r.id = registration_id)
    );

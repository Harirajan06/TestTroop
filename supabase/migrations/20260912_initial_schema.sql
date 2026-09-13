-- THE TEST TROOP: FULL DATABASE SCHEMA & RLS MIGRATION (IDEMPOTENT & CRASH-PROOF)
-- Copy and paste this complete script into your Supabase Dashboard -> SQL Editor -> Click "Run"

-- 1. Create Enums Safely
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE public.user_role AS ENUM ('user', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contest_status') THEN
        CREATE TYPE public.contest_status AS ENUM ('draft', 'registration_open', 'upcoming', 'testing_live', 'submission_closed', 'results_pending', 'winner_announced', 'completed');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'contest_type') THEN
        CREATE TYPE public.contest_type AS ENUM ('mobile_app', 'website', 'web_app', 'other');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'submission_category') THEN
        CREATE TYPE public.submission_category AS ENUM ('bug_report', 'ui_ux', 'suggestion');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'bug_severity') THEN
        CREATE TYPE public.bug_severity AS ENUM ('critical', 'high', 'medium', 'low', 'informational');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'review_status') THEN
        CREATE TYPE public.review_status AS ENUM ('pending', 'shortlisted', 'valid', 'invalid', 'rejected');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
        CREATE TYPE public.campaign_status AS ENUM ('draft', 'scheduled', 'sending', 'completed', 'failed');
    END IF;
END $$;

-- 2. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    mobile_number TEXT NOT NULL UNIQUE,
    avatar_url TEXT,
    role user_role DEFAULT 'user'::user_role NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 3. Contests Table
CREATE TABLE IF NOT EXISTS public.contests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL,
    contest_type contest_type NOT NULL,
    product_name TEXT NOT NULL,
    product_url TEXT,
    platform TEXT NOT NULL,
    banner_url TEXT,
    prize_amount NUMERIC(10,2) NOT NULL DEFAULT 0,
    currency TEXT DEFAULT 'INR' NOT NULL,
    status contest_status DEFAULT 'draft'::contest_status NOT NULL,
    
    registration_start TIMESTAMPTZ NOT NULL,
    registration_end TIMESTAMPTZ NOT NULL,
    contest_start TIMESTAMPTZ NOT NULL,
    contest_end TIMESTAMPTZ NOT NULL,
    submission_deadline TIMESTAMPTZ NOT NULL,
    result_date TIMESTAMPTZ NOT NULL,
    
    testing_instructions TEXT NOT NULL,
    eligibility_requirements TEXT,
    whatsapp_group_url TEXT,
    allowed_categories submission_category[] NOT NULL DEFAULT '{bug_report, ui_ux, suggestion}',
    custom_confirmation_message TEXT,
    
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. Contest Registrations Table
CREATE TABLE IF NOT EXISTS public.contest_registrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    registered_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(contest_id, user_id)
);

-- 5. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submitted_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(contest_id, user_id)
);

-- 6. Bug Reports Table
CREATE TABLE IF NOT EXISTS public.bug_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    steps_to_reproduce TEXT NOT NULL,
    expected_result TEXT NOT NULL,
    actual_result TEXT NOT NULL,
    severity bug_severity NOT NULL,
    device_platform TEXT NOT NULL,
    environment_version TEXT,
    screenshot_urls TEXT[] DEFAULT '{}',
    video_url TEXT,
    attachment_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 7. UI/UX Feedback Table
CREATE TABLE IF NOT EXISTS public.ui_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    current_problem TEXT NOT NULL,
    suggested_improvement TEXT NOT NULL,
    detailed_explanation TEXT,
    screenshot_urls TEXT[] DEFAULT '{}',
    attachment_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 8. Suggestions Table
CREATE TABLE IF NOT EXISTS public.suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    detailed_explanation TEXT,
    attachment_urls TEXT[] DEFAULT '{}',
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 9. Contest Reviews Table (Admin Judging System)
CREATE TABLE IF NOT EXISTS public.contest_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    submission_id UUID REFERENCES public.submissions(id) ON DELETE CASCADE,
    reviewer_id UUID NOT NULL REFERENCES public.profiles(id),
    
    bug_quality_score NUMERIC(4,2) DEFAULT 0,
    coverage_score NUMERIC(4,2) DEFAULT 0,
    ui_feedback_score NUMERIC(4,2) DEFAULT 0,
    suggestion_score NUMERIC(4,2) DEFAULT 0,
    overall_score NUMERIC(4,2) DEFAULT 0,
    
    review_status review_status DEFAULT 'pending'::review_status NOT NULL,
    internal_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
    UNIQUE(contest_id, user_id)
);

-- 10. Contest Winners Table
CREATE TABLE IF NOT EXISTS public.contest_winners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    contest_id UUID NOT NULL REFERENCES public.contests(id) ON DELETE CASCADE UNIQUE,
    winner_user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    prize_title TEXT NOT NULL,
    prize_amount NUMERIC(10,2) NOT NULL,
    announcement_headline TEXT NOT NULL,
    announcement_body TEXT NOT NULL,
    winning_summary TEXT,
    is_published BOOLEAN DEFAULT FALSE NOT NULL,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 11. Campaigns Table (Brevo Email Campaigns)
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    subject TEXT NOT NULL,
    contest_id UUID REFERENCES public.contests(id) ON DELETE SET NULL,
    recipient_filter TEXT NOT NULL,
    template_html TEXT NOT NULL,
    status campaign_status DEFAULT 'draft'::campaign_status NOT NULL,
    total_recipients INT DEFAULT 0,
    sent_count INT DEFAULT 0,
    failed_count INT DEFAULT 0,
    sent_at TIMESTAMPTZ,
    created_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 12. Campaign Recipients Table
CREATE TABLE IF NOT EXISTS public.campaign_recipients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    status TEXT DEFAULT 'pending',
    error_message TEXT,
    sent_at TIMESTAMPTZ
);

-- HELPER SECURITY FUNCTION: IS_ADMIN
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bug_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ui_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contest_winners ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_recipients ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if re-running
DROP POLICY IF EXISTS "Users can read own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public can view published contests" ON public.contests;
DROP POLICY IF EXISTS "Admins can manage contests" ON public.contests;
DROP POLICY IF EXISTS "Users can view own registrations" ON public.contest_registrations;
DROP POLICY IF EXISTS "Users can register for open contests" ON public.contest_registrations;
DROP POLICY IF EXISTS "Users can view own submission" ON public.submissions;
DROP POLICY IF EXISTS "Users can create submission" ON public.submissions;
DROP POLICY IF EXISTS "Users can view own bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Users can insert own bug reports" ON public.bug_reports;
DROP POLICY IF EXISTS "Users can view own UI feedback" ON public.ui_feedback;
DROP POLICY IF EXISTS "Users can insert own UI feedback" ON public.ui_feedback;
DROP POLICY IF EXISTS "Users can view own suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Users can insert own suggestions" ON public.suggestions;
DROP POLICY IF EXISTS "Only admins can access reviews" ON public.contest_reviews;
DROP POLICY IF EXISTS "Public can view published winners" ON public.contest_winners;
DROP POLICY IF EXISTS "Only admins can manage winners" ON public.contest_winners;
DROP POLICY IF EXISTS "Only admins can access campaigns" ON public.campaigns;
DROP POLICY IF EXISTS "Only admins can access campaign recipients" ON public.campaign_recipients;

-- Recreate Profiles Policies
CREATE POLICY "Public can read profiles" ON public.profiles
    FOR SELECT USING (true);

CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id OR public.is_admin());

-- Recreate Contests Policies
CREATE POLICY "Public can view published contests" ON public.contests
    FOR SELECT USING (status != 'draft' OR public.is_admin());

CREATE POLICY "Admins can manage contests" ON public.contests
    FOR ALL USING (public.is_admin());

-- Recreate Registrations Policies
CREATE POLICY "Public can view all registrations" ON public.contest_registrations
    FOR SELECT USING (true);

CREATE POLICY "Users can register for open contests" ON public.contest_registrations
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recreate Submissions Policies
CREATE POLICY "Users can view own submission" ON public.submissions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can create submission" ON public.submissions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recreate Bug Reports, UI Feedback, Suggestions Policies
CREATE POLICY "Users can view own bug reports" ON public.bug_reports
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own bug reports" ON public.bug_reports
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own UI feedback" ON public.ui_feedback
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own UI feedback" ON public.ui_feedback
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own suggestions" ON public.suggestions
    FOR SELECT USING (auth.uid() = user_id OR public.is_admin());

CREATE POLICY "Users can insert own suggestions" ON public.suggestions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Recreate Reviews (Judging) Policies: STRICT ADMIN ONLY
CREATE POLICY "Only admins can access reviews" ON public.contest_reviews
    FOR ALL USING (public.is_admin());

-- Recreate Winners Policies
CREATE POLICY "Public can view published winners" ON public.contest_winners
    FOR SELECT USING (is_published = true OR public.is_admin());

CREATE POLICY "Only admins can manage winners" ON public.contest_winners
    FOR ALL USING (public.is_admin());

-- Recreate Campaigns Policies: STRICT ADMIN ONLY
CREATE POLICY "Only admins can access campaigns" ON public.campaigns
    FOR ALL USING (public.is_admin());

CREATE POLICY "Only admins can access campaign recipients" ON public.campaign_recipients
    FOR ALL USING (public.is_admin());

-- 13. BULLETPROOF PROFILE TRIGGER ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, mobile_number, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'Tester'),
    new.email,
    COALESCE(new.raw_user_meta_data->>'mobile_number', ''),
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'user'::public.user_role)
  )
  ON CONFLICT (id) DO UPDATE SET
    full_name = EXCLUDED.full_name,
    email = EXCLUDED.email,
    mobile_number = EXCLUDED.mobile_number,
    role = EXCLUDED.role,
    updated_at = NOW();
  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

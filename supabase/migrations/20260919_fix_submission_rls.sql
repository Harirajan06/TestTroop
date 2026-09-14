-- THE TEST TROOP: FIX SUBMISSION-PIPELINE RLS (broken by a hidden RLS-on-RLS bug)
-- Copy and paste into Supabase Dashboard -> SQL Editor -> Run
--
-- The previous INSERT policies checked
--   EXISTS (SELECT 1 FROM contest_registrations r WHERE r.id = registration_id)
-- but contest_registrations only allows admins to SELECT — so that subquery
-- always returned nothing for anonymous visitors, and every insert was
-- rejected ("new row violates row-level security policy"). The registration_id
-- foreign key constraint already guarantees the row exists, so the EXISTS
-- check was both redundant and silently broken. This drops it.

DROP POLICY IF EXISTS "Registered testers can create submission" ON public.submissions;
CREATE POLICY "Registered testers can create submission" ON public.submissions
    FOR INSERT WITH CHECK (registration_id IS NOT NULL);

DROP POLICY IF EXISTS "Registered testers can insert bug reports" ON public.bug_reports;
CREATE POLICY "Registered testers can insert bug reports" ON public.bug_reports
    FOR INSERT WITH CHECK (registration_id IS NOT NULL);

DROP POLICY IF EXISTS "Registered testers can insert UI feedback" ON public.ui_feedback;
CREATE POLICY "Registered testers can insert UI feedback" ON public.ui_feedback
    FOR INSERT WITH CHECK (registration_id IS NOT NULL);

DROP POLICY IF EXISTS "Registered testers can insert suggestions" ON public.suggestions;
CREATE POLICY "Registered testers can insert suggestions" ON public.suggestions
    FOR INSERT WITH CHECK (registration_id IS NOT NULL);

DROP POLICY IF EXISTS "Registered testers can insert contest feedback" ON public.contest_feedback;
CREATE POLICY "Registered testers can insert contest feedback" ON public.contest_feedback
    FOR INSERT WITH CHECK (registration_id IS NOT NULL);

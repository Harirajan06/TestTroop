-- THE TEST TROOP: EXTRA BUG REPORT FIELDS (Bug Type, Priority, Brand/Model)
-- Copy and paste into Supabase Dashboard -> SQL Editor -> Run

ALTER TABLE public.bug_reports
  ADD COLUMN IF NOT EXISTS bug_type TEXT,
  ADD COLUMN IF NOT EXISTS priority TEXT,
  ADD COLUMN IF NOT EXISTS brand_model TEXT;

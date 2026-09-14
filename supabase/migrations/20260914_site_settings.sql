-- THE TEST TROOP: SITE SETTINGS (NAV VISIBILITY TOGGLES)
-- Copy and paste into Supabase Dashboard -> SQL Editor -> Run

CREATE TABLE IF NOT EXISTS public.site_settings (
    id TEXT PRIMARY KEY DEFAULT 'global',
    contests_visible BOOLEAN DEFAULT TRUE NOT NULL,
    winners_visible BOOLEAN DEFAULT TRUE NOT NULL,
    learn_visible BOOLEAN DEFAULT TRUE NOT NULL,
    community_visible BOOLEAN DEFAULT TRUE NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

INSERT INTO public.site_settings (id)
VALUES ('global')
ON CONFLICT (id) DO NOTHING;

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public can read site settings" ON public.site_settings;
CREATE POLICY "Public can read site settings" ON public.site_settings
    FOR SELECT USING (true);

DROP POLICY IF EXISTS "Admins can manage site settings" ON public.site_settings;
CREATE POLICY "Admins can manage site settings" ON public.site_settings
    FOR ALL USING (public.is_admin());

-- THE TEST TROOP: MOBILE APP CONTEST LOGIN SWITCH
-- Copy and paste into Supabase Dashboard -> SQL Editor -> Run
--
-- Adds the on/off switch the CalJin AI app checks on every launch to decide
-- whether to show its contest login screen. Turning this off removes the
-- login screen from the app for everyone (already-installed users included)
-- without an app update.

ALTER TABLE public.site_settings
    ADD COLUMN IF NOT EXISTS mobile_app_login_enabled BOOLEAN DEFAULT TRUE NOT NULL;

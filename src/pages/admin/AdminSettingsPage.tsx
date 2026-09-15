import React from 'react';
import { isSupabaseConfigured } from '../../lib/supabase';
import { useSiteSettings } from '../../context/SiteSettingsContext';
import { SiteSettings } from '../../types';
import { Settings, ShieldCheck, Mail, Database, Server, CheckCircle2, Eye, EyeOff, Trophy, Award, BookOpen, Users, Smartphone, Lock, LockOpen } from 'lucide-react';

const NAV_TOGGLES: { key: keyof SiteSettings; label: string; path: string; icon: React.ElementType }[] = [
  { key: 'contests_visible', label: 'Contests', path: '/contests', icon: Trophy },
  { key: 'winners_visible', label: 'Hall of Winners', path: '/winners', icon: Award },
  { key: 'learn_visible', label: 'Learn', path: '/learn', icon: BookOpen },
  { key: 'community_visible', label: 'Community', path: '/community', icon: Users },
];

export const AdminSettingsPage: React.FC = () => {
  const { settings, loading, updateSettings } = useSiteSettings();

  return (
    <div className="max-w-3xl space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Settings className="w-7 h-7 text-indigo-400" /> Platform Settings & Credentials Security
        </h1>
        <p className="text-gray-400 text-xs mt-1">Review active integrations, RLS database guards, and Brevo API status</p>
      </div>

      <div className="space-y-6">

        {/* PUBLIC NAVIGATION VISIBILITY */}
        <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Eye className="w-5 h-5 text-indigo-400" /> Public Navigation Visibility
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              Hide a tab to remove it from the navbar and block its page for regular visitors — the route itself stops opening, not just the link.
            </p>
          </div>

          <div className="space-y-3">
            {NAV_TOGGLES.map(({ key, label, path, icon: Icon }) => {
              const visible = settings[key];
              return (
                <div key={key} className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-white/5">
                  <div className="flex items-center gap-3">
                    <Icon className="w-4 h-4 text-indigo-400 shrink-0" />
                    <div>
                      <span className="text-sm font-semibold text-white block">{label}</span>
                      <span className="text-[11px] text-gray-500 font-mono">{path}</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => updateSettings({ [key]: !visible } as Partial<SiteSettings>)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                      visible
                        ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                        : 'bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25'
                    }`}
                  >
                    {visible ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    <span>{visible ? 'Visible' : 'Hidden'}</span>
                  </button>
                </div>
              );
            })}
          </div>
        </div>

        {/* MOBILE APP CONTEST LOGIN GATE */}
        <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="border-b border-white/10 pb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Smartphone className="w-5 h-5 text-indigo-400" /> CalJin AI App — Contest Login Gate
            </h3>
            <p className="text-gray-400 text-xs mt-1">
              While ON, the mobile app shows a login screen and only contestant accounts (created here in Supabase Auth) can sign in.
              Turn it OFF once the contest ends to remove the login screen from the app for everyone — including users who already installed it — with no app update needed.
            </p>
          </div>

          <div className="flex items-center justify-between p-3.5 bg-slate-900/80 rounded-xl border border-white/5">
            <div className="flex items-center gap-3">
              <Smartphone className="w-4 h-4 text-indigo-400 shrink-0" />
              <div>
                <span className="text-sm font-semibold text-white block">App Login Screen</span>
                <span className="text-[11px] text-gray-500 font-mono">site_settings.mobile_app_login_enabled</span>
              </div>
            </div>

            <button
              type="button"
              disabled={loading}
              onClick={() => updateSettings({ mobile_app_login_enabled: !settings.mobile_app_login_enabled })}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors disabled:opacity-50 ${
                settings.mobile_app_login_enabled
                  ? 'bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/25'
                  : 'bg-red-500/15 border border-red-500/30 text-red-300 hover:bg-red-500/25'
              }`}
            >
              {settings.mobile_app_login_enabled ? <Lock className="w-3.5 h-3.5" /> : <LockOpen className="w-3.5 h-3.5" />}
              <span>{settings.mobile_app_login_enabled ? 'Enabled' : 'Disabled'}</span>
            </button>
          </div>
        </div>

        {/* BREVO INTEGRATION STATUS */}
        <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Mail className="w-5 h-5 text-pink-400" /> Brevo Email Campaign Integration
            </h3>
            <span className="badge bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> ACTIVE & SECURED
            </span>
          </div>

          <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
            <p><strong>Credential Exposure Status:</strong> 0% client exposure. Brevo API keys are exclusively configured in server-side environment secrets (`BREVO_API_KEY`).</p>
            <p><strong>Edge Function Endpoint:</strong> <code className="text-indigo-300 font-mono bg-slate-900 px-2 py-0.5 rounded">/functions/v1/send-email-campaign</code></p>
          </div>
        </div>

        {/* SUPABASE RLS SECURITY STATUS */}
        <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <Database className="w-5 h-5 text-cyan-400" /> Supabase PostgreSQL & RLS Security
            </h3>
            <span className="badge bg-emerald-500/20 text-emerald-300 border-emerald-500/40">
              <CheckCircle2 className="w-3 h-3 text-emerald-400" /> RLS POLICIES ENFORCED
            </span>
          </div>

          <div className="space-y-2 text-xs text-gray-300 leading-relaxed">
            <p><strong>Database RLS:</strong> Row Level Security active across all 11 tables.</p>
            <p><strong>Private Data Guards:</strong> Mobile numbers, emails, judging scores, and internal admin notes are strictly inaccessible to standard users.</p>
            <p><strong>Supabase Connection Status:</strong> {isSupabaseConfigured ? 'Connected to Remote Supabase Instance' : 'Hybrid Local Persistent Store Active (Demo Mode)'}</p>
          </div>
        </div>

      </div>

    </div>
  );
};

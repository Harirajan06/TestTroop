import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  UserProfile,
  Contest,
  ContestRegistration,
  Submission,
  BugReport,
  UIFeedback,
  Suggestion,
  ContestReview,
  ContestWinner,
  Campaign,
  SiteSettings,
  ContestFeedback,
} from '../types';

const rawSupabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseUrl = rawSupabaseUrl.trim().replace(/\/rest\/v1\/?$/, '').replace(/\/+$/, '');
const supabaseAnonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  !supabaseUrl.includes('your-supabase-project-id') &&
  !supabaseUrl.includes('your-project-id') &&
  supabaseUrl.startsWith('https://') &&
  supabaseUrl.length > 25
);

export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// ─────────────────────────────────────────────────────────────
//  IN-MEMORY STORE  (single source of truth, NO localStorage)
// ─────────────────────────────────────────────────────────────
const mem = {
  users:         [] as UserProfile[],
  contests:      [] as Contest[],
  registrations: [] as ContestRegistration[],
  submissions:   [] as Submission[],
  bugReports:    [] as BugReport[],
  uiFeedback:    [] as UIFeedback[],
  suggestions:   [] as Suggestion[],
  reviews:       [] as ContestReview[],
  winners:       [] as ContestWinner[],
  campaigns:     [] as Campaign[],
  settings:      {
    contests_visible: true,
    winners_visible: true,
    learn_visible: true,
    community_visible: true,
  } as SiteSettings,
};

// Clean up any leftover localStorage from previous builds (the app now
// relies entirely on Supabase for persistence — no custom localStorage).
try {
  Object.keys(localStorage)
    .filter(k => k.startsWith('ttt_db_') || k === 'ttt_active_session_user')
    .forEach(k => localStorage.removeItem(k));
} catch (_) { /* ignore */ }

// ─────────────────────────────────────────────────────────────
//  DEFAULT CONTEST (seed when Supabase has no contests)
// ─────────────────────────────────────────────────────────────
export const DEFAULT_INITIAL_CONTEST: Contest = {
  id: '3b241101-e2bb-4255-8caf-4136c566a962',
  title: 'Calorie Tracker Application',
  slug: 'calorie-tracker-application',
  description:
    'This is AI Calorie Tracker Application you need to identify the Functional bugs, UI & UX bugs, Improvement Areas, Critical Mistake then notify to us by that we are going to consider you',
  contest_type: 'mobile_app',
  product_name: 'Calorie Tracker AI',
  product_url: 'https://mail.google.com/mail/u/0/?og...',
  platform: 'Android',
  banner_url:
    'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=1200&q=80',
  prize_amount: 1000,
  currency: 'INR',
  status: 'registration_open',
  registration_start: '2026-09-12T00:00:00.000Z',
  registration_end: '2026-09-15T23:59:59.000Z',
  contest_start: '2026-09-16T00:00:00.000Z',
  contest_end: '2026-09-25T23:59:59.000Z',
  submission_deadline: '2026-09-25T23:59:59.000Z',
  result_date: '2026-09-30T18:00:00.000Z',
  testing_instructions:
    'you need to identify the Functional bugs, UI & UX bugs, Improvement Areas, Critical Mistake then notify to us by that we are going to consider you and Join on the whatsapp group to know the update and results',
  eligibility_requirements: 'Open to all QA engineers and software testers.',
  allowed_categories: ['bug_report', 'ui_ux', 'suggestion'],
  registration_count: 0,
  submission_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

// ─────────────────────────────────────────────────────────────
//  STORE INITIALIZER  (call once at app start)
// ─────────────────────────────────────────────────────────────
let _initialized = false;
let _initPromise: Promise<void> | null = null;

export const initializeStore = (): Promise<void> => {
  if (_initialized) return Promise.resolve();
  if (_initPromise) return _initPromise;

  _initPromise = (async () => {
    if (!isSupabaseConfigured || !supabase) {
      mem.contests = [DEFAULT_INITIAL_CONTEST];
      _initialized = true;
      return;
    }

    try {
      const [
        { data: contests },
        { data: profiles },
        { data: registrations },
        { data: submissions },
        { data: bugReports },
        { data: uiFeedbackData },
        { data: suggestionsData },
        { data: reviews },
        { data: winners },
        { data: campaigns },
        { data: siteSettings },
      ] = await Promise.all([
        supabase.from('contests').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('*').order('created_at', { ascending: false }),
        supabase.from('contest_registrations').select('*').order('registered_at', { ascending: false }),
        supabase.from('submissions').select('*').order('submitted_at', { ascending: false }),
        supabase.from('bug_reports').select('*').order('created_at', { ascending: false }),
        supabase.from('ui_feedback').select('*').order('created_at', { ascending: false }),
        supabase.from('suggestions').select('*').order('created_at', { ascending: false }),
        supabase.from('contest_reviews').select('*'),
        supabase.from('contest_winners').select('*'),
        supabase.from('campaigns').select('*').order('created_at', { ascending: false }),
        supabase.from('site_settings').select('*').eq('id', 'global').maybeSingle(),
      ]);

      mem.contests      = (contests        || []) as Contest[];
      mem.users         = (profiles        || []) as UserProfile[];
      mem.registrations = (registrations   || []) as ContestRegistration[];
      mem.submissions   = (submissions     || []) as Submission[];
      mem.bugReports    = (bugReports      || []) as BugReport[];
      mem.uiFeedback    = (uiFeedbackData  || []) as UIFeedback[];
      mem.suggestions   = (suggestionsData || []) as Suggestion[];
      mem.reviews       = (reviews         || []) as ContestReview[];
      mem.winners       = (winners         || []) as ContestWinner[];
      mem.campaigns     = (campaigns       || []) as Campaign[];
      if (siteSettings) {
        mem.settings = {
          contests_visible: siteSettings.contests_visible,
          winners_visible: siteSettings.winners_visible,
          learn_visible: siteSettings.learn_visible,
          community_visible: siteSettings.community_visible,
        };
      } else {
        await supabase.from('site_settings').upsert({ id: 'global' });
      }

      console.log('[initializeStore] Loaded from Supabase — contests:', mem.contests.length, 'users:', mem.users.length, 'registrations:', mem.registrations.length);

      // Seed default contest if Supabase is empty
      if (mem.contests.length === 0) {
        mem.contests = [DEFAULT_INITIAL_CONTEST];
        await supabase.from('contests').upsert({
          id: DEFAULT_INITIAL_CONTEST.id,
          title: DEFAULT_INITIAL_CONTEST.title,
          slug: DEFAULT_INITIAL_CONTEST.slug,
          description: DEFAULT_INITIAL_CONTEST.description,
          contest_type: DEFAULT_INITIAL_CONTEST.contest_type,
          product_name: DEFAULT_INITIAL_CONTEST.product_name,
          product_url: DEFAULT_INITIAL_CONTEST.product_url || null,
          platform: DEFAULT_INITIAL_CONTEST.platform,
          banner_url: DEFAULT_INITIAL_CONTEST.banner_url || null,
          prize_amount: DEFAULT_INITIAL_CONTEST.prize_amount,
          currency: DEFAULT_INITIAL_CONTEST.currency,
          status: DEFAULT_INITIAL_CONTEST.status,
          registration_start: DEFAULT_INITIAL_CONTEST.registration_start,
          registration_end: DEFAULT_INITIAL_CONTEST.registration_end,
          contest_start: DEFAULT_INITIAL_CONTEST.contest_start,
          contest_end: DEFAULT_INITIAL_CONTEST.contest_end,
          submission_deadline: DEFAULT_INITIAL_CONTEST.submission_deadline,
          result_date: DEFAULT_INITIAL_CONTEST.result_date,
          testing_instructions: DEFAULT_INITIAL_CONTEST.testing_instructions,
          eligibility_requirements: DEFAULT_INITIAL_CONTEST.eligibility_requirements || null,
          allowed_categories: DEFAULT_INITIAL_CONTEST.allowed_categories,
        });
      }
    } catch (e) {
      console.error('[initializeStore] Failed:', e);
      if (mem.contests.length === 0) mem.contests = [DEFAULT_INITIAL_CONTEST];
    }

    _initialized = true;
  })();

  return _initPromise;
};

// ─────────────────────────────────────────────────────────────
//  REFRESH HELPERS  (pull fresh data from Supabase into mem)
// ─────────────────────────────────────────────────────────────
export const fetchContestsAsync = async (): Promise<Contest[]> => {
  if (!isSupabaseConfigured || !supabase) return mem.contests;
  const { data, error } = await supabase
    .from('contests')
    .select('*')
    .order('created_at', { ascending: false });
  if (!error && data) {
    mem.contests = data as Contest[];
    if (mem.contests.length === 0) mem.contests = [DEFAULT_INITIAL_CONTEST];
  }
  return mem.contests;
};

export const fetchProfilesAsync = async (): Promise<UserProfile[]> => {
  if (!isSupabaseConfigured || !supabase) return mem.users;
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false });
  if (!error && data) mem.users = data as UserProfile[];
  return mem.users;
};

export const fetchSettingsAsync = async (): Promise<SiteSettings> => {
  if (!isSupabaseConfigured || !supabase) return mem.settings;
  const { data, error } = await supabase
    .from('site_settings')
    .select('*')
    .eq('id', 'global')
    .maybeSingle();
  if (!error && data) {
    mem.settings = {
      contests_visible: data.contests_visible,
      winners_visible: data.winners_visible,
      learn_visible: data.learn_visible,
      community_visible: data.community_visible,
    };
  }
  return mem.settings;
};

export const fetchRegistrationsAsync = async (contestId?: string): Promise<ContestRegistration[]> => {
  if (!isSupabaseConfigured || !supabase) {
    return contestId ? mem.registrations.filter(r => r.contest_id === contestId) : mem.registrations;
  }
  let query = supabase.from('contest_registrations').select('*').order('registered_at', { ascending: false });
  if (contestId) query = query.eq('contest_id', contestId);
  const { data, error } = await query;
  if (!error && data) {
    if (contestId) {
      mem.registrations = [
        ...mem.registrations.filter(r => r.contest_id !== contestId),
        ...(data as ContestRegistration[]),
      ];
    } else {
      mem.registrations = data as ContestRegistration[];
    }
  }
  return contestId
    ? mem.registrations.filter(r => r.contest_id === contestId)
    : mem.registrations;
};

// ─────────────────────────────────────────────────────────────
//  DB STORE  (same API as before, backed by mem + Supabase)
// ─────────────────────────────────────────────────────────────
export const dbStore = {

  // ── USERS ──────────────────────────────────────────────────
  getUsers: () => mem.users,

  saveUser: (user: UserProfile) => {
    const idx = mem.users.findIndex(
      u => u.id === user.id || (u.email && user.email && u.email.toLowerCase() === user.email.toLowerCase())
    );
    if (idx >= 0) {
      mem.users[idx] = { ...mem.users[idx], ...user };
    } else {
      mem.users.unshift(user);
    }

    if (isSupabaseConfigured && supabase && user.id && !user.id.startsWith('admin-master-')) {
      supabase.from('profiles').upsert({
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        mobile_number: user.mobile_number,
        avatar_url: user.avatar_url || null,
        role: user.role,
        updated_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error('[saveUser] upsert error:', error.message);
      });
    }
  },

  deleteUser: (id: string) => {
    mem.users = mem.users.filter(u => u.id !== id);
  },

  // ── CONTESTS ───────────────────────────────────────────────
  getContests: (): Contest[] => {
    if (mem.contests.length === 0) return [DEFAULT_INITIAL_CONTEST];
    return mem.contests;
  },

  saveContest: (contest: Contest): Contest => {
    const contestId =
      contest.id ||
      (typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `cnt-${Date.now()}`);

    const existingIdx = mem.contests.findIndex(c => c.id === contestId || c.slug === contest.slug);
    let savedObj: Contest;

    if (existingIdx >= 0) {
      savedObj = { ...mem.contests[existingIdx], ...contest, id: contestId, updated_at: new Date().toISOString() };
      mem.contests[existingIdx] = savedObj;
    } else {
      savedObj = {
        ...contest,
        id: contestId,
        registration_count: 0,
        submission_count: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      mem.contests.unshift(savedObj);
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('contests').upsert({
        id: savedObj.id,
        title: savedObj.title,
        slug: savedObj.slug,
        description: savedObj.description,
        contest_type: savedObj.contest_type,
        product_name: savedObj.product_name,
        product_url: savedObj.product_url || null,
        platform: savedObj.platform,
        banner_url: savedObj.banner_url || null,
        prize_amount: savedObj.prize_amount,
        currency: savedObj.currency || 'INR',
        status: savedObj.status,
        registration_start: savedObj.registration_start,
        registration_end: savedObj.registration_end,
        contest_start: savedObj.contest_start,
        contest_end: savedObj.contest_end,
        submission_deadline: savedObj.submission_deadline,
        result_date: savedObj.result_date,
        testing_instructions: savedObj.testing_instructions,
        eligibility_requirements: savedObj.eligibility_requirements || null,
        whatsapp_group_url: savedObj.whatsapp_group_url || null,
        allowed_categories: savedObj.allowed_categories,
        custom_confirmation_message: savedObj.custom_confirmation_message || null,
        updated_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error('[saveContest] upsert error:', error.message);
      });
    }

    return savedObj;
  },

  deleteRegistration: (id: string) => {
    mem.registrations = mem.registrations.filter(r => r.id !== id);
    if (isSupabaseConfigured && supabase) {
      supabase.from('contest_registrations').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('[deleteRegistration] error:', error.message);
      });
    }
  },

  deleteContest: (id: string) => {
    mem.contests = mem.contests.filter(c => c.id !== id);
    if (isSupabaseConfigured && supabase) {
      supabase.from('contests').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('[deleteContest] error:', error.message);
      });
    }
  },

  // ── REGISTRATIONS (PUBLIC FORM — NO LOGIN REQUIRED) ────────
  getRegistrations: (): ContestRegistration[] => mem.registrations,

  // Registers a visitor for a contest directly from the public registration
  // form. Requires age/consent/rules acknowledgement — also enforced by a
  // DB check constraint, so this can never be bypassed by calling the API
  // directly. Awaited (unlike most of this store) so duplicate-email and
  // other DB errors surface back to the form immediately.
  registerForContest: async (payload: {
    contest_id: string;
    full_name: string;
    email: string;
    mobile_number: string;
    linkedin_url: string;
    city_state?: string;
    age_confirmed: boolean;
    consent_temp_account: boolean;
    rules_acknowledged: boolean;
  }): Promise<ContestRegistration> => {
    if (!payload.age_confirmed || !payload.consent_temp_account || !payload.rules_acknowledged) {
      throw new Error('You must confirm all required checkboxes to register.');
    }

    const regId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `reg-${Date.now()}`;
    const now = new Date().toISOString();

    const newReg: ContestRegistration = {
      id: regId,
      contest_id: payload.contest_id,
      full_name: payload.full_name,
      email: payload.email,
      mobile_number: payload.mobile_number,
      linkedin_url: payload.linkedin_url,
      city_state: payload.city_state || undefined,
      age_confirmed: payload.age_confirmed,
      consent_temp_account: payload.consent_temp_account,
      rules_acknowledged: payload.rules_acknowledged,
      rules_acknowledged_at: now,
      registered_at: now,
    };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('contest_registrations').insert({
        id: regId,
        contest_id: payload.contest_id,
        full_name: payload.full_name,
        email: payload.email,
        mobile_number: payload.mobile_number,
        linkedin_url: payload.linkedin_url,
        city_state: payload.city_state || null,
        age_confirmed: payload.age_confirmed,
        consent_temp_account: payload.consent_temp_account,
        rules_acknowledged: payload.rules_acknowledged,
        rules_acknowledged_at: now,
      });

      if (error) {
        if (error.code === '23505') {
          throw new Error('This email address has already registered for this contest.');
        }
        throw new Error(error.message);
      }
    }

    mem.registrations.unshift(newReg);
    const contest = mem.contests.find(c => c.id === payload.contest_id);
    if (contest) contest.registration_count = (contest.registration_count || 0) + 1;

    // Best-effort confirmation email — never blocks or fails the registration itself.
    if (contest && isSupabaseConfigured && supabase) {
      const shareLink = typeof window !== 'undefined' ? `${window.location.origin}/contests/${contest.id}` : '';
      const formatDate = (d: string) => new Date(d).toLocaleString('en-US', {
        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
      });

      const templateHtml = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0b0f19; color: #f8fafc;">
          <h2 style="color: #8B35FF;">You're registered, {{first_name}}!</h2>
          <p>Thanks for registering for <strong>{{contest_name}}</strong> on The Test Troop.</p>
          <p><strong>Registration closes:</strong> {{registration_end}}<br/>
             <strong>Testing starts:</strong> {{contest_start}}</p>
          <p>We'll email you your login credentials and the submission link shortly before testing begins.</p>
          <p style="margin-top: 24px;">Know another great tester? Share the contest with your friends:</p>
          <a href="{{share_link}}" style="display: inline-block; background: linear-gradient(135deg, #6D19FF 0%, #8B35FF 100%); color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 8px;">Share This Contest</a>
        </div>`;

      supabase.functions.invoke('send-email-campaign', {
        body: {
          campaignId: `registration-confirm-${regId}`,
          recipients: [{
            email: newReg.email,
            first_name: newReg.full_name.split(' ')[0] || 'Tester',
            full_name: newReg.full_name,
            params: {
              contest_name: contest.title,
              registration_end: formatDate(contest.registration_end),
              contest_start: formatDate(contest.contest_start),
              share_link: shareLink,
            },
          }],
          subject: `You're registered for ${contest.title}!`,
          templateHtml,
        },
      }).catch(err => console.error('[registerForContest] confirmation email failed:', err));
    }

    return newReg;
  },

  // Logs a visitor's decision to decline the contest rules, with their reason —
  // kept for record-keeping. Declining never creates a registration.
  logRuleDecline: async (payload: {
    contest_id: string;
    full_name?: string;
    email?: string;
    mobile_number?: string;
    reason: string;
  }): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('contest_rule_declines').insert({
        contest_id: payload.contest_id,
        full_name: payload.full_name || null,
        email: payload.email || null,
        mobile_number: payload.mobile_number || null,
        reason: payload.reason,
      });
      if (error) console.error('[logRuleDecline] insert error:', error.message);
    }
  },

  // Verifies a submission-page login (registered email + emailed temp
  // password) via a SECURITY DEFINER Postgres function, so the anon client
  // never gets direct read access to the registrations table.
  verifySubmissionLogin: async (
    contest_id: string,
    email: string,
    password: string
  ): Promise<{ registrationId: string; fullName: string } | null> => {
    if (!isSupabaseConfigured || !supabase) return null;
    const { data, error } = await supabase.rpc('verify_submission_login', {
      p_contest_id: contest_id,
      p_email: email.trim().toLowerCase(),
      p_password: password.trim(),
    });
    if (error || !data || data.length === 0) return null;
    return { registrationId: data[0].registration_id, fullName: data[0].full_name };
  },

  // Generates + emails (individually, via Brevo) temp login credentials —
  // email(as username)/temp password/promo code/app link/submission link —
  // to every registrant for a contest who hasn't received them yet.
  sendContestCredentials: async (contest_id: string): Promise<{ sent: number; failed: number; skipped: number }> => {
    if (!isSupabaseConfigured || !supabase) return { sent: 0, failed: 0, skipped: 0 };

    const contest = mem.contests.find(c => c.id === contest_id);
    const allRegs = await fetchRegistrationsAsync(contest_id);
    const pending = allRegs.filter(r => !r.credentials_sent_at);

    if (pending.length === 0) return { sent: 0, failed: 0, skipped: allRegs.length };

    const genPassword = () => Math.random().toString(36).slice(-4).toUpperCase() + Math.random().toString(36).slice(-4);
    const genPromoCode = () => `TTT-${Math.random().toString(36).slice(-6).toUpperCase()}`;
    const submissionLink = typeof window !== 'undefined' ? `${window.location.origin}/submit/${contest_id}` : '';

    const recipients: { email: string; first_name: string; full_name: string; params: Record<string, string> }[] = [];

    for (const reg of pending) {
      const temp_password = genPassword();
      const promo_code = genPromoCode();

      const { error } = await supabase.from('contest_registrations').update({
        temp_password,
        promo_code,
        credentials_sent_at: new Date().toISOString(),
      }).eq('id', reg.id);

      if (error) {
        console.error('[sendContestCredentials] update error:', error.message);
        continue;
      }

      reg.temp_password = temp_password;
      reg.promo_code = promo_code;
      reg.credentials_sent_at = new Date().toISOString();

      recipients.push({
        email: reg.email,
        first_name: reg.full_name.split(' ')[0] || 'Tester',
        full_name: reg.full_name,
        params: {
          username: reg.email,
          temp_password,
          promo_code,
          app_link: contest?.product_url || '',
          submission_link: submissionLink,
          contest_name: contest?.title || 'Contest',
        },
      });
    }

    if (recipients.length === 0) return { sent: 0, failed: pending.length, skipped: allRegs.length - pending.length };

    const templateHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #0b0f19; color: #f8fafc;">
        <h2 style="color: #8B35FF;">Hi {{first_name}},</h2>
        <p>Testing for <strong>{{contest_name}}</strong> is starting! Here are your contest login details:</p>
        <p><strong>App Link:</strong> <a href="{{app_link}}" style="color: #38bdf8;">{{app_link}}</a></p>
        <p><strong>Username:</strong> {{username}}<br/><strong>Temporary Password:</strong> {{temp_password}}</p>
        <p><strong>Your Promo Code:</strong> {{promo_code}}</p>
        <p>Submit your bug reports and feedback here: <a href="{{submission_link}}" style="color: #38bdf8;">{{submission_link}}</a></p>
        <p>Use the same email + temporary password above to log in to the submission page.</p>
      </div>`;

    try {
      const { data, error } = await supabase.functions.invoke('send-email-campaign', {
        body: {
          campaignId: `credentials-${contest_id}-${Date.now()}`,
          recipients,
          subject: `Your ${contest?.title || 'Contest'} Login Details & Submission Link`,
          templateHtml,
        },
      });
      if (error) throw error;
      return { sent: data?.sentCount || 0, failed: data?.failedCount || 0, skipped: allRegs.length - pending.length };
    } catch (err: any) {
      console.error('[sendContestCredentials] Brevo dispatch error:', err.message || err);
      return { sent: 0, failed: recipients.length, skipped: allRegs.length - pending.length };
    }
  },

  // ── SUBMISSIONS ────────────────────────────────────────────
  getSubmissions: (): Submission[] => mem.submissions,
  getBugReports:  (): BugReport[]  => mem.bugReports,
  getUIFeedback:  (): UIFeedback[] => mem.uiFeedback,
  getSuggestions: (): Suggestion[] => mem.suggestions,

  // Creates (or reuses) the one submission per registration+contest, then
  // inserts every bug/UI-feedback/suggestion item under it. Registration-based
  // (no account), and awaited end-to-end so the submission page can reliably
  // tell the participant whether it actually saved.
  createFullSubmission: async (
    contest_id: string,
    registration_id: string,
    bugs: Partial<BugReport>[],
    uiFeedbackItems: Partial<UIFeedback>[],
    suggestionItems: Partial<Suggestion>[],
    isLate: boolean
  ): Promise<Submission> => {
    let sub = mem.submissions.find(s => s.contest_id === contest_id && s.registration_id === registration_id);
    const subId = sub?.id || (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}`);

    if (!sub) {
      sub = {
        id: subId,
        contest_id,
        registration_id,
        is_late: isLate,
        submitted_at: new Date().toISOString(),
      };
      mem.submissions.unshift(sub);

      const contest = mem.contests.find(c => c.id === contest_id);
      if (contest) contest.submission_count = (contest.submission_count || 0) + 1;
    }

    const newBugs: BugReport[] = bugs.map(b => ({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `bug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      submission_id: subId,
      contest_id,
      registration_id,
      title: b.title || 'Untitled Bug',
      description: b.description || '',
      steps_to_reproduce: b.steps_to_reproduce || '',
      expected_result: b.expected_result || '',
      actual_result: b.actual_result || '',
      severity: b.severity || 'medium',
      bug_type: b.bug_type,
      priority: b.priority,
      brand_model: b.brand_model,
      device_platform: b.device_platform || 'Desktop/Mobile',
      environment_version: b.environment_version,
      screenshot_urls: b.screenshot_urls || [],
      attachment_urls: b.attachment_urls || [],
      created_at: new Date().toISOString(),
    }));

    const newUiFeedback: UIFeedback[] = uiFeedbackItems.map(u => ({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ui-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      submission_id: subId,
      contest_id,
      registration_id,
      title: u.title || 'UI Improvement',
      current_problem: u.current_problem || '',
      suggested_improvement: u.suggested_improvement || '',
      detailed_explanation: u.detailed_explanation,
      screenshot_urls: u.screenshot_urls || [],
      attachment_urls: u.attachment_urls || [],
      created_at: new Date().toISOString(),
    }));

    const newSuggestions: Suggestion[] = suggestionItems.map(s => ({
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      submission_id: subId,
      contest_id,
      registration_id,
      title: s.title || 'Feature Suggestion',
      description: s.description || '',
      detailed_explanation: s.detailed_explanation,
      attachment_urls: s.attachment_urls || [],
      created_at: new Date().toISOString(),
    }));

    if (isSupabaseConfigured && supabase) {
      const { error: subError } = await supabase.from('submissions')
        .upsert({ id: subId, contest_id, registration_id, is_late: isLate });
      if (subError) throw new Error(subError.message);

      if (newBugs.length) {
        const { error } = await supabase.from('bug_reports').insert(newBugs.map(b => ({
          id: b.id, submission_id: b.submission_id, contest_id: b.contest_id, registration_id: b.registration_id,
          title: b.title, description: b.description, steps_to_reproduce: b.steps_to_reproduce,
          expected_result: b.expected_result, actual_result: b.actual_result, severity: b.severity,
          bug_type: b.bug_type || null, priority: b.priority || null, brand_model: b.brand_model || null,
          device_platform: b.device_platform, environment_version: b.environment_version || null,
          screenshot_urls: b.screenshot_urls, attachment_urls: b.attachment_urls,
        })));
        if (error) throw new Error(error.message);
      }

      if (newUiFeedback.length) {
        const { error } = await supabase.from('ui_feedback').insert(newUiFeedback.map(u => ({
          id: u.id, submission_id: u.submission_id, contest_id: u.contest_id, registration_id: u.registration_id,
          title: u.title, current_problem: u.current_problem, suggested_improvement: u.suggested_improvement,
          detailed_explanation: u.detailed_explanation || null,
          screenshot_urls: u.screenshot_urls, attachment_urls: u.attachment_urls,
        })));
        if (error) throw new Error(error.message);
      }

      if (newSuggestions.length) {
        const { error } = await supabase.from('suggestions').insert(newSuggestions.map(s => ({
          id: s.id, submission_id: s.submission_id, contest_id: s.contest_id, registration_id: s.registration_id,
          title: s.title, description: s.description, detailed_explanation: s.detailed_explanation || null,
          attachment_urls: s.attachment_urls,
        })));
        if (error) throw new Error(error.message);
      }
    }

    mem.bugReports.push(...newBugs);
    mem.uiFeedback.push(...newUiFeedback);
    mem.suggestions.push(...newSuggestions);

    return sub;
  },

  // ── POST-TESTING FEEDBACK ───────────────────────────────────
  saveContestFeedback: async (payload: {
    contest_id: string;
    registration_id: string;
    improvement_point_1?: string;
    improvement_point_2?: string;
    improvement_point_3?: string;
    overall_rating?: number;
    would_recommend?: boolean;
    favorite_feature?: string;
    missing_feature?: string;
    contest_experience?: string;
    contest_improvement_suggestion?: string;
    is_late: boolean;
  }): Promise<void> => {
    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase.from('contest_feedback').upsert({
        contest_id: payload.contest_id,
        registration_id: payload.registration_id,
        improvement_point_1: payload.improvement_point_1 || null,
        improvement_point_2: payload.improvement_point_2 || null,
        improvement_point_3: payload.improvement_point_3 || null,
        overall_rating: payload.overall_rating ?? null,
        would_recommend: payload.would_recommend ?? null,
        favorite_feature: payload.favorite_feature || null,
        missing_feature: payload.missing_feature || null,
        contest_experience: payload.contest_experience || null,
        contest_improvement_suggestion: payload.contest_improvement_suggestion || null,
        is_late: payload.is_late,
      }, { onConflict: 'contest_id,registration_id' });
      if (error) throw new Error(error.message);
    }
  },

  // ── REVIEWS ────────────────────────────────────────────────
  getReviews: (): ContestReview[] => mem.reviews,

  saveReview: (review: Partial<ContestReview>): ContestReview => {
    const index = mem.reviews.findIndex(
      r => r.contest_id === review.contest_id && r.registration_id === review.registration_id
    );
    const updatedReview: ContestReview = {
      id: index >= 0 ? mem.reviews[index].id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev-${Date.now()}`),
      contest_id: review.contest_id!,
      registration_id: review.registration_id!,
      submission_id: review.submission_id,
      reviewer_id: review.reviewer_id || 'admin',
      bug_quality_score: review.bug_quality_score || 0,
      coverage_score: review.coverage_score || 0,
      ui_feedback_score: review.ui_feedback_score || 0,
      suggestion_score: review.suggestion_score || 0,
      overall_score: review.overall_score || 0,
      review_status: review.review_status || 'pending',
      internal_notes: review.internal_notes || '',
      created_at: index >= 0 ? mem.reviews[index].created_at : new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    if (index >= 0) {
      mem.reviews[index] = updatedReview;
    } else {
      mem.reviews.push(updatedReview);
    }

    if (isSupabaseConfigured && supabase) {
      supabase.from('contest_reviews').upsert({
        id: updatedReview.id,
        contest_id: updatedReview.contest_id,
        registration_id: updatedReview.registration_id,
        submission_id: updatedReview.submission_id || null,
        reviewer_id: updatedReview.reviewer_id,
        bug_quality_score: updatedReview.bug_quality_score,
        coverage_score: updatedReview.coverage_score,
        ui_feedback_score: updatedReview.ui_feedback_score,
        suggestion_score: updatedReview.suggestion_score,
        overall_score: updatedReview.overall_score,
        review_status: updatedReview.review_status,
        internal_notes: updatedReview.internal_notes || null,
        updated_at: updatedReview.updated_at,
      }).then(({ error }) => {
        if (error) console.error('[saveReview] upsert error:', error.message);
      });
    }

    return updatedReview;
  },

  // ── WINNERS ────────────────────────────────────────────────
  getWinners: (): ContestWinner[] => mem.winners,

  publishWinner: (winnerData: Partial<ContestWinner>): ContestWinner => {
    const existingIndex = mem.winners.findIndex(w => w.contest_id === winnerData.contest_id);
    const registration = mem.registrations.find(r => r.id === winnerData.winner_registration_id);
    const contest = mem.contests.find(c => c.id === winnerData.contest_id);

    const winnerObj: ContestWinner = {
      id: existingIndex >= 0 ? mem.winners[existingIndex].id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `win-${Date.now()}`),
      contest_id: winnerData.contest_id!,
      winner_registration_id: winnerData.winner_registration_id!,
      prize_title: winnerData.prize_title || 'Contest Champion',
      prize_amount: winnerData.prize_amount || contest?.prize_amount || 10000,
      announcement_headline: winnerData.announcement_headline || `${registration?.full_name || 'Tester'} Wins!`,
      announcement_body: winnerData.announcement_body || 'Congratulations to our champion!',
      winning_summary: winnerData.winning_summary || 'Top scoring submissions across bugs, UI UX, and feature suggestions.',
      is_published: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      winner_profile: { full_name: registration?.full_name || 'Tester' },
      contest_title: contest?.title || 'Testing Contest',
    };

    if (isSupabaseConfigured && supabase) {
      supabase.from('contest_winners').upsert({
        id: winnerObj.id,
        contest_id: winnerObj.contest_id,
        winner_registration_id: winnerObj.winner_registration_id,
        prize_title: winnerObj.prize_title,
        prize_amount: winnerObj.prize_amount,
        announcement_headline: winnerObj.announcement_headline,
        announcement_body: winnerObj.announcement_body,
        winning_summary: winnerObj.winning_summary || null,
        is_published: winnerObj.is_published,
        published_at: winnerObj.published_at,
      }).then(({ error }) => {
        if (error) console.error('[publishWinner] upsert error:', error.message);
      });
    }

    if (existingIndex >= 0) {
      mem.winners[existingIndex] = winnerObj;
    } else {
      mem.winners.push(winnerObj);
    }

    if (contest) {
      contest.status = 'winner_announced';
      contest.winner = winnerObj;
      dbStore.saveContest(contest);
    }

    return winnerObj;
  },

  // ── CAMPAIGNS ──────────────────────────────────────────────
  getCampaigns: (): Campaign[] => mem.campaigns,

  saveCampaign: (campaign: Partial<Campaign>): Campaign => {
    const existingIndex = mem.campaigns.findIndex(c => c.id === campaign.id);
    const contest = mem.contests.find(c => c.id === campaign.contest_id);

    const newCamp: Campaign = {
      id: existingIndex >= 0 ? mem.campaigns[existingIndex].id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `cmp-${Date.now()}`),
      title: campaign.title || 'Untitled Campaign',
      subject: campaign.subject || 'The Test Troop Notification',
      contest_id: campaign.contest_id,
      recipient_filter: campaign.recipient_filter || 'registered',
      template_html: campaign.template_html || '<p>Hello {{first_name}},</p>',
      status: campaign.status || 'draft',
      total_recipients: campaign.total_recipients || 0,
      sent_count: campaign.sent_count || 0,
      failed_count: campaign.failed_count || 0,
      created_at: existingIndex >= 0 ? mem.campaigns[existingIndex].created_at : new Date().toISOString(),
      contest_title: contest?.title,
    };

    if (existingIndex >= 0) {
      mem.campaigns[existingIndex] = newCamp;
    } else {
      mem.campaigns.unshift(newCamp);
    }

    return newCamp;
  },

  clearAllLocalData: () => {
    console.info('[clearAllLocalData] No-op — data lives in Supabase only');
  },

  // ── SITE SETTINGS (NAV VISIBILITY) ─────────────────────────
  getSettings: (): SiteSettings => mem.settings,

  saveSettings: (settings: Partial<SiteSettings>): SiteSettings => {
    mem.settings = { ...mem.settings, ...settings };

    if (isSupabaseConfigured && supabase) {
      supabase.from('site_settings').upsert({
        id: 'global',
        ...mem.settings,
        updated_at: new Date().toISOString(),
      }).then(({ error }) => {
        if (error) console.error('[saveSettings] upsert error:', error.message);
      });
    }

    return mem.settings;
  },
};

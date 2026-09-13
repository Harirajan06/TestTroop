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
};

// Clean up any leftover localStorage from previous builds
try {
  Object.keys(localStorage)
    .filter(k => k.startsWith('ttt_db_'))
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

  deleteContest: (id: string) => {
    mem.contests = mem.contests.filter(c => c.id !== id);
    if (isSupabaseConfigured && supabase) {
      supabase.from('contests').delete().eq('id', id).then(({ error }) => {
        if (error) console.error('[deleteContest] error:', error.message);
      });
    }
  },

  // ── REGISTRATIONS ──────────────────────────────────────────
  getRegistrations: (): ContestRegistration[] => mem.registrations,

  registerUserForContest: (contest_id: string, user_id: string): ContestRegistration => {
    const existing = mem.registrations.find(
      r => r.contest_id === contest_id && r.user_id === user_id
    );
    if (existing) return existing;

    const regId =
      typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `reg-${Date.now()}`;

    const newReg: ContestRegistration = {
      id: regId,
      contest_id,
      user_id,
      registered_at: new Date().toISOString(),
    };
    mem.registrations.unshift(newReg);

    const contest = mem.contests.find(c => c.id === contest_id);
    if (contest) contest.registration_count = (contest.registration_count || 0) + 1;

    if (isSupabaseConfigured && supabase) {
      supabase.from('contest_registrations').insert({
        id: regId,
        contest_id,
        user_id,
      }).then(({ error }) => {
        if (error) {
          console.error('[registerUserForContest] insert error:', error.message);
        }
      });
    }

    return newReg;
  },

  // ── SUBMISSIONS ────────────────────────────────────────────
  getSubmissions: (): Submission[] => mem.submissions,
  getBugReports:  (): BugReport[]  => mem.bugReports,
  getUIFeedback:  (): UIFeedback[] => mem.uiFeedback,
  getSuggestions: (): Suggestion[] => mem.suggestions,

  createFullSubmission: (
    contest_id: string,
    user_id: string,
    bugs: Partial<BugReport>[],
    uiFeedbackItems: Partial<UIFeedback>[],
    suggestionItems: Partial<Suggestion>[]
  ): Submission => {
    let sub = mem.submissions.find(s => s.contest_id === contest_id && s.user_id === user_id);

    if (!sub) {
      sub = {
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sub-${Date.now()}`,
        contest_id,
        user_id,
        submitted_at: new Date().toISOString(),
      };
      mem.submissions.unshift(sub);

      const contest = mem.contests.find(c => c.id === contest_id);
      if (contest) contest.submission_count = (contest.submission_count || 0) + 1;
    }

    const subId = sub.id;

    // Bug reports
    bugs.forEach(b => {
      mem.bugReports.push({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `bug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        submission_id: subId,
        contest_id,
        user_id,
        title: b.title || 'Untitled Bug',
        description: b.description || '',
        steps_to_reproduce: b.steps_to_reproduce || '',
        expected_result: b.expected_result || '',
        actual_result: b.actual_result || '',
        severity: b.severity || 'medium',
        device_platform: b.device_platform || 'Desktop/Mobile',
        environment_version: b.environment_version,
        screenshot_urls: b.screenshot_urls || [],
        attachment_urls: b.attachment_urls || [],
        created_at: new Date().toISOString(),
      });
    });

    // UI Feedback
    uiFeedbackItems.forEach(u => {
      mem.uiFeedback.push({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `ui-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        submission_id: subId,
        contest_id,
        user_id,
        title: u.title || 'UI Improvement',
        current_problem: u.current_problem || '',
        suggested_improvement: u.suggested_improvement || '',
        detailed_explanation: u.detailed_explanation,
        screenshot_urls: u.screenshot_urls || [],
        attachment_urls: u.attachment_urls || [],
        created_at: new Date().toISOString(),
      });
    });

    // Suggestions
    suggestionItems.forEach(s => {
      mem.suggestions.push({
        id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `sug-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        submission_id: subId,
        contest_id,
        user_id,
        title: s.title || 'Feature Suggestion',
        description: s.description || '',
        detailed_explanation: s.detailed_explanation,
        attachment_urls: s.attachment_urls || [],
        created_at: new Date().toISOString(),
      });
    });

    // Sync submission to Supabase
    if (isSupabaseConfigured && supabase) {
      supabase.from('submissions')
        .upsert({ id: subId, contest_id, user_id })
        .then(({ error }) => {
          if (error) console.error('[createFullSubmission] submission upsert error:', error.message);
        });
    }

    return sub;
  },

  // ── REVIEWS ────────────────────────────────────────────────
  getReviews: (): ContestReview[] => mem.reviews,

  saveReview: (review: Partial<ContestReview>): ContestReview => {
    const index = mem.reviews.findIndex(
      r => r.contest_id === review.contest_id && r.user_id === review.user_id
    );
    const updatedReview: ContestReview = {
      id: index >= 0 ? mem.reviews[index].id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `rev-${Date.now()}`),
      contest_id: review.contest_id!,
      user_id: review.user_id!,
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

    return updatedReview;
  },

  // ── WINNERS ────────────────────────────────────────────────
  getWinners: (): ContestWinner[] => mem.winners,

  publishWinner: (winnerData: Partial<ContestWinner>): ContestWinner => {
    const existingIndex = mem.winners.findIndex(w => w.contest_id === winnerData.contest_id);
    const user = mem.users.find(u => u.id === winnerData.winner_user_id);
    const contest = mem.contests.find(c => c.id === winnerData.contest_id);

    const winnerObj: ContestWinner = {
      id: existingIndex >= 0 ? mem.winners[existingIndex].id : (typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `win-${Date.now()}`),
      contest_id: winnerData.contest_id!,
      winner_user_id: winnerData.winner_user_id!,
      prize_title: winnerData.prize_title || 'Contest Champion',
      prize_amount: winnerData.prize_amount || contest?.prize_amount || 10000,
      announcement_headline: winnerData.announcement_headline || `${user?.full_name || 'Tester'} Wins!`,
      announcement_body: winnerData.announcement_body || 'Congratulations to our champion!',
      winning_summary: winnerData.winning_summary || 'Top scoring submissions across bugs, UI UX, and feature suggestions.',
      is_published: true,
      published_at: new Date().toISOString(),
      created_at: new Date().toISOString(),
      winner_profile: { full_name: user?.full_name || 'Tester', avatar_url: user?.avatar_url },
      contest_title: contest?.title || 'Testing Contest',
    };

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
};

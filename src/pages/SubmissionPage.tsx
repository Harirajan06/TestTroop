import React, { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { dbStore, fetchContestsAsync, supabase } from '../lib/supabase';
import { Contest, BugReport, BugSeverity } from '../types';
import {
  ShieldCheck, Mail, Lock, AlertCircle, ArrowRight, Plus, Trash2, X,
  Bug, Star, CheckCircle2, Clock, LogOut, Image as ImageIcon, Loader2,
} from 'lucide-react';

const ATTACHMENTS_BUCKET = 'submission-attachments';
const MAX_UPLOAD_BYTES = 5 * 1024 * 1024;

const sessionKey = (contestId: string) => `ttt_submission_session_${contestId}`;

interface SubmissionSession {
  registrationId: string;
  fullName: string;
}

const BUG_TYPES = ['Crash / Critical', 'Functional', 'UI', 'Typo'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Urgent'];
const SEVERITIES: BugSeverity[] = ['critical', 'high', 'medium', 'low', 'informational'];

const emptyBugForm = () => ({
  title: '', description: '', bug_type: BUG_TYPES[1], severity: 'medium' as BugSeverity, priority: PRIORITIES[1],
  steps_to_reproduce: '', expected_result: '', actual_result: '',
  screenshot_urls: ['', '', ''], device_platform: 'Android', brand_model: '',
});

export const SubmissionPage: React.FC = () => {
  const { contestId } = useParams<{ contestId: string }>();

  const [contest, setContest] = useState<Contest | null>(null);
  const [loadingContest, setLoadingContest] = useState(true);
  const [session, setSession] = useState<SubmissionSession | null>(null);

  // Login form
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  // Bug list + modal
  const [bugs, setBugs] = useState<BugReport[]>([]);
  const [showBugModal, setShowBugModal] = useState(false);
  const [bugForm, setBugForm] = useState(emptyBugForm());
  const [uploadingSlots, setUploadingSlots] = useState<boolean[]>([false, false, false]);
  const [uploadErrors, setUploadErrors] = useState<(string | null)[]>([null, null, null]);

  // Post-testing feedback
  const [improvement1, setImprovement1] = useState('');
  const [improvement2, setImprovement2] = useState('');
  const [improvement3, setImprovement3] = useState('');
  const [overallRating, setOverallRating] = useState(0);
  const [wouldRecommend, setWouldRecommend] = useState<boolean | null>(null);
  const [favoriteFeature, setFavoriteFeature] = useState('');
  const [missingFeature, setMissingFeature] = useState('');
  const [contestExperience, setContestExperience] = useState('');
  const [contestImprovementSuggestion, setContestImprovementSuggestion] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<{ isLate: boolean } | null>(null);

  useEffect(() => {
    if (!contestId) return;
    fetchContestsAsync().then(all => {
      setContest(all.find(c => c.id === contestId) || null);
      setLoadingContest(false);
    });

    try {
      const saved = localStorage.getItem(sessionKey(contestId));
      if (saved) setSession(JSON.parse(saved));
    } catch { /* ignore */ }
  }, [contestId]);

  if (!contestId || (!loadingContest && !contest)) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="text-center space-y-3">
          <Bug className="w-12 h-12 text-gray-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Contest Not Found</h2>
          <p className="text-gray-400 text-sm">This submission link doesn't match any active contest.</p>
        </div>
      </div>
    );
  }

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);
    setLoggingIn(true);
    const result = await dbStore.verifySubmissionLogin(contestId, email, password);
    setLoggingIn(false);
    if (!result) {
      setLoginError('Invalid email or temporary password. Check the credentials emailed to you.');
      return;
    }
    setSession(result);
    try { localStorage.setItem(sessionKey(contestId), JSON.stringify(result)); } catch { /* ignore */ }
  };

  const handleLogout = () => {
    setSession(null);
    try { localStorage.removeItem(sessionKey(contestId)); } catch { /* ignore */ }
  };

  const handleSaveBug = (e: React.FormEvent) => {
    e.preventDefault();
    const newBug: BugReport = {
      id: typeof crypto !== 'undefined' && crypto.randomUUID ? crypto.randomUUID() : `local-${Date.now()}`,
      submission_id: '',
      contest_id: contestId,
      title: bugForm.title,
      description: bugForm.description,
      bug_type: bugForm.bug_type,
      severity: bugForm.severity,
      priority: bugForm.priority,
      steps_to_reproduce: bugForm.steps_to_reproduce,
      expected_result: bugForm.expected_result,
      actual_result: bugForm.actual_result,
      device_platform: bugForm.device_platform,
      brand_model: bugForm.brand_model || undefined,
      screenshot_urls: bugForm.screenshot_urls.filter(Boolean),
      created_at: new Date().toISOString(),
    };
    setBugs(prev => [...prev, newBug]);
    setBugForm(emptyBugForm());
    setUploadingSlots([false, false, false]);
    setUploadErrors([null, null, null]);
    setShowBugModal(false);
  };

  const handleScreenshotUpload = async (slot: number, file: File | undefined) => {
    if (!file || !contestId) return;

    if (!file.type.startsWith('image/')) {
      setUploadErrors(prev => prev.map((e, i) => i === slot ? 'Please choose an image file.' : e));
      return;
    }
    if (file.size > MAX_UPLOAD_BYTES) {
      setUploadErrors(prev => prev.map((e, i) => i === slot ? 'Image must be under 5 MB.' : e));
      return;
    }

    setUploadErrors(prev => prev.map((e, i) => i === slot ? null : e));
    setUploadingSlots(prev => prev.map((u, i) => i === slot ? true : u));

    try {
      if (!supabase) throw new Error('Storage is not configured in this environment.');
      const ext = file.name.split('.').pop() || 'png';
      const path = `${contestId}/${crypto.randomUUID()}.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from(ATTACHMENTS_BUCKET)
        .upload(path, file, { cacheControl: '3600', upsert: false, contentType: file.type });
      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from(ATTACHMENTS_BUCKET).getPublicUrl(path);

      setBugForm(prev => {
        const urls = [...prev.screenshot_urls];
        urls[slot] = data.publicUrl;
        return { ...prev, screenshot_urls: urls };
      });
    } catch (err: any) {
      setUploadErrors(prev => prev.map((e, i) => i === slot ? (err.message || 'Upload failed. Please try again.') : e));
    } finally {
      setUploadingSlots(prev => prev.map((u, i) => i === slot ? false : u));
    }
  };

  const handleRemoveScreenshot = (slot: number) => {
    setBugForm(prev => {
      const urls = [...prev.screenshot_urls];
      urls[slot] = '';
      return { ...prev, screenshot_urls: urls };
    });
    setUploadErrors(prev => prev.map((e, i) => i === slot ? null : e));
  };

  const isLate = contest ? new Date() > new Date(contest.submission_deadline) : false;

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!session || !contest) return;

    if (bugs.length === 0) {
      setSubmitError('Add at least one bug report before submitting.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      await dbStore.createFullSubmission(contest.id, session.registrationId, bugs, [], [], isLate);
      await dbStore.saveContestFeedback({
        contest_id: contest.id,
        registration_id: session.registrationId,
        improvement_point_1: improvement1 || undefined,
        improvement_point_2: improvement2 || undefined,
        improvement_point_3: improvement3 || undefined,
        overall_rating: overallRating || undefined,
        would_recommend: wouldRecommend ?? undefined,
        favorite_feature: favoriteFeature || undefined,
        missing_feature: missingFeature || undefined,
        contest_experience: contestExperience || undefined,
        contest_improvement_suggestion: contestImprovementSuggestion || undefined,
        is_late: isLate,
      });
      setSubmitted({ isLate });
    } catch (err: any) {
      setSubmitError(err.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingContest) {
    return <div className="min-h-[50vh] flex items-center justify-center text-gray-400 text-sm">Loading contest...</div>;
  }

  // ── LOGIN GATE ──────────────────────────────────────────────
  if (!session) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-md bg-glass-card p-8 rounded-3xl border border-white/10 shadow-2xl">
          <div className="text-center space-y-2 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-white">{contest?.title}</h1>
            <p className="text-gray-400 text-xs">Log in with the email and temporary password we emailed you to submit your testing findings.</p>
          </div>

          {loginError && (
            <div className="mb-6 p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="form-group">
              <label className="form-label">Registered Email *</label>
              <div className="relative">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="form-input pl-10" placeholder="you@example.com" />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Temporary Password *</label>
              <div className="relative">
                <input type="password" required value={password} onChange={e => setPassword(e.target.value)} className="form-input pl-10" placeholder="••••••••" />
                <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>
            <button type="submit" disabled={loggingIn} className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
              {loggingIn ? 'Verifying...' : <>Log In <ArrowRight className="w-4 h-4" /></>}
            </button>
          </form>
        </div>
      </div>
    );
  }

  // ── SUCCESS STATE ───────────────────────────────────────────
  if (submitted) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center px-4">
        <div className="max-w-lg text-center space-y-4 bg-glass-card p-10 rounded-3xl border border-white/10">
          {submitted.isLate ? (
            <>
              <Clock className="w-14 h-14 text-amber-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Submission Time Is Over</h2>
              <p className="text-gray-300 text-sm">
                The submission deadline for this contest has passed, so this entry won't be considered for judging.
                We've still recorded your feedback — thank you for testing with us!
              </p>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-14 h-14 text-emerald-400 mx-auto" />
              <h2 className="text-2xl font-bold text-white">Submission Received!</h2>
              <p className="text-gray-300 text-sm">
                Thanks, {session.fullName.split(' ')[0]} — your {bugs.length} bug report{bugs.length === 1 ? '' : 's'} and feedback have been recorded.
              </p>
            </>
          )}
        </div>
      </div>
    );
  }

  // ── BUG LIST + FEEDBACK FORM ────────────────────────────────
  return (
    <div className="max-w-4xl mx-auto py-8 space-y-8">

      <div className="flex items-center justify-between">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">{contest?.title}</span>
          <h1 className="text-2xl font-bold text-white">Bug Submission Page</h1>
          <p className="text-xs text-gray-400 mt-1">Logged in as {session.fullName}</p>
        </div>
        <button onClick={handleLogout} className="btn btn-ghost text-xs flex items-center gap-1.5">
          <LogOut className="w-3.5 h-3.5" /> Log Out
        </button>
      </div>

      {isLate && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-center gap-2">
          <Clock className="w-4 h-4 shrink-0" />
          <span>The submission deadline has passed. You can still submit, but it won't be counted for judging.</span>
        </div>
      )}

      {submitError && (
        <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submitError}</span>
        </div>
      )}

      <form onSubmit={handleFinalSubmit} className="space-y-8">

        {/* BUG LIST TABLE */}
        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white flex items-center gap-2"><Bug className="w-4 h-4 text-red-400" /> Bug List ({bugs.length})</h3>
            <button type="button" onClick={() => setShowBugModal(true)} className="btn btn-secondary btn-sm flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5" /> Add
            </button>
          </div>

          {bugs.length > 0 ? (
            <div className="space-y-2">
              {bugs.map((b, idx) => (
                <div key={b.id} className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-white/5 text-xs">
                  <div>
                    <span className="font-semibold text-white block">{b.title}</span>
                    <span className="text-gray-400">{b.bug_type} • {b.priority} priority • {b.device_platform}</span>
                  </div>
                  <button type="button" onClick={() => setBugs(bugs.filter((_, i) => i !== idx))} className="text-gray-400 hover:text-red-400">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 text-xs italic">No bugs added yet. Click "Add" to log your first finding.</p>
          )}
        </div>

        {/* POST TESTING FEEDBACK */}
        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-5">
          <h3 className="font-bold text-white">Post Testing Feedback</h3>

          <div className="form-group">
            <label className="form-label">1. Improvement Points *</label>
            <div className="space-y-2">
              <input required value={improvement1} onChange={e => setImprovement1(e.target.value)} className="form-input" placeholder="Improvement point 1" />
              <input required value={improvement2} onChange={e => setImprovement2(e.target.value)} className="form-input" placeholder="Improvement point 2" />
              <input required value={improvement3} onChange={e => setImprovement3(e.target.value)} className="form-input" placeholder="Improvement point 3" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">2. Overall App Rating (1-5 Star) *</label>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map(n => (
                <button key={n} type="button" onClick={() => setOverallRating(n)}>
                  <Star className={`w-6 h-6 ${n <= overallRating ? 'text-amber-400 fill-amber-400' : 'text-gray-600'}`} />
                </button>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">3. Would you recommend this app to a friend? *</label>
            <div className="flex gap-3">
              <button type="button" onClick={() => setWouldRecommend(true)} className={`btn btn-sm ${wouldRecommend === true ? 'btn-primary' : 'btn-secondary'}`}>Yes</button>
              <button type="button" onClick={() => setWouldRecommend(false)} className={`btn btn-sm ${wouldRecommend === false ? 'btn-primary' : 'btn-secondary'}`}>No</button>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">4. Which feature did you like most? *</label>
            <input required value={favoriteFeature} onChange={e => setFavoriteFeature(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">5. Any feature you expected but didn't find? *</label>
            <input required value={missingFeature} onChange={e => setMissingFeature(e.target.value)} className="form-input" />
          </div>

          <div className="form-group">
            <label className="form-label">6. How was your testing / contest experience overall? *</label>
            <textarea required rows={2} value={contestExperience} onChange={e => setContestExperience(e.target.value)} className="form-textarea" />
          </div>

          <div className="form-group">
            <label className="form-label">7. What would you change or improve about how this contest was run? *</label>
            <textarea required rows={2} value={contestImprovementSuggestion} onChange={e => setContestImprovementSuggestion(e.target.value)} className="form-textarea" />
          </div>
        </div>

        <button type="submit" disabled={submitting} className="btn btn-primary w-full py-3.5 disabled:opacity-50">
          {submitting ? 'Submitting...' : 'Submit'}
        </button>
      </form>

      {/* BUG DETAILS MODAL */}
      {showBugModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-2xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
              <h2 className="text-xl font-bold text-white">Bug Details</h2>
              <button onClick={() => setShowBugModal(false)} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveBug} className="space-y-4">
              <div className="form-group">
                <label className="form-label">Headline *</label>
                <input required value={bugForm.title} onChange={e => setBugForm({ ...bugForm, title: e.target.value })} className="form-input" />
              </div>

              <div className="form-group">
                <label className="form-label">Description *</label>
                <textarea required rows={2} value={bugForm.description} onChange={e => setBugForm({ ...bugForm, description: e.target.value })} className="form-textarea" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="form-group">
                  <label className="form-label">Bug Type *</label>
                  <select required value={bugForm.bug_type} onChange={e => setBugForm({ ...bugForm, bug_type: e.target.value })} className="form-select">
                    {BUG_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Severity *</label>
                  <select required value={bugForm.severity} onChange={e => setBugForm({ ...bugForm, severity: e.target.value as BugSeverity })} className="form-select">
                    {SEVERITIES.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Priority *</label>
                  <select required value={bugForm.priority} onChange={e => setBugForm({ ...bugForm, priority: e.target.value })} className="form-select">
                    {PRIORITIES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Steps to Reproduce *</label>
                <textarea required rows={3} value={bugForm.steps_to_reproduce} onChange={e => setBugForm({ ...bugForm, steps_to_reproduce: e.target.value })} className="form-textarea" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Expected Behavior *</label>
                  <input required value={bugForm.expected_result} onChange={e => setBugForm({ ...bugForm, expected_result: e.target.value })} className="form-input" />
                </div>
                <div className="form-group">
                  <label className="form-label">Actual Behavior *</label>
                  <input required value={bugForm.actual_result} onChange={e => setBugForm({ ...bugForm, actual_result: e.target.value })} className="form-input" />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Screenshots (max 3, optional)</label>
                <div className="grid grid-cols-3 gap-3">
                  {[0, 1, 2].map(i => (
                    <ScreenshotSlot
                      key={i}
                      url={bugForm.screenshot_urls[i]}
                      uploading={uploadingSlots[i]}
                      error={uploadErrors[i]}
                      onSelect={file => handleScreenshotUpload(i, file)}
                      onRemove={() => handleRemoveScreenshot(i)}
                    />
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">OS *</label>
                  <select required value={bugForm.device_platform} onChange={e => setBugForm({ ...bugForm, device_platform: e.target.value })} className="form-select">
                    <option value="Android">Android</option>
                    <option value="iOS">iOS</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Brand / Model No. (optional)</label>
                  <input value={bugForm.brand_model} onChange={e => setBugForm({ ...bugForm, brand_model: e.target.value })} className="form-input" placeholder="e.g. Samsung Galaxy S23" />
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
                <button type="button" onClick={() => setShowBugModal(false)} className="btn btn-ghost">Cancel</button>
                <button type="submit" className="btn btn-primary px-8">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

interface ScreenshotSlotProps {
  url: string;
  uploading: boolean;
  error: string | null;
  onSelect: (file: File | undefined) => void;
  onRemove: () => void;
}

const ScreenshotSlot: React.FC<ScreenshotSlotProps> = ({ url, uploading, error, onSelect, onRemove }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="space-y-1">
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={e => onSelect(e.target.files?.[0])}
      />

      {url ? (
        <div className="relative group">
          <img src={url} alt="Bug screenshot" className="w-full h-24 object-cover rounded-xl border border-white/10" />
          <button
            type="button"
            onClick={onRemove}
            className="absolute top-1 right-1 p-1 bg-slate-950/80 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={uploading}
          className="w-full h-24 flex flex-col items-center justify-center gap-1 rounded-xl border border-dashed border-white/20 text-gray-400 hover:border-indigo-400/50 hover:text-indigo-300 transition-colors disabled:opacity-60"
        >
          {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ImageIcon className="w-5 h-5" />}
          <span className="text-[10px]">{uploading ? 'Uploading...' : 'Add Image'}</span>
        </button>
      )}

      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
};

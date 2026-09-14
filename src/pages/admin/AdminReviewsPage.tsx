import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore } from '../../lib/supabase';
import { useAuth } from '../../context/AuthContext';
import { ContestReview, ReviewStatus } from '../../types';
import { Trophy, ArrowLeft, Save, Star, ShieldCheck, CheckCircle2, Award } from 'lucide-react';

export const AdminReviewsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentAdmin } = useAuth();

  const contest = dbStore.getContests().find(c => c.id === id);
  const submissions = dbStore.getSubmissions().filter(s => s.contest_id === id);
  const registrations = dbStore.getRegistrations().filter(r => r.contest_id === id);
  const reviews = dbStore.getReviews().filter(r => r.contest_id === id);

  const [selectedRegistrationId, setSelectedRegistrationId] = useState<string>(submissions[0]?.registration_id || '');

  // Form State for selected participant
  const currentReview = reviews.find(r => r.registration_id === selectedRegistrationId);

  const [bugQualityScore, setBugQualityScore] = useState<number>(currentReview?.bug_quality_score || 8.0);
  const [coverageScore, setCoverageScore] = useState<number>(currentReview?.coverage_score || 8.5);
  const [uiScore, setUiScore] = useState<number>(currentReview?.ui_feedback_score || 7.5);
  const [suggestionScore, setSuggestionScore] = useState<number>(currentReview?.suggestion_score || 7.0);
  const [reviewStatus, setReviewStatus] = useState<ReviewStatus>(currentReview?.review_status || 'shortlisted');
  const [internalNotes, setInternalNotes] = useState<string>(currentReview?.internal_notes || 'Found critical pose estimation frame drop bugs.');

  const [savedSuccess, setSavedSuccess] = useState(false);

  const calculateOverall = () => {
    return Number(((bugQualityScore + coverageScore + uiScore + suggestionScore) / 4).toFixed(2));
  };

  const handleSelectParticipant = (registrationId: string) => {
    setSelectedRegistrationId(registrationId);
    const existing = reviews.find(r => r.registration_id === registrationId);
    if (existing) {
      setBugQualityScore(existing.bug_quality_score);
      setCoverageScore(existing.coverage_score);
      setUiScore(existing.ui_feedback_score);
      setSuggestionScore(existing.suggestion_score);
      setReviewStatus(existing.review_status);
      setInternalNotes(existing.internal_notes || '');
    } else {
      setBugQualityScore(8.0);
      setCoverageScore(8.0);
      setUiScore(7.5);
      setSuggestionScore(7.0);
      setReviewStatus('pending');
      setInternalNotes('');
    }
  };

  const handleSaveReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRegistrationId || !id) return;

    const overall = calculateOverall();

    dbStore.saveReview({
      contest_id: id,
      registration_id: selectedRegistrationId,
      reviewer_id: currentAdmin?.id,
      bug_quality_score: bugQualityScore,
      coverage_score: coverageScore,
      ui_feedback_score: uiScore,
      suggestion_score: suggestionScore,
      overall_score: overall,
      review_status: reviewStatus,
      internal_notes: internalNotes,
    });

    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const selectedRegistration = registrations.find(r => r.id === selectedRegistrationId);

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/plasma/contests" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
              {contest?.title || 'Contest'}
            </span>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-6 h-6 text-amber-400" /> Internal Judging & Scoring Engine
            </h1>
          </div>
        </div>

        <Link to={`/plasma/contests/${id}/winner`} className="btn btn-primary text-xs flex items-center gap-2">
          <Award className="w-4 h-4 text-pink-400" /> Proceed to Winner Selection
        </Link>
      </div>

      <div className="p-3 bg-amber-950/40 border border-amber-500/30 rounded-2xl flex items-center gap-2 text-xs text-amber-200">
        <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0" />
        <span><strong>Private Admin Confidentiality Notice:</strong> All scores and internal notes are strictly restricted to admin staff via database RLS.</span>
      </div>

      {submissions.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          
          {/* PARTICIPANT SELECTOR LIST */}
          <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-3">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-2">
              Submitting Participants ({submissions.length})
            </h3>

            <div className="space-y-2">
              {submissions.map(sub => {
                const tester = registrations.find(r => r.id === sub.registration_id);
                const rev = reviews.find(r => r.registration_id === sub.registration_id);
                const isSelected = sub.registration_id === selectedRegistrationId;

                return (
                  <button
                    key={sub.id}
                    onClick={() => handleSelectParticipant(sub.registration_id || '')}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-lg'
                        : 'bg-slate-900/80 border-white/5 text-gray-300 hover:bg-white/5'
                    }`}
                  >
                    <div>
                      <span className="font-bold text-sm block">{tester?.full_name || 'Tester'}</span>
                      <span className="text-[11px] text-gray-400">{tester?.email}</span>
                    </div>

                    <div className="text-right">
                      {rev ? (
                        <span className="text-xs font-extrabold text-amber-400 block">
                          Score: {rev.overall_score}/10
                        </span>
                      ) : (
                        <span className="text-[10px] text-gray-500 uppercase block font-semibold">Unscored</span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* SCORING FORM */}
          <div className="md:col-span-2 bg-glass-card p-8 rounded-3xl border border-white/10 space-y-6">
            
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div>
                <span className="text-xs font-bold text-indigo-400 uppercase">Evaluating Tester</span>
                <h2 className="text-xl font-bold text-white">{selectedRegistration?.full_name || 'Select Participant'}</h2>
              </div>

              <div className="text-right">
                <span className="text-xs text-gray-400 block font-semibold">Calculated Overall Score</span>
                <span className="text-3xl font-black text-amber-400 font-heading">{calculateOverall()} / 10</span>
              </div>
            </div>

            {savedSuccess && (
              <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                <span>Scores & internal admin notes saved!</span>
              </div>
            )}

            <form onSubmit={handleSaveReview} className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                
                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label">Bug Quality Score (0-10)</label>
                    <span className="text-xs font-bold text-indigo-400">{bugQualityScore}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5"
                    value={bugQualityScore} 
                    onChange={e => setBugQualityScore(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label">Testing Coverage (0-10)</label>
                    <span className="text-xs font-bold text-indigo-400">{coverageScore}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5"
                    value={coverageScore} 
                    onChange={e => setCoverageScore(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label">UI/UX Feedback Quality (0-10)</label>
                    <span className="text-xs font-bold text-cyan-400">{uiScore}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5"
                    value={uiScore} 
                    onChange={e => setUiScore(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

                <div className="form-group">
                  <div className="flex justify-between items-center mb-1">
                    <label className="form-label">Feature Suggestions (0-10)</label>
                    <span className="text-xs font-bold text-cyan-400">{suggestionScore}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="10" 
                    step="0.5"
                    value={suggestionScore} 
                    onChange={e => setSuggestionScore(Number(e.target.value))}
                    className="w-full accent-cyan-500"
                  />
                </div>

              </div>

              <div className="form-group">
                <label className="form-label">Review Status Decision *</label>
                <select
                  value={reviewStatus}
                  onChange={e => setReviewStatus(e.target.value as ReviewStatus)}
                  className="form-select"
                >
                  <option value="shortlisted">⭐ Shortlisted Finalist</option>
                  <option value="valid">✓ Valid Submission</option>
                  <option value="pending">⏳ Pending Review</option>
                  <option value="invalid">✗ Invalid / Non-reproducible</option>
                  <option value="rejected">🚫 Rejected</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Internal Admin Confidential Notes</label>
                <textarea 
                  rows={3}
                  placeholder="Record internal rationale, verified bug IDs, and judging notes..."
                  value={internalNotes}
                  onChange={e => setInternalNotes(e.target.value)}
                  className="form-textarea"
                />
              </div>

              <button type="submit" className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
                <Save className="w-4 h-4" /> Save Score & Internal Evaluation
              </button>

            </form>

          </div>

        </div>
      ) : (
        <div className="bg-glass p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto border border-white/10">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Submissions Recorded Yet</h3>
          <p className="text-gray-400 text-sm">Judging will become available once participants submit their testing findings.</p>
        </div>
      )}

    </div>
  );
};

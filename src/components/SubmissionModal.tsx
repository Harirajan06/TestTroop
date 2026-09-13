import React, { useState } from 'react';
import { Contest, BugSeverity, BugReport, UIFeedback, Suggestion } from '../types';
import { dbStore } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { X, Bug, Layout, Lightbulb, Upload, CheckCircle2, AlertTriangle, Plus, Trash2 } from 'lucide-react';

interface SubmissionModalProps {
  contest: Contest;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message?: string) => void;
}

export const SubmissionModal: React.FC<SubmissionModalProps> = ({
  contest,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { user } = useAuth();

  // Active Category Tab
  const availableCategories = contest.allowed_categories || ['bug_report', 'ui_ux', 'suggestion'];
  const [activeTab, setActiveTab] = useState<'bug_report' | 'ui_ux' | 'suggestion'>(availableCategories[0]);

  // Form Lists
  const [bugReports, setBugReports] = useState<Partial<BugReport>[]>([
    {
      title: '',
      description: '',
      steps_to_reproduce: '1. Launch app\n2. Navigate to wallet\n3. Tap transfer button',
      expected_result: '',
      actual_result: '',
      severity: 'high',
      device_platform: contest.platform,
      screenshot_urls: [],
    }
  ]);

  const [uiFeedbacks, setUiFeedbacks] = useState<Partial<UIFeedback>[]>([
    {
      title: '',
      current_problem: '',
      suggested_improvement: '',
      detailed_explanation: '',
    }
  ]);

  const [suggestions, setSuggestions] = useState<Partial<Suggestion>[]>([
    {
      title: '',
      description: '',
      detailed_explanation: '',
    }
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleAddBug = () => {
    setBugReports([...bugReports, {
      title: '',
      description: '',
      steps_to_reproduce: '',
      expected_result: '',
      actual_result: '',
      severity: 'medium',
      device_platform: contest.platform,
    }]);
  };

  const handleAddUI = () => {
    setUiFeedbacks([...uiFeedbacks, { title: '', current_problem: '', suggested_improvement: '' }]);
  };

  const handleAddSuggestion = () => {
    setSuggestions([...suggestions, { title: '', description: '' }]);
  };

  const handleSubmitAll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError('You must be logged in to submit.');
      return;
    }

    // Basic Validation
    const validBugs = bugReports.filter(b => b.title && b.description);
    const validUI = uiFeedbacks.filter(u => u.title && u.current_problem);
    const validSuggestions = suggestions.filter(s => s.title && s.description);

    if (validBugs.length === 0 && validUI.length === 0 && validSuggestions.length === 0) {
      setError('Please fill in at least one structured bug report, UI improvement, or suggestion.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      dbStore.createFullSubmission(
        contest.id,
        user.id,
        validBugs,
        validUI,
        validSuggestions
      );

      setSubmitting(false);
      onSuccess(contest.custom_confirmation_message);
    } catch (err: any) {
      setSubmitting(false);
      setError(err.message || 'Submission failed. Please try again.');
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-4xl">
        
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {contest.title}
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
              Submit Testing Findings & Feedback
            </h2>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* CATEGORY TABS */}
        <div className="flex items-center gap-2 mb-6 border-b border-white/10 pb-2">
          {availableCategories.includes('bug_report') && (
            <button
              onClick={() => setActiveTab('bug_report')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'bug_report'
                  ? 'bg-red-500/20 border border-red-500/40 text-red-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Bug className="w-4 h-4 text-red-400" />
              Bug Reports ({bugReports.length})
            </button>
          )}

          {availableCategories.includes('ui_ux') && (
            <button
              onClick={() => setActiveTab('ui_ux')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'ui_ux'
                  ? 'bg-indigo-500/20 border border-indigo-500/40 text-indigo-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Layout className="w-4 h-4 text-indigo-400" />
              UI/UX Improvements ({uiFeedbacks.length})
            </button>
          )}

          {availableCategories.includes('suggestion') && (
            <button
              onClick={() => setActiveTab('suggestion')}
              className={`px-4 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all ${
                activeTab === 'suggestion'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Lightbulb className="w-4 h-4 text-cyan-400" />
              Suggestions ({suggestions.length})
            </button>
          )}
        </div>

        {/* FORM CONTENTS */}
        <form onSubmit={handleSubmitAll} className="space-y-6">
          
          {/* TAB 1: BUG REPORTS */}
          {activeTab === 'bug_report' && (
            <div className="space-y-6">
              {bugReports.map((bug, index) => (
                <div key={index} className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-red-400 uppercase tracking-wider">
                      Bug Report #{index + 1}
                    </span>
                    {bugReports.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setBugReports(bugReports.filter((_, i) => i !== index))}
                        className="text-gray-400 hover:text-red-400 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove Bug
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="form-group md:col-span-2">
                      <label className="form-label">Bug Title *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g., App crashes when attempting multi-currency wallet conversion"
                        value={bug.title || ''} 
                        onChange={e => {
                          const updated = [...bugReports];
                          updated[index].title = e.target.value;
                          setBugReports(updated);
                        }}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Severity Level *</label>
                      <select
                        value={bug.severity || 'medium'}
                        onChange={e => {
                          const updated = [...bugReports];
                          updated[index].severity = e.target.value as BugSeverity;
                          setBugReports(updated);
                        }}
                        className="form-select"
                      >
                        <option value="critical">Critical (App crash / Data loss / Security leak)</option>
                        <option value="high">High (Major feature broken)</option>
                        <option value="medium">Medium (Minor feature issue / Workaround available)</option>
                        <option value="low">Low (Cosmetic / Typo / Alignment)</option>
                        <option value="informational">Informational (Observation)</option>
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Testing Device / OS Platform *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g., iPhone 14 Pro, iOS 17.4 or Chrome 128 (macOS)"
                        value={bug.device_platform || ''} 
                        onChange={e => {
                          const updated = [...bugReports];
                          updated[index].device_platform = e.target.value;
                          setBugReports(updated);
                        }}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group md:col-span-2">
                      <label className="form-label">Detailed Description *</label>
                      <textarea 
                        required 
                        rows={2}
                        placeholder="Explain what happened and why it is a bug..."
                        value={bug.description || ''} 
                        onChange={e => {
                          const updated = [...bugReports];
                          updated[index].description = e.target.value;
                          setBugReports(updated);
                        }}
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-group md:col-span-2">
                      <label className="form-label">Steps to Reproduce *</label>
                      <textarea 
                        required 
                        rows={3}
                        placeholder="1. Open screen X&#10;2. Tap button Y&#10;3. Observe crash"
                        value={bug.steps_to_reproduce || ''} 
                        onChange={e => {
                          const updated = [...bugReports];
                          updated[index].steps_to_reproduce = e.target.value;
                          setBugReports(updated);
                        }}
                        className="form-textarea"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Expected Result *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g., Conversion succeeds and updates balance"
                        value={bug.expected_result || ''} 
                        onChange={e => {
                          const updated = [...bugReports];
                          updated[index].expected_result = e.target.value;
                          setBugReports(updated);
                        }}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group">
                      <label className="form-label">Actual Result *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g., Screen turns white and app terminates"
                        value={bug.actual_result || ''} 
                        onChange={e => {
                          const updated = [...bugReports];
                          updated[index].actual_result = e.target.value;
                          setBugReports(updated);
                        }}
                        className="form-input"
                      />
                    </div>

                    <div className="form-group md:col-span-2">
                      <label className="form-label">Screenshot / Video / Log Attachment URL (Supabase Storage Enabled)</label>
                      <input 
                        type="url" 
                        placeholder="https://storage.supabase.co/v1/object/public/submissions/bug-proof.png"
                        value={bug.screenshot_urls?.[0] || ''} 
                        onChange={e => {
                          const updated = [...bugReports];
                          updated[index].screenshot_urls = [e.target.value];
                          setBugReports(updated);
                        }}
                        className="form-input"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={handleAddBug}
                className="btn btn-secondary w-full py-3 flex items-center justify-center gap-2 border-dashed border-red-500/40 text-red-300 hover:bg-red-500/10"
              >
                <Plus className="w-4 h-4" /> Add Another Bug Report
              </button>
            </div>
          )}

          {/* TAB 2: UI/UX IMPROVEMENTS */}
          {activeTab === 'ui_ux' && (
            <div className="space-y-6">
              {uiFeedbacks.map((ui, index) => (
                <div key={index} className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
                      UI/UX Feedback #{index + 1}
                    </span>
                    {uiFeedbacks.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setUiFeedbacks(uiFeedbacks.filter((_, i) => i !== index))}
                        className="text-gray-400 hover:text-red-400 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Feedback Title *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g., Unclear CTA contrast on checkout screen"
                      value={ui.title || ''} 
                      onChange={e => {
                        const updated = [...uiFeedbacks];
                        updated[index].title = e.target.value;
                        setUiFeedbacks(updated);
                      }}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Current UX Problem *</label>
                    <textarea 
                      required 
                      rows={2}
                      placeholder="Explain what causes confusion or usability friction..."
                      value={ui.current_problem || ''} 
                      onChange={e => {
                        const updated = [...uiFeedbacks];
                        updated[index].current_problem = e.target.value;
                        setUiFeedbacks(updated);
                      }}
                      className="form-textarea"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Suggested UI Improvement *</label>
                    <textarea 
                      required 
                      rows={2}
                      placeholder="Describe how the design or micro-interaction should be changed..."
                      value={ui.suggested_improvement || ''} 
                      onChange={e => {
                        const updated = [...uiFeedbacks];
                        updated[index].suggested_improvement = e.target.value;
                        setUiFeedbacks(updated);
                      }}
                      className="form-textarea"
                    />
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={handleAddUI}
                className="btn btn-secondary w-full py-3 flex items-center justify-center gap-2 border-dashed border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10"
              >
                <Plus className="w-4 h-4" /> Add Another UI/UX Improvement
              </button>
            </div>
          )}

          {/* TAB 3: SUGGESTIONS */}
          {activeTab === 'suggestion' && (
            <div className="space-y-6">
              {suggestions.map((sug, index) => (
                <div key={index} className="p-5 bg-slate-900/80 border border-white/10 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3">
                    <span className="text-xs font-bold text-cyan-400 uppercase tracking-wider">
                      Product Suggestion #{index + 1}
                    </span>
                    {suggestions.length > 1 && (
                      <button 
                        type="button" 
                        onClick={() => setSuggestions(suggestions.filter((_, i) => i !== index))}
                        className="text-gray-400 hover:text-red-400 text-xs flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Remove
                      </button>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">Feature Suggestion Title *</label>
                    <input 
                      type="text" 
                      required 
                      placeholder="e.g., Add biometrics shortcut for quick transfer re-attempts"
                      value={sug.title || ''} 
                      onChange={e => {
                        const updated = [...suggestions];
                        updated[index].title = e.target.value;
                        setSuggestions(updated);
                      }}
                      className="form-input"
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Detailed Rationale & Value *</label>
                    <textarea 
                      required 
                      rows={3}
                      placeholder="Why would this feature benefit product users?"
                      value={sug.description || ''} 
                      onChange={e => {
                        const updated = [...suggestions];
                        updated[index].description = e.target.value;
                        setSuggestions(updated);
                      }}
                      className="form-textarea"
                    />
                  </div>
                </div>
              ))}

              <button 
                type="button" 
                onClick={handleAddSuggestion}
                className="btn btn-secondary w-full py-3 flex items-center justify-center gap-2 border-dashed border-cyan-500/40 text-cyan-300 hover:bg-cyan-500/10"
              >
                <Plus className="w-4 h-4" /> Add Another Suggestion
              </button>
            </div>
          )}

          {/* SUBMIT BUTTON */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button type="button" onClick={onClose} className="btn btn-ghost">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={submitting} 
              className="btn btn-primary px-8"
            >
              {submitting ? (
                <span>Recording Submission...</span>
              ) : (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Submit Testing Findings
                </span>
              )}
            </button>
          </div>

        </form>

      </div>
    </div>
  );
};

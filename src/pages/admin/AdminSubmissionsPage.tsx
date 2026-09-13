import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore } from '../../lib/supabase';
import { 
  FileText, 
  ArrowLeft, 
  Bug, 
  Layout, 
  Lightbulb, 
  User, 
  ExternalLink, 
  CheckCircle, 
  Trophy 
} from 'lucide-react';

export const AdminSubmissionsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const contest = dbStore.getContests().find(c => c.id === id);
  const submissions = dbStore.getSubmissions().filter(s => s.contest_id === id);
  const allBugs = dbStore.getBugReports().filter(b => b.contest_id === id);
  const allUI = dbStore.getUIFeedback().filter(u => u.contest_id === id);
  const allSuggestions = dbStore.getSuggestions().filter(s => s.contest_id === id);
  const allUsers = dbStore.getUsers();

  const [activeTab, setActiveTab] = useState<'bugs' | 'ui' | 'suggestions'>('bugs');

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/contests" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
              {contest?.title || 'Contest'}
            </span>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText className="w-6 h-6 text-cyan-400" /> Submission Review Workspace
            </h1>
          </div>
        </div>

        <Link to={`/admin/contests/${id}/reviews`} className="btn btn-primary text-xs flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Open Judging Engine
        </Link>
      </div>

      {/* CATEGORY TABS */}
      <div className="flex items-center gap-3 border-b border-white/10 pb-2">
        <button
          onClick={() => setActiveTab('bugs')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'bugs'
              ? 'bg-red-500/20 text-red-300 border border-red-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Bug className="w-4 h-4 text-red-400" />
          Verified Bug Reports ({allBugs.length})
        </button>

        <button
          onClick={() => setActiveTab('ui')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'ui'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Layout className="w-4 h-4 text-indigo-400" />
          UI/UX Improvements ({allUI.length})
        </button>

        <button
          onClick={() => setActiveTab('suggestions')}
          className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 transition-all ${
            activeTab === 'suggestions'
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
              : 'text-gray-400 hover:text-white'
          }`}
        >
          <Lightbulb className="w-4 h-4 text-cyan-400" />
          Suggestions ({allSuggestions.length})
        </button>
      </div>

      {/* TAB CONTENTS */}
      {activeTab === 'bugs' && (
        <div className="space-y-4">
          {allBugs.length > 0 ? (
            allBugs.map(b => {
              const tester = allUsers.find(u => u.id === b.user_id);
              return (
                <div key={b.id} className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/5 pb-3">
                    <div className="flex items-center gap-2">
                      <span className={`badge ${b.severity === 'critical' ? 'badge-danger' : 'badge-testing_live'}`}>
                        {b.severity} SEVERITY
                      </span>
                      <span className="text-xs text-gray-400 font-semibold">{b.device_platform}</span>
                    </div>

                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <User className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Submitted by <strong>{tester?.full_name || 'Tester'}</strong></span>
                    </div>
                  </div>

                  <h3 className="text-lg font-bold text-white">{b.title}</h3>
                  <p className="text-gray-300 text-sm">{b.description}</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 text-xs">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-gray-400 font-bold block">Steps to Reproduce</span>
                      <pre className="text-gray-200 font-mono whitespace-pre-wrap">{b.steps_to_reproduce}</pre>
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 space-y-2">
                      <div>
                        <span className="text-gray-400 font-bold block">Expected Result</span>
                        <span className="text-emerald-400 font-medium">{b.expected_result}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block">Actual Result</span>
                        <span className="text-red-400 font-medium">{b.actual_result}</span>
                      </div>
                    </div>
                  </div>

                  {b.screenshot_urls && b.screenshot_urls.length > 0 && b.screenshot_urls[0] && (
                    <div className="pt-2 flex items-center gap-2 text-xs">
                      <ExternalLink className="w-4 h-4 text-indigo-400" />
                      <a href={b.screenshot_urls[0]} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:underline font-semibold">
                        View Attached Screenshot / Video Proof
                      </a>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <div className="bg-glass p-10 rounded-2xl text-center text-gray-400 text-sm">
              No bug reports recorded for this contest yet.
            </div>
          )}
        </div>
      )}

      {activeTab === 'ui' && (
        <div className="space-y-4">
          {allUI.length > 0 ? (
            allUI.map(u => {
              const tester = allUsers.find(usr => usr.id === u.user_id);
              return (
                <div key={u.id} className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-4">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 text-xs">
                    <span className="font-bold text-indigo-300">UI/UX Improvement</span>
                    <span className="text-gray-400">Tester: <strong>{tester?.full_name}</strong></span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{u.title}</h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-gray-400 font-bold block">Current UX Problem</span>
                      <p className="text-gray-200">{u.current_problem}</p>
                    </div>

                    <div className="bg-slate-900/80 p-3.5 rounded-xl border border-white/5 space-y-1">
                      <span className="text-gray-400 font-bold block">Suggested Improvement</span>
                      <p className="text-indigo-300 font-medium">{u.suggested_improvement}</p>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="bg-glass p-10 rounded-2xl text-center text-gray-400 text-sm">
              No UI/UX feedback recorded for this contest yet.
            </div>
          )}
        </div>
      )}

      {activeTab === 'suggestions' && (
        <div className="space-y-4">
          {allSuggestions.length > 0 ? (
            allSuggestions.map(s => {
              const tester = allUsers.find(usr => usr.id === s.user_id);
              return (
                <div key={s.id} className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-3">
                  <div className="flex items-center justify-between border-b border-white/5 pb-3 text-xs">
                    <span className="font-bold text-cyan-300">Product Feature Suggestion</span>
                    <span className="text-gray-400">Tester: <strong>{tester?.full_name}</strong></span>
                  </div>

                  <h3 className="text-lg font-bold text-white">{s.title}</h3>
                  <p className="text-gray-300 text-sm leading-relaxed">{s.description}</p>
                </div>
              );
            })
          ) : (
            <div className="bg-glass p-10 rounded-2xl text-center text-gray-400 text-sm">
              No suggestions recorded for this contest yet.
            </div>
          )}
        </div>
      )}

    </div>
  );
};

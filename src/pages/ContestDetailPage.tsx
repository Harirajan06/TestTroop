import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore, fetchContestsAsync } from '../lib/supabase';
import { Contest } from '../types';
import { StatusBadge } from '../components/StatusBadge';
import { WinnerModal } from '../components/WinnerModal';
import { RegistrationModal } from '../components/RegistrationModal';
import {
  Trophy,
  Calendar,
  ExternalLink,
  Globe,
  CheckCircle2,
  FileText,
  Award,
  ShieldCheck,
} from 'lucide-react';

export const ContestDetailPage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();

  const [contest, setContest] = useState<Contest | null>(null);
  const [justRegistered, setJustRegistered] = useState(false);

  const [showRegistrationModal, setShowRegistrationModal] = useState(false);
  const [showWinnerModal, setShowWinnerModal] = useState(false);

  useEffect(() => {
    if (!slug) return;

    const loadContest = async () => {
      let found = dbStore.getContests().find(c => c.slug === slug || c.id === slug);
      if (!found) {
        const fetched = await fetchContestsAsync();
        found = fetched.find(c => c.slug === slug || c.id === slug);
      }

      if (found) {
        setContest(found);
      }
    };

    loadContest();
  }, [slug]);

  if (!contest) {
    return (
      <div className="py-20 text-center space-y-4">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Contest Not Found</h2>
        <p className="text-gray-400 text-sm">The requested contest slug does not exist or has been removed.</p>
        <Link to="/contests" className="btn btn-primary">Back to Contests</Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isRegistrationOpen = contest.status === 'registration_open' || contest.status === 'testing_live';
  const isTestingLive = contest.status === 'testing_live';
  const isTestingStarted = ['testing_live', 'submission_closed', 'results_pending', 'winner_announced', 'completed'].includes(contest.status);

  const handleRegistrationSuccess = () => {
    setShowRegistrationModal(false);
    setJustRegistered(true);
    setContest({ ...contest, registration_count: (contest.registration_count || 0) + 1 });
  };

  return (
    <div className="space-y-10 py-6 max-w-6xl mx-auto">
      
      {/* BANNER & HEADER */}
      <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-slate-950">
        <div className="h-64 sm:h-80 w-full relative">
          <img 
            src={contest.banner_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=1200&q=80'} 
            alt={contest.title} 
            className="w-full h-full object-cover opacity-80"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/60 to-transparent" />
        </div>

        <div className="p-6 sm:p-10 -mt-24 relative z-10 space-y-6">
          <div className="flex flex-wrap items-center gap-3">
            <StatusBadge status={contest.status} />
            <span className="bg-indigo-950/80 border border-indigo-500/30 px-3 py-1 rounded-full text-xs font-bold text-indigo-300">
              {contest.contest_type.replace('_', ' ').toUpperCase()}
            </span>
            <span className="bg-slate-900/80 border border-white/10 px-3 py-1 rounded-full text-xs font-semibold text-gray-300">
              {contest.platform}
            </span>
          </div>

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="space-y-2 max-w-3xl">
              <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
                {contest.title}
              </h1>
              <p className="text-gray-300 text-base leading-relaxed">
                {contest.description}
              </p>
            </div>

            {/* PRIZE & CTA CARD */}
            <div className="bg-glass p-5 rounded-2xl border border-indigo-500/30 text-center min-w-[240px] space-y-3 shrink-0 shadow-2xl">
              <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider block">Total Prize Pool</span>
              <span className="text-3xl font-extrabold text-gradient font-heading">₹{contest.prize_amount.toLocaleString()}</span>
              
              {!justRegistered ? (
                <button
                  onClick={() => setShowRegistrationModal(true)}
                  disabled={!isRegistrationOpen}
                  className="btn btn-primary w-full py-3 text-sm font-semibold shadow-lg shadow-indigo-600/30"
                >
                  {isRegistrationOpen ? 'Register For Contest' : 'Registration Closed'}
                </button>
              ) : (
                <div className="p-2.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-bold flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Registered! Check your email closer to the contest date.</span>
                </div>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* WINNER FOUND NOTIFIER IF ANNOUNCED */}
      {contest.status === 'winner_announced' && contest.winner && (
        <div className="bg-gradient-to-r from-pink-950/80 via-purple-950/80 to-slate-950 border border-pink-500/40 p-6 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-pink-500/20 rounded-2xl text-pink-400">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">🏆 Contest Winner Officially Announced!</h3>
              <p className="text-gray-300 text-xs">{contest.winner.announcement_headline}</p>
            </div>
          </div>
          <button 
            onClick={() => setShowWinnerModal(true)}
            className="btn bg-pink-500 hover:bg-pink-600 text-white text-xs font-bold px-6 py-2.5 rounded-xl shrink-0"
          >
            View Winner Announcement
          </button>
        </div>
      )}

      {/* PRODUCT URL BAR */}
      <div className="grid grid-cols-1 gap-6">

        {/* PRODUCT URL */}
        {isTestingStarted ? (
          <div className="bg-glass-card p-6 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-gray-400 font-semibold block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-indigo-400" /> Target Application URL
              </span>
              <span className="text-sm font-bold text-white truncate block max-w-[280px]">
                {contest.product_url || 'Provided upon testing start'}
              </span>
            </div>
            {contest.product_url && (
              <a 
                href={contest.product_url} 
                target="_blank" 
                rel="noopener noreferrer" 
                className="btn btn-secondary btn-sm flex items-center gap-1.5 shrink-0"
              >
                <span>Open Target</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        ) : (
          <div className="bg-slate-900/60 p-6 rounded-2xl border border-white/10 flex items-center justify-between">
            <div className="space-y-1">
              <span className="text-xs text-amber-400/90 font-semibold block flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-amber-400" /> Target Application URL (Locked)
              </span>
              <span className="text-xs text-gray-400 block">
                Will be revealed when testing starts on <span className="text-white font-medium">{formatDate(contest.contest_start)}</span>
              </span>
            </div>
            <span className="px-3 py-1.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-xs font-semibold text-amber-300 shrink-0 flex items-center gap-1">
              🔒 Unlocks at Testing Start
            </span>
          </div>
        )}

      </div>

      {/* TWO COLUMN DETAILS & SCHEDULE */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: INSTRUCTIONS & ELIGIBILITY */}
        <div className="md:col-span-2 space-y-8">
          
          {/* TESTING INSTRUCTIONS */}
          <div className="bg-glass-card p-8 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
              <FileText className="w-5 h-5 text-indigo-400" />
              Detailed Testing Instructions
            </h3>
            <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed whitespace-pre-line">
              {contest.testing_instructions}
            </div>
          </div>

          {/* ELIGIBILITY & RESTRICTIONS */}
          {contest.eligibility_requirements && (
            <div className="bg-glass-card p-8 rounded-3xl border border-white/10 space-y-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 border-b border-white/10 pb-4">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
                Eligibility & Tester Requirements
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed whitespace-pre-line">
                {contest.eligibility_requirements}
              </p>
            </div>
          )}

          {/* ALLOWED SUBMISSION CATEGORIES */}
          <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-3">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider block">
              Configured Submission Categories for this Contest:
            </span>
            <div className="flex flex-wrap gap-2">
              {contest.allowed_categories.map(cat => (
                <span key={cat} className="px-3 py-1.5 bg-indigo-950/60 border border-indigo-500/30 rounded-xl text-xs font-bold text-indigo-200 capitalize">
                  ✓ {cat.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: CONTEST TIMELINE / SCHEDULE */}
        <div className="space-y-6">
          <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Calendar className="w-5 h-5 text-amber-400" />
              Contest Schedule & Deadlines
            </h3>

            <div className="space-y-4 text-xs">
              
              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 block font-medium">Registration Opens</span>
                <span className="text-white font-semibold block">{formatDate(contest.registration_start)}</span>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 block font-medium">Registration Closes</span>
                <span className="text-indigo-300 font-semibold block">{formatDate(contest.registration_end)}</span>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 block font-medium">Testing Starts</span>
                <span className="text-emerald-400 font-semibold block">{formatDate(contest.contest_start)}</span>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 block font-medium">Submission Deadline</span>
                <span className="text-amber-400 font-bold block">{formatDate(contest.submission_deadline)}</span>
              </div>

              <div className="p-3.5 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                <span className="text-gray-400 block font-medium">Winner Announcement Date</span>
                <span className="text-pink-400 font-bold block">{formatDate(contest.result_date)}</span>
              </div>

            </div>
          </div>
        </div>

      </div>

      {/* MODALS */}
      {showWinnerModal && contest.winner && (
        <WinnerModal
          contest={contest}
          isOpen={showWinnerModal}
          onClose={() => setShowWinnerModal(false)}
        />
      )}

      {showRegistrationModal && (
        <RegistrationModal
          contest={contest}
          isOpen={showRegistrationModal}
          onClose={() => setShowRegistrationModal(false)}
          onSuccess={handleRegistrationSuccess}
        />
      )}

    </div>
  );
};

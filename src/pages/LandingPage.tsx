import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbStore, fetchContestsAsync } from '../lib/supabase';
import { ContestCard } from '../components/ContestCard';
import { WinnerModal } from '../components/WinnerModal';
import { Contest } from '../types';
import { 
  ShieldCheck, 
  Trophy, 
  CheckCircle, 
  ArrowRight, 
  Sparkles, 
  IndianRupee 
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>(() => dbStore.getContests());
  const winners = dbStore.getWinners();

  useEffect(() => {
    fetchContestsAsync().then(fetched => {
      if (fetched && fetched.length > 0) {
        setContests(fetched);
      }
    });
  }, []);

  const liveContests = contests.filter(c => c.status === 'testing_live' || c.status === 'registration_open').slice(0, 3);
  const [selectedWinnerContest, setSelectedWinnerContest] = useState<Contest | null>(null);

  return (
    <div className="space-y-24 pb-16">
      
      {/* 1. HERO SECTION */}
      <section className="relative pt-12 pb-20 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-tr from-indigo-600/30 via-cyan-500/20 to-pink-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="container mx-auto px-4 text-center relative z-10 space-y-8">
          
          <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1.5 text-xs font-bold text-indigo-300 shadow-lg shadow-indigo-500/10">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>The #1 Crowdsourced Software Testing Contest Network</span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-7xl font-extrabold tracking-tight text-white max-w-5xl mx-auto leading-[1.1]">
            Test Cutting-Edge Apps. <br />
            <span className="text-gradient">Find Bugs. Win Cash Prizes.</span>
          </h1>

          <p className="text-lg md:text-xl text-gray-300 max-w-2xl mx-auto leading-relaxed">
            Participate in real-world software testing contests for mobile apps, fintech platforms, and web SaaS. Earn rewards for every verified bug, UI improvement, and feature suggestion.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link to="/signup" className="btn btn-primary btn-lg w-full sm:w-auto shadow-xl shadow-indigo-600/30">
              <span>Sign Up as a Tester</span>
              <ArrowRight className="w-5 h-5" />
            </Link>
            <Link to="/contests" className="btn btn-secondary btn-lg w-full sm:w-auto">
              <Trophy className="w-5 h-5 text-amber-400" />
              <span>Browse Active Contests</span>
            </Link>
          </div>

          {/* METRICS STRIP (UPDATED) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 pt-12 border-t border-white/10 max-w-2xl mx-auto">
            <div className="space-y-1 bg-glass-card p-6 rounded-2xl border border-emerald-500/20">
              <span className="text-4xl font-black text-emerald-400 font-heading">100%</span>
              <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">On-Time Payout Rate</span>
            </div>
            
            <div className="space-y-1 bg-glass-card p-6 rounded-2xl border border-indigo-500/20">
              <span className="text-4xl font-black text-indigo-400 font-heading">₹10,000</span>
              <span className="text-xs text-gray-400 block font-medium uppercase tracking-wider">Max Prize Pool</span>
            </div>
          </div>

        </div>
      </section>

      {/* 2. WHAT IS THE TEST TROOP */}
      <section className="container mx-auto px-4">
        <div className="bg-glass-card p-8 md:p-12 rounded-3xl border border-white/10 grid grid-cols-1 md:grid-cols-2 gap-10 items-center">
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-4 h-4" /> About The Platform
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-white leading-tight">
              Where Product Teams Meets Elite QA Testers
            </h2>
            <p className="text-gray-300 text-base leading-relaxed">
              The Test Troop bridges software development teams with an agile community of freelance QA engineers, usability specialists, and tech enthusiasts. Before major app launches, product owners run structured testing contests with real cash rewards for discovering critical bugs and UX friction.
            </p>
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Structured bug reporting with steps, logs, and screenshots</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Dedicated WhatsApp group support per contest</span>
              </div>
              <div className="flex items-center gap-3 text-sm text-gray-200">
                <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
                <span>Fair admin judging and fast payout distribution</span>
              </div>
            </div>
          </div>

          <div className="relative">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=800&q=80" 
              alt="Testing Team" 
              className="rounded-2xl border border-white/10 shadow-2xl object-cover h-80 w-full"
            />
            <div className="absolute -bottom-5 -left-5 bg-indigo-950/90 border border-indigo-500/30 p-4 rounded-2xl shadow-xl backdrop-blur-md max-w-xs">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-xl">
                  <IndianRupee className="w-6 h-6" />
                </div>
                <div>
                  <span className="text-xs text-gray-400 block font-semibold">Max Reward / Contest</span>
                  <span className="text-lg font-bold text-white">₹10,000 INR</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. HOW CONTESTS WORK */}
      <section className="container mx-auto px-4 text-center space-y-12">
        <div>
          <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-2">Step-by-Step Flow</span>
          <h2 className="text-3xl md:text-4xl font-bold text-white">How Testing Contests Work</h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          <div className="bg-glass-card p-6 rounded-2xl border border-white/10 text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center font-bold text-lg">
              1
            </div>
            <h3 className="text-lg font-bold text-white">1. Create Profile</h3>
            <p className="text-gray-400 text-sm">Sign up free with your email and mobile number to unlock access to active testing contests.</p>
          </div>

          <div className="bg-glass-card p-6 rounded-2xl border border-white/10 text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-cyan-600/20 border border-cyan-500/30 text-cyan-400 flex items-center justify-center font-bold text-lg">
              2
            </div>
            <h3 className="text-lg font-bold text-white">2. Register & Join WhatsApp</h3>
            <p className="text-gray-400 text-sm">Register for open contests and join the official WhatsApp group for test credentials and live updates.</p>
          </div>

          <div className="bg-glass-card p-6 rounded-2xl border border-white/10 text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-pink-600/20 border border-pink-500/30 text-pink-400 flex items-center justify-center font-bold text-lg">
              3
            </div>
            <h3 className="text-lg font-bold text-white">3. Test & Submit Findings</h3>
            <p className="text-gray-400 text-sm">Execute test scenarios on mobile or web apps. Submit structured bug reports, UI reviews, and suggestions.</p>
          </div>

          <div className="bg-glass-card p-6 rounded-2xl border border-white/10 text-left space-y-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600/20 border border-amber-500/30 text-amber-400 flex items-center justify-center font-bold text-lg">
              4
            </div>
            <h3 className="text-lg font-bold text-white">4. Win Cash Prizes</h3>
            <p className="text-gray-400 text-sm">Our admin panel evaluates submissions based on bug severity and coverage. Winners receive cash payouts!</p>
          </div>
        </div>
      </section>

      {/* 4. CURRENT / UPCOMING CONTESTS */}
      <section className="container mx-auto px-4 space-y-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="text-xs font-bold text-cyan-400 uppercase tracking-widest block mb-1">Live Opportunities</span>
            <h2 className="text-3xl font-bold text-white">Featured Active Contests</h2>
          </div>
          <Link to="/contests" className="btn btn-secondary text-sm flex items-center gap-2 self-start">
            <span>View All Contests ({contests.length})</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {liveContests.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {liveContests.map(c => (
              <ContestCard 
                key={c.id} 
                contest={c} 
                onOpenWinnerModal={(contest) => setSelectedWinnerContest(contest)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-glass p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto border border-white/10">
            <Trophy className="w-12 h-12 text-amber-400 mx-auto" />
            <h3 className="text-xl font-bold text-white">No Active Contests Currently</h3>
            <p className="text-gray-400 text-sm">
              New software testing contests are created regularly by admin staff. Check back soon!
            </p>
          </div>
        )}
      </section>

      {/* 5. PREVIOUS CONTEST WINNERS */}
      {winners.length > 0 && (
        <section className="bg-slate-950/80 border-y border-white/10 py-16">
          <div className="container mx-auto px-4 space-y-10">
            <div className="text-center space-y-2">
              <span className="text-xs font-bold text-pink-400 uppercase tracking-widest block">Hall of Fame</span>
              <h2 className="text-3xl font-bold text-white">Recent Contest Winners</h2>
              <p className="text-gray-400 text-sm max-w-xl mx-auto">Meet the top testers who found critical bugs and earned top cash rewards.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {winners.slice(0, 3).map((w, idx) => (
                <div key={idx} className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-4 relative">
                  <div className="flex items-center gap-4">
                    <img 
                      src={w.winner_profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'} 
                      alt={w.winner_profile?.full_name} 
                      className="w-14 h-14 rounded-full object-cover ring-2 ring-pink-500/50"
                    />
                    <div>
                      <h3 className="font-bold text-white text-base">{w.winner_profile?.full_name}</h3>
                      <span className="text-xs text-pink-400 font-semibold">{w.prize_title}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5 space-y-1">
                    <span className="text-xs text-gray-400 font-medium block">{w.contest_title}</span>
                    <span className="text-emerald-400 font-bold text-lg">₹{w.prize_amount.toLocaleString()} Cash Prize</span>
                  </div>

                  <p className="text-gray-300 text-xs line-clamp-3 leading-relaxed">
                    "{w.announcement_body}"
                  </p>
                </div>
              ))}
            </div>

            <div className="text-center">
              <Link to="/winners" className="btn btn-ghost text-sm text-pink-300 hover:text-pink-200">
                View All Past Contest Winners →
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* 6. CALL TO ACTION */}
      <section className="container mx-auto px-4">
        <div className="bg-gradient-to-r from-indigo-900/60 via-purple-900/60 to-slate-900 border border-indigo-500/30 rounded-3xl p-10 md:p-14 text-center space-y-6 relative overflow-hidden">
          <h2 className="text-3xl md:text-5xl font-bold text-white max-w-3xl mx-auto">
            Ready to Turn Your QA & Testing Skills into Cash Rewards?
          </h2>
          <p className="text-gray-300 text-base max-w-xl mx-auto">
            Join thousands of active testers worldwide. Free registration takes less than 2 minutes.
          </p>
          <div className="pt-2">
            <Link to="/signup" className="btn btn-primary btn-lg shadow-xl shadow-indigo-600/40">
              Create Your Free Account
            </Link>
          </div>
        </div>
      </section>

      {/* WINNER MODAL */}
      {selectedWinnerContest && (
        <WinnerModal 
          contest={selectedWinnerContest}
          isOpen={Boolean(selectedWinnerContest)}
          onClose={() => setSelectedWinnerContest(null)}
        />
      )}

    </div>
  );
};

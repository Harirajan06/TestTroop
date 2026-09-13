import React, { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { dbStore } from '../lib/supabase';
import { StatusBadge } from '../components/StatusBadge';
import { Trophy, CheckCircle2, Send, Clock, Award, ArrowRight, User } from 'lucide-react';

export const UserDashboardPage: React.FC = () => {
  const { user, isAdmin } = useAuth();

  // If logged in as Admin, redirect directly to Admin Control Center /admin
  if (user && isAdmin) {
    return <Navigate to="/admin" replace />;
  }
  
  const allContests = dbStore.getContests();
  const allRegs = dbStore.getRegistrations().filter(r => r.user_id === user?.id);
  const allSubs = dbStore.getSubmissions().filter(s => s.user_id === user?.id);
  const allWinners = dbStore.getWinners().filter(w => w.winner_user_id === user?.id);

  const registeredContestIds = new Set(allRegs.map(r => r.contest_id));
  const submittedContestIds = new Set(allSubs.map(s => s.contest_id));
  const wonContestIds = new Set(allWinners.map(w => w.contest_id));

  const registeredContests = allContests.filter(c => registeredContestIds.has(c.id));
  const activeTestingContests = allContests.filter(c => c.status === 'testing_live');

  return (
    <div className="space-y-10 py-8">
      
      {/* HEADER BAR */}
      <div className="bg-glass-card p-8 rounded-3xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <img 
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80'} 
            alt={user?.full_name} 
            className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/50"
          />
          <div>
            <h1 className="text-2xl font-bold text-white">Welcome back, {user?.full_name}!</h1>
            <p className="text-xs text-gray-400 mt-1">Tester Profile ID: <code className="text-indigo-300 font-mono">{user?.id}</code></p>
          </div>
        </div>

        <Link to="/profile" className="btn btn-secondary text-xs flex items-center gap-2 self-start md:self-auto">
          <User className="w-4 h-4" /> Edit Profile
        </Link>
      </div>

      {/* STATS STRIP */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400 font-semibold block uppercase">Registered Contests</span>
          <span className="text-3xl font-black text-white font-heading">{registeredContestIds.size}</span>
        </div>

        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400 font-semibold block uppercase">Submitted Findings</span>
          <span className="text-3xl font-black text-cyan-400 font-heading">{submittedContestIds.size}</span>
        </div>

        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400 font-semibold block uppercase">Contests Won</span>
          <span className="text-3xl font-black text-pink-400 font-heading">{wonContestIds.size}</span>
        </div>

        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-1">
          <span className="text-xs text-gray-400 font-semibold block uppercase">Live Contests</span>
          <span className="text-3xl font-black text-emerald-400 font-heading">{activeTestingContests.length}</span>
        </div>
      </div>

      {/* MY REGISTERED & PARTICIPATED CONTESTS */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-amber-400" />
            My Contests
          </h2>
          <Link to="/contests" className="text-xs font-semibold text-indigo-400 hover:underline">
            Explore More Contests →
          </Link>
        </div>

        {registeredContests.length > 0 ? (
          <div className="space-y-4">
            {registeredContests.map(contest => {
              const isSubmitted = submittedContestIds.has(contest.id);
              const isWon = wonContestIds.has(contest.id);

              return (
                <div 
                  key={contest.id}
                  className="bg-glass-card p-6 rounded-2xl border border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-6 hover:border-indigo-500/40"
                >
                  <div className="flex items-center gap-4">
                    <img 
                      src={contest.banner_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&q=80'} 
                      alt={contest.title} 
                      className="w-16 h-16 rounded-xl object-cover hidden sm:block"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={contest.status} />
                        {isWon && (
                          <span className="badge bg-pink-500/20 text-pink-300 border border-pink-500/40 font-bold">
                            🏆 WINNER!
                          </span>
                        )}
                      </div>
                      <h3 className="font-bold text-white text-base">{contest.title}</h3>
                      <p className="text-xs text-gray-400">{contest.product_name} • ${contest.prize_amount.toLocaleString()} Prize Pool</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right hidden md:block space-y-1">
                      <span className="text-[11px] text-gray-400 block">Submission Status</span>
                      {isSubmitted ? (
                        <span className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Submitted
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-amber-400 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> Pending Submission
                        </span>
                      )}
                    </div>

                    <Link 
                      to={`/contests/${contest.slug}`}
                      className="btn btn-secondary btn-sm flex items-center gap-1.5"
                    >
                      <span>Contest Hub</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-glass p-10 rounded-2xl text-center space-y-4 border border-white/10">
            <Trophy className="w-10 h-10 text-gray-500 mx-auto" />
            <h3 className="text-lg font-bold text-white">No Registered Contests Yet</h3>
            <p className="text-gray-400 text-xs">Browse active software testing contests and click Register to begin.</p>
            <Link to="/contests" className="btn btn-primary btn-sm">View Contests</Link>
          </div>
        )}
      </div>

    </div>
  );
};

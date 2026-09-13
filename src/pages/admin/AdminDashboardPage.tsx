import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbStore, fetchProfilesAsync, fetchContestsAsync, fetchRegistrationsAsync } from '../../lib/supabase';
import { Contest, UserProfile } from '../../types';
import { 
  Trophy, 
  Users, 
  FileText, 
  Award, 
  Mail, 
  CheckCircle, 
  Clock, 
  PlusCircle, 
  ArrowRight, 
  ShieldCheck 
} from 'lucide-react';

export const AdminDashboardPage: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>(() => dbStore.getContests());
  const [users, setUsers] = useState<UserProfile[]>(() => dbStore.getUsers());
  const [allRegistrations, setAllRegistrations] = useState(() => dbStore.getRegistrations());
  const submissions = dbStore.getSubmissions();
  const winners = dbStore.getWinners();
  const campaigns = dbStore.getCampaigns();

  useEffect(() => {
    Promise.all([
      fetchContestsAsync(),
      fetchProfilesAsync(),
      fetchRegistrationsAsync()
    ]).then(([fetchedContests, fetchedUsers, fetchedRegs]) => {
      if (fetchedContests) setContests(fetchedContests);
      if (fetchedUsers) setUsers(fetchedUsers);
      if (fetchedRegs) setAllRegistrations(fetchedRegs);
    });
  }, []);


  const activeContests = contests.filter(c => c.status === 'testing_live' || c.status === 'registration_open');
  const pendingReviews = submissions.length - winners.length;

  return (
    <div className="space-y-8">
      
      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-amber-400" /> Executive Overview
          </h1>
          <p className="text-gray-400 text-xs mt-1">Platform metrics, active testing contests, and submission status</p>
        </div>

        <Link to="/admin/contests/create" className="btn btn-primary text-xs flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Create New Contest
        </Link>
      </div>

      {/* METRICS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
        
        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Total Users</span>
            <Users className="w-5 h-5 text-indigo-400" />
          </div>
          <span className="text-3xl font-black text-white font-heading">{users.length}</span>
          <span className="text-[11px] text-gray-400 block">Registered QA Testers</span>
        </div>

        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Active Contests</span>
            <Trophy className="w-5 h-5 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400 font-heading">{activeContests.length}</span>
          <span className="text-[11px] text-gray-400 block">Currently Live / Open</span>
        </div>

        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Total Submissions</span>
            <FileText className="w-5 h-5 text-cyan-400" />
          </div>
          <span className="text-3xl font-black text-cyan-400 font-heading">{submissions.length}</span>
          <span className="text-[11px] text-gray-400 block">Bugs & UI Reports Recorded</span>
        </div>

        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-gray-400">
            <span className="text-xs font-semibold uppercase">Email Campaigns</span>
            <Mail className="w-5 h-5 text-pink-400" />
          </div>
          <span className="text-3xl font-black text-pink-400 font-heading">{campaigns.length}</span>
          <span className="text-[11px] text-gray-400 block">Brevo Campaigns Sent</span>
        </div>

      </div>

      {/* QUICK ACTIONS & RECENT CONTESTS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* RECENT CONTESTS ROSTER */}
        <div className="md:col-span-2 bg-glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-amber-400" /> Manage Contests
            </h3>
            <Link to="/admin/contests" className="text-xs text-indigo-400 hover:underline">
              View All Contests ({contests.length}) →
            </Link>
          </div>

          <div className="space-y-3">
            {contests.slice(0, 4).map(c => (
              <div 
                key={c.id}
                className="bg-slate-900/80 p-4 rounded-xl border border-white/5 flex items-center justify-between gap-4 text-xs"
              >
                <div>
                  <h4 className="font-bold text-white text-sm">{c.title}</h4>
                  <span className="text-gray-400">{c.product_name} • ${c.prize_amount.toLocaleString()} Prize</span>
                </div>
                <div className="flex items-center gap-2">
                  <Link to={`/admin/contests/${c.id}/participants`} className="btn btn-ghost btn-sm text-[11px]">
                    Participants ({allRegistrations.filter(r => r.contest_id === c.id).length})
                  </Link>
                  <Link to={`/admin/contests/${c.id}/submissions`} className="btn btn-secondary btn-sm text-[11px]">
                    Submissions ({c.submission_count || 0})
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ADMIN QUICK NAVIGATION */}
        <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-4">
          <h3 className="text-lg font-bold text-white border-b border-white/10 pb-4">
            Admin Workspace Shortcuts
          </h3>

          <div className="space-y-2 text-xs">
            <Link to="/admin/contests/create" className="p-3.5 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-white/5 flex items-center justify-between text-gray-200 transition-colors">
              <span className="font-semibold">Create New Contest</span>
              <PlusCircle className="w-4 h-4 text-indigo-400" />
            </Link>

            <Link to="/admin/campaigns" className="p-3.5 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-white/5 flex items-center justify-between text-gray-200 transition-colors">
              <span className="font-semibold">Brevo Email Campaigns</span>
              <Mail className="w-4 h-4 text-pink-400" />
            </Link>

            <Link to="/admin/users" className="p-3.5 bg-slate-900/80 hover:bg-slate-800 rounded-xl border border-white/5 flex items-center justify-between text-gray-200 transition-colors">
              <span className="font-semibold">Tester Database & Roster</span>
              <Users className="w-4 h-4 text-cyan-400" />
            </Link>
          </div>
        </div>

      </div>

    </div>
  );
};

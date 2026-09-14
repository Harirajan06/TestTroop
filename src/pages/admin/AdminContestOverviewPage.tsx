import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore, fetchRegistrationsAsync } from '../../lib/supabase';
import { StatusBadge } from '../../components/StatusBadge';
import { Contest, ContestRegistration, Submission, ContestReview, ContestWinner } from '../../types';
import {
  ArrowLeft, Edit3, Users, FileText, Trophy, Award, Calendar, IndianRupee,
  Globe, ShieldCheck, ExternalLink, Mail, Phone, Linkedin, KeyRound, CheckCircle2, Clock,
} from 'lucide-react';

export const AdminContestOverviewPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const [contest, setContest] = useState<Contest | undefined>(() => dbStore.getContests().find(c => c.id === id));
  const [registrations, setRegistrations] = useState<ContestRegistration[]>(() => dbStore.getRegistrations().filter(r => r.contest_id === id));
  const submissions: Submission[] = dbStore.getSubmissions().filter(s => s.contest_id === id);
  const reviews: ContestReview[] = dbStore.getReviews().filter(r => r.contest_id === id);
  const winners: ContestWinner[] = dbStore.getWinners().filter(w => w.contest_id === id);

  useEffect(() => {
    if (!id) return;
    fetchRegistrationsAsync(id).then(fetched => setRegistrations(fetched.filter(r => r.contest_id === id)));
  }, [id]);

  if (!contest) {
    return (
      <div className="py-20 text-center space-y-4">
        <Trophy className="w-16 h-16 text-gray-600 mx-auto" />
        <h2 className="text-2xl font-bold text-white">Contest Not Found</h2>
        <Link to="/plasma/contests" className="btn btn-primary">Back to Contests</Link>
      </div>
    );
  }

  const formatDate = (dateStr: string) => new Date(dateStr).toLocaleDateString('en-US', {
    weekday: 'short', month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit',
  });

  const credentialsSentCount = registrations.filter(r => r.credentials_sent_at).length;
  const submittedRegistrationIds = new Set(submissions.map(s => s.registration_id));
  const winner = winners.find(w => w.is_published);

  return (
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Link to="/plasma/contests" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-bold text-white">{contest.title}</h1>
              <StatusBadge status={contest.status} />
            </div>
            <span className="text-xs text-gray-400">{contest.product_name} • {contest.platform}</span>
          </div>
        </div>

        <Link to={`/plasma/contests/${id}/edit`} className="btn btn-secondary text-xs flex items-center gap-2">
          <Edit3 className="w-4 h-4" /> Edit Contest
        </Link>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase"><IndianRupee className="w-3.5 h-3.5" /> Prize Pool</div>
          <span className="text-2xl font-black text-emerald-400">₹{contest.prize_amount.toLocaleString()}</span>
        </div>
        <Link to={`/plasma/contests/${id}/participants`} className="bg-glass-card p-5 rounded-2xl border border-white/10 space-y-1 hover:border-indigo-400/40 transition-colors">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase"><Users className="w-3.5 h-3.5" /> Registered</div>
          <span className="text-2xl font-black text-white">{registrations.length}</span>
        </Link>
        <Link to={`/plasma/contests/${id}/submissions`} className="bg-glass-card p-5 rounded-2xl border border-white/10 space-y-1 hover:border-cyan-400/40 transition-colors">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase"><FileText className="w-3.5 h-3.5" /> Submissions</div>
          <span className="text-2xl font-black text-cyan-400">{submissions.length}</span>
        </Link>
        <div className="bg-glass-card p-5 rounded-2xl border border-white/10 space-y-1">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase"><KeyRound className="w-3.5 h-3.5" /> Credentials Sent</div>
          <span className="text-2xl font-black text-white">{credentialsSentCount} / {registrations.length}</span>
        </div>
        <Link to={`/plasma/contests/${id}/winner`} className="bg-glass-card p-5 rounded-2xl border border-white/10 space-y-1 hover:border-pink-400/40 transition-colors">
          <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold uppercase"><Award className="w-3.5 h-3.5" /> Winner</div>
          <span className="text-lg font-black text-pink-400">{winner ? 'Announced' : 'Pending'}</span>
        </Link>
      </div>

      {/* QUICK ACTIONS */}
      <div className="flex flex-wrap gap-3">
        <Link to={`/plasma/contests/${id}/participants`} className="btn btn-secondary text-xs flex items-center gap-2">
          <Users className="w-4 h-4 text-indigo-400" /> Manage Participants
        </Link>
        <Link to={`/plasma/contests/${id}/submissions`} className="btn btn-secondary text-xs flex items-center gap-2">
          <FileText className="w-4 h-4 text-cyan-400" /> Review Submissions
        </Link>
        <Link to={`/plasma/contests/${id}/reviews`} className="btn btn-secondary text-xs flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" /> Judge & Score
        </Link>
        <Link to={`/plasma/contests/${id}/winner`} className="btn btn-secondary text-xs flex items-center gap-2">
          <Award className="w-4 h-4 text-pink-400" /> Publish Winner
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

        {/* LEFT: CONTEST DETAILS */}
        <div className="md:col-span-2 space-y-6">
          <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <FileText className="w-5 h-5 text-indigo-400" /> Contest Details
            </h3>
            <p className="text-gray-300 text-sm">{contest.description}</p>
            <div className="text-xs text-gray-400 space-y-1">
              <p className="whitespace-pre-line">{contest.testing_instructions}</p>
            </div>
            {contest.eligibility_requirements && (
              <div className="text-xs text-gray-400 pt-2 border-t border-white/5">
                <span className="font-bold text-gray-300 block mb-1">Eligibility</span>
                {contest.eligibility_requirements}
              </div>
            )}
            {contest.product_url && (
              <a href={contest.product_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-xs text-indigo-300 hover:underline">
                <Globe className="w-3.5 h-3.5" /> {contest.product_url} <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>

          {/* RECENT PARTICIPANTS PREVIEW */}
          <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Users className="w-5 h-5 text-cyan-400" /> Participants ({registrations.length})
              </h3>
              <Link to={`/plasma/contests/${id}/participants`} className="text-xs text-indigo-400 hover:underline">View All →</Link>
            </div>

            {registrations.length > 0 ? (
              <div className="space-y-2">
                {registrations.slice(0, 5).map(r => (
                  <div key={r.id} className="flex items-center justify-between p-3 bg-slate-900/80 rounded-xl border border-white/5 text-xs">
                    <div>
                      <span className="font-bold text-white block">{r.full_name}</span>
                      <span className="text-gray-400 flex items-center gap-1"><Mail className="w-3 h-3" /> {r.email}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {submittedRegistrationIds.has(r.id) ? (
                        <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30"><CheckCircle2 className="w-3 h-3" /> Submitted</span>
                      ) : (
                        <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/30"><Clock className="w-3 h-3" /> Pending</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-xs italic">No one has registered yet.</p>
            )}
          </div>
        </div>

        {/* RIGHT: SCHEDULE */}
        <div className="space-y-6">
          <div className="bg-glass-card p-6 rounded-3xl border border-white/10 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2 border-b border-white/10 pb-3">
              <Calendar className="w-5 h-5 text-amber-400" /> Schedule
            </h3>
            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-gray-400 block">Registration Opens</span>
                <span className="text-white font-semibold block">{formatDate(contest.registration_start)}</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-gray-400 block">Registration Closes</span>
                <span className="text-indigo-300 font-semibold block">{formatDate(contest.registration_end)}</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-gray-400 block">Testing Starts</span>
                <span className="text-emerald-400 font-semibold block">{formatDate(contest.contest_start)}</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-gray-400 block">Submission Deadline</span>
                <span className="text-amber-400 font-bold block">{formatDate(contest.submission_deadline)}</span>
              </div>
              <div className="p-3 bg-slate-900/80 rounded-xl border border-white/5 space-y-0.5">
                <span className="text-gray-400 block">Winner Announcement</span>
                <span className="text-pink-400 font-bold block">{formatDate(contest.result_date)}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl flex items-start gap-2 text-xs text-indigo-200">
            <ShieldCheck className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <span>Participant emails, mobile numbers, and LinkedIn profiles are only visible to admins.</span>
          </div>
        </div>

      </div>

    </div>
  );
};

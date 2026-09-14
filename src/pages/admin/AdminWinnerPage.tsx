import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { dbStore } from '../../lib/supabase';
import { ContestWinner } from '../../types';
import { Award, Trophy, ArrowLeft, Send, Sparkles, CheckCircle2 } from 'lucide-react';

export const AdminWinnerPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const contest = dbStore.getContests().find(c => c.id === id);
  const submissions = dbStore.getSubmissions().filter(s => s.contest_id === id);
  const reviews = dbStore.getReviews().filter(r => r.contest_id === id);
  const registrations = dbStore.getRegistrations().filter(r => r.contest_id === id);

  const currentWinner = contest?.winner;

  // Finalist candidates (sorted by score)
  const candidateUsers = submissions.map(sub => {
    const reg = registrations.find(r => r.id === sub.registration_id);
    const rev = reviews.find(r => r.registration_id === sub.registration_id);
    return {
      registrationId: sub.registration_id || '',
      fullName: reg?.full_name || 'Tester',
      email: reg?.email,
      score: rev?.overall_score || 0,
      status: rev?.review_status || 'pending',
    };
  }).sort((a, b) => b.score - a.score);

  const [winnerRegistrationId, setWinnerRegistrationId] = useState<string>(
    currentWinner?.winner_registration_id || candidateUsers[0]?.registrationId || ''
  );
  const [prizeTitle, setPrizeTitle] = useState<string>(currentWinner?.prize_title || '1st Place Grand Winner');
  const [prizeAmount, setPrizeAmount] = useState<number>(currentWinner?.prize_amount || contest?.prize_amount || 1000);
  const [headline, setHeadline] = useState<string>(
    currentWinner?.announcement_headline || `${candidateUsers[0]?.fullName || 'Devon Vance'} Wins ${contest?.title}!`
  );
  const [announcementBody, setAnnouncementBody] = useState<string>(
    currentWinner?.announcement_body || 'Congratulations to our winner for submitting critical bug reports and thorough test coverage.'
  );
  const [winningSummary, setWinningSummary] = useState<string>(
    currentWinner?.winning_summary || '7 Verified Critical Bug Reports + Exceptional Camera Angle Test Matrix'
  );

  const [published, setPublished] = useState(false);

  const handlePublishWinner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!id || !winnerRegistrationId) return;

    dbStore.publishWinner({
      contest_id: id,
      winner_registration_id: winnerRegistrationId,
      prize_title: prizeTitle,
      prize_amount: Number(prizeAmount),
      announcement_headline: headline,
      announcement_body: announcementBody,
      winning_summary: winningSummary,
    });

    setPublished(true);
    setTimeout(() => {
      navigate('/plasma/contests');
    }, 2000);
  };

  return (
    <div className="max-w-3xl mx-auto space-y-8 py-6">
      
      <div className="flex items-center gap-3">
        <Link to="/plasma/contests" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <div>
          <span className="text-xs font-bold text-pink-400 uppercase tracking-wider block">
            {contest?.title || 'Contest'}
          </span>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Award className="w-6 h-6 text-pink-400" /> Winner Selection & Official Announcement
          </h1>
        </div>
      </div>

      {published && (
        <div className="p-4 bg-emerald-500/20 border border-emerald-500/40 rounded-2xl text-emerald-300 font-bold text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-400" />
          <span>Winner Officially Published! Redirecting to contest roster...</span>
        </div>
      )}

      <form onSubmit={handlePublishWinner} className="bg-glass-card p-8 rounded-3xl border border-white/10 space-y-6">
        
        {/* WINNER SELECTOR */}
        <div className="form-group">
          <label className="form-label">Select Official Winner from Participants *</label>
          <select
            value={winnerRegistrationId}
            onChange={e => {
              setWinnerRegistrationId(e.target.value);
              const sel = candidateUsers.find(c => c.registrationId === e.target.value);
              if (sel) {
                setHeadline(`${sel.fullName} Wins ${contest?.title}!`);
              }
            }}
            className="form-select text-sm font-semibold"
          >
            {candidateUsers.map(c => (
              <option key={c.registrationId} value={c.registrationId}>
                {c.fullName} ({c.email}) — Judge Score: {c.score}/10 [{c.status}]
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="form-group">
            <label className="form-label">Prize Title *</label>
            <input 
              type="text" 
              required 
              value={prizeTitle} 
              onChange={e => setPrizeTitle(e.target.value)}
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label className="form-label">Cash Reward Amount (USD) *</label>
            <input 
              type="number" 
              required 
              value={prizeAmount} 
              onChange={e => setPrizeAmount(Number(e.target.value))}
              className="form-input"
            />
          </div>
        </div>

        <div className="form-group">
          <label className="form-label">Public Announcement Headline *</label>
          <input 
            type="text" 
            required 
            value={headline} 
            onChange={e => setHeadline(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Public Announcement Body Text *</label>
          <textarea 
            required 
            rows={4}
            value={announcementBody} 
            onChange={e => setAnnouncementBody(e.target.value)}
            className="form-textarea"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Winning Highlights / Summary</label>
          <input 
            type="text" 
            value={winningSummary} 
            onChange={e => setWinningSummary(e.target.value)}
            className="form-input"
          />
        </div>

        <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-4">
          <Link to="/plasma/contests" className="btn btn-ghost">Cancel</Link>
          <button type="submit" className="btn bg-pink-600 hover:bg-pink-500 text-white px-8 py-3 flex items-center gap-2">
            <Send className="w-4 h-4" /> Officially Publish Winner
          </button>
        </div>

      </form>

    </div>
  );
};

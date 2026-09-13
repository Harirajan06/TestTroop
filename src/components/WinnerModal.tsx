import React from 'react';
import { Contest } from '../types';
import { X, Award, Trophy, Sparkles, CheckCircle, ExternalLink } from 'lucide-react';

interface WinnerModalProps {
  contest: Contest;
  isOpen: boolean;
  onClose: () => void;
}

export const WinnerModal: React.FC<WinnerModalProps> = ({ contest, isOpen, onClose }) => {
  if (!isOpen || !contest.winner) return null;

  const winner = contest.winner;

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-xl text-center p-8 relative overflow-hidden border-pink-500/30">
        
        {/* TOP GLOW ACCENT */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500" />

        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-2 rounded-lg hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 text-pink-300 px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-widest mb-6">
          <Award className="w-4 h-4 text-pink-400" /> Official Winner Announcement
        </div>

        {/* WINNER AVATAR & NAME */}
        <div className="relative inline-block mb-4">
          <img 
            src={winner.winner_profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80'} 
            alt={winner.winner_profile?.full_name} 
            className="w-24 h-24 rounded-full object-cover mx-auto ring-4 ring-pink-500/50 shadow-xl shadow-pink-500/20"
          />
          <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 p-2 rounded-full shadow-lg">
            <Trophy className="w-5 h-5" />
          </div>
        </div>

        <h3 className="text-2xl font-bold text-white mb-1">
          {winner.winner_profile?.full_name || 'Champion Tester'}
        </h3>
        <p className="text-pink-400 font-semibold text-sm mb-4">
          {winner.prize_title || '1st Place Champion'} • <span className="text-emerald-400 font-bold">${winner.prize_amount.toLocaleString()} Cash Prize</span>
        </p>

        {/* ANNOUNCEMENT CARD */}
        <div className="bg-slate-900/90 border border-white/10 rounded-2xl p-5 text-left space-y-3 mb-6">
          <h4 className="text-base font-bold text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400" /> {winner.announcement_headline}
          </h4>
          <p className="text-gray-300 text-sm leading-relaxed">
            {winner.announcement_body}
          </p>
          {winner.winning_summary && (
            <div className="pt-3 border-t border-white/5 text-xs text-gray-400 flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
              <span><strong>Winning Highlights:</strong> {winner.winning_summary}</span>
            </div>
          )}
        </div>

        <button onClick={onClose} className="btn btn-primary w-full py-3">
          Close Winner Details
        </button>

      </div>
    </div>
  );
};

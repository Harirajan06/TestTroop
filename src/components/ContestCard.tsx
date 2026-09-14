import React from 'react';
import { Link } from 'react-router-dom';
import { Contest } from '../types';
import { StatusBadge } from './StatusBadge';
import { IndianRupee, Calendar, Globe, Smartphone, Users, Trophy, Award } from 'lucide-react';

interface ContestCardProps {
  contest: Contest;
  onOpenWinnerModal?: (contest: Contest) => void;
}

export const ContestCard: React.FC<ContestCardProps> = ({ contest, onOpenWinnerModal }) => {
  const getAppTypeIcon = (type: string) => {
    switch (type) {
      case 'mobile_app':
        return <Smartphone className="w-4 h-4 text-cyan-400" />;
      case 'website':
      case 'web_app':
        return <Globe className="w-4 h-4 text-indigo-400" />;
      default:
        return <Trophy className="w-4 h-4 text-amber-400" />;
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isWinnerAnnounced = contest.status === 'winner_announced';

  return (
    <div className="bg-glass-card overflow-hidden flex flex-col group h-full border border-white/10 hover:border-indigo-500/40">
      
      {/* BANNER IMAGE CONTAINER */}
      <div className="relative h-48 w-full overflow-hidden bg-slate-900">
        <img 
          src={contest.banner_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=800&q=80'} 
          alt={contest.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-85 group-hover:opacity-100"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/40 to-transparent" />
        
        {/* BADGES ON BANNER */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <StatusBadge status={contest.status} />
        </div>

        <div className="absolute bottom-3 right-3 bg-indigo-950/80 backdrop-blur-md px-3 py-1 rounded-full border border-indigo-500/30 text-xs font-bold text-indigo-200 flex items-center gap-1 shadow-lg">
          <IndianRupee className="w-3.5 h-3.5 text-emerald-400" />
          <span>₹{contest.prize_amount.toLocaleString()} Pool</span>
        </div>
      </div>

      {/* CONTENT */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-400 mb-2">
            {getAppTypeIcon(contest.contest_type)}
            <span className="capitalize">{contest.contest_type.replace('_', ' ')}</span>
            <span>•</span>
            <span className="text-gray-300 font-semibold">{contest.platform}</span>
          </div>

          <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
            {contest.title}
          </h3>

          <p className="text-gray-400 text-sm line-clamp-2 mt-2 leading-relaxed">
            {contest.description}
          </p>
        </div>

        {/* METRICS & DATES */}
        <div className="space-y-2 pt-3 border-t border-white/5 text-xs text-gray-400">
          <div className="flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" /> Reg Ends: {formatDate(contest.registration_end)}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyan-400" /> {contest.registration_count || 0} Registered
            </span>
          </div>

          {/* WINNER ANNOUNCEMENT NOTIFIER IF ANNOUNCED */}
          {isWinnerAnnounced && (
            <button
              onClick={() => onOpenWinnerModal && onOpenWinnerModal(contest)}
              className="w-full mt-2 py-2 px-3 bg-gradient-to-r from-pink-500/20 to-purple-500/20 border border-pink-500/40 rounded-xl text-pink-300 font-bold text-xs flex items-center justify-center gap-2 hover:bg-pink-500/30 transition-all cursor-pointer animate-pulse"
            >
              <Award className="w-4 h-4 text-pink-400" />
              <span>🏆 Winner Found! Click to View</span>
            </button>
          )}
        </div>

        {/* CTA BUTTON */}
        <div className="pt-2">
          <Link 
            to={`/contests/${contest.id}`}
            className="btn btn-primary w-full text-center text-sm font-semibold flex items-center justify-center gap-2"
          >
            <span>View Contest Details</span>
          </Link>
        </div>

      </div>

    </div>
  );
};

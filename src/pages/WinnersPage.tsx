import React from 'react';
import { dbStore } from '../lib/supabase';
import { Award, Trophy, Sparkles, CheckCircle, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const WinnersPage: React.FC = () => {
  const winners = dbStore.getWinners().filter(w => w.is_published);
  const contests = dbStore.getContests();

  return (
    <div className="space-y-12 py-8">
      
      {/* HERO */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-pink-500/10 border border-pink-500/30 rounded-full px-4 py-1 text-xs font-bold text-pink-300">
          <Award className="w-4 h-4 text-pink-400" /> Hall of Winners
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Software Testing Champions
        </h1>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
          Celebrating top-performing testers who uncovered critical bugs, identified security edge cases, and delivered exceptional product feedback.
        </p>
      </div>

      {/* WINNERS GRID */}
      {winners.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto">
          {winners.map(w => {
            const contest = contests.find(c => c.id === w.contest_id);

            return (
              <div 
                key={w.id} 
                className="bg-glass-card p-8 rounded-3xl border border-pink-500/20 space-y-6 relative overflow-hidden group hover:border-pink-500/50"
              >
                <div className="absolute top-0 right-0 bg-gradient-to-l from-pink-500/20 to-transparent w-48 h-48 rounded-bl-full pointer-events-none" />

                <div className="flex items-center gap-5">
                  <div className="relative">
                    <img 
                      src={w.winner_profile?.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'} 
                      alt={w.winner_profile?.full_name} 
                      className="w-16 h-16 rounded-full object-cover ring-4 ring-pink-500/40"
                    />
                    <div className="absolute -bottom-1 -right-1 bg-amber-400 text-slate-950 p-1.5 rounded-full shadow-md">
                      <Trophy className="w-4 h-4" />
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xl font-bold text-white">{w.winner_profile?.full_name}</h3>
                    <span className="text-xs font-bold text-pink-400 block">{w.prize_title}</span>
                    <span className="text-emerald-400 font-extrabold text-lg block mt-0.5">${w.prize_amount.toLocaleString()} Cash Prize</span>
                  </div>
                </div>

                <div className="space-y-2 pt-2 border-t border-white/5">
                  <span className="text-xs text-gray-400 font-semibold block">Contest Product</span>
                  <Link 
                    to={`/contests/${contest?.slug || w.contest_id}`} 
                    className="text-base font-bold text-white hover:text-indigo-300 transition-colors flex items-center gap-1.5"
                  >
                    <span>{w.contest_title || contest?.title}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-gray-400" />
                  </Link>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-2xl border border-white/5 space-y-2 text-xs text-gray-300 leading-relaxed">
                  <h4 className="font-bold text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" /> {w.announcement_headline}
                  </h4>
                  <p>{w.announcement_body}</p>
                </div>

              </div>
            );
          })}
        </div>
      ) : (
        <div className="bg-glass p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto border border-white/10">
          <Award className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Published Winners Yet</h3>
          <p className="text-gray-400 text-sm">
            Check back soon after active testing contests complete and winners are officially published.
          </p>
        </div>
      )}

    </div>
  );
};

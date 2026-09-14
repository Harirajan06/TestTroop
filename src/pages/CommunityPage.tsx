import React from 'react';
import { Link } from 'react-router-dom';
import { Users, MessageSquare, Trophy, ArrowRight } from 'lucide-react';

export const CommunityPage: React.FC = () => {
  return (
    <div className="space-y-12 py-8">

      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1 text-xs font-bold text-purple-300">
          <Users className="w-4 h-4 text-purple-400" /> Community
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          The Test Troop Community
        </h1>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
          Connect with fellow testers, share tips, and stay up to date on new contests. Community hub content is on the way.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <MessageSquare className="w-6 h-6 text-emerald-400" />
          <h3 className="text-white font-bold">WhatsApp Groups</h3>
          <p className="text-gray-400 text-sm">Every active contest has a dedicated WhatsApp group for live Q&A — check the contest page after registering.</p>
        </div>
        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <Trophy className="w-6 h-6 text-pink-400" />
          <h3 className="text-white font-bold">Hall of Winners</h3>
          <p className="text-gray-400 text-sm">See top testers who found critical bugs and earned cash rewards.</p>
        </div>
      </div>

      <div className="text-center">
        <Link to="/winners" className="btn btn-primary inline-flex items-center gap-2">
          <span>View Hall of Winners</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

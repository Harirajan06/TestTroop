import React from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, FileText, ShieldCheck, Trophy, ArrowRight } from 'lucide-react';

export const LearnPage: React.FC = () => {
  return (
    <div className="space-y-12 py-8">

      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1 text-xs font-bold text-purple-300">
          <BookOpen className="w-4 h-4 text-purple-400" /> Learn
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Learn to Test Like a Pro
        </h1>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
          Guides, checklists, and best practices to help you write stronger bug reports and win more contests. New content is on the way.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <FileText className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-bold">Writing a Great Bug Report</h3>
          <p className="text-gray-400 text-sm">Coming soon: how to structure steps to reproduce, severity, and evidence.</p>
        </div>
        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <ShieldCheck className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-bold">Testing Checklists</h3>
          <p className="text-gray-400 text-sm">Coming soon: functional, UI/UX, and edge-case checklists per platform.</p>
        </div>
        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <Trophy className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-bold">Winning Submission Breakdown</h3>
          <p className="text-gray-400 text-sm">Coming soon: what judges look for in top-scoring contest entries.</p>
        </div>
      </div>

      <div className="text-center">
        <Link to="/contests" className="btn btn-primary inline-flex items-center gap-2">
          <span>Browse Active Contests</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { dbStore, fetchContestsAsync } from '../lib/supabase';
import { ContestCard } from '../components/ContestCard';
import { WinnerModal } from '../components/WinnerModal';
import { Contest } from '../types';
import { Trophy, Search, Filter, Smartphone } from 'lucide-react';

export const ContestListingPage: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>(() => dbStore.getContests());

  useEffect(() => {
    fetchContestsAsync().then(fetched => {
      if (fetched && fetched.length > 0) {
        setContests(fetched);
      }
    });
  }, []);

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [selectedWinnerContest, setSelectedWinnerContest] = useState<Contest | null>(null);

  const filteredContests = contests.filter(contest => {
    // Status Filter
    if (statusFilter !== 'all' && contest.status !== statusFilter) return false;

    // Type Filter
    if (typeFilter !== 'all' && contest.contest_type !== typeFilter) return false;

    // Search Query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = contest.title.toLowerCase().includes(q);
      const matchProduct = contest.product_name.toLowerCase().includes(q);
      const matchDesc = contest.description.toLowerCase().includes(q);
      if (!matchTitle && !matchProduct && !matchDesc) return false;
    }

    return true;
  });

  return (
    <div className="space-y-10 py-8">
      
      {/* HEADER HERO */}
      <div className="space-y-4 text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/30 rounded-full px-4 py-1 text-xs font-bold text-indigo-300">
          <Trophy className="w-3.5 h-3.5 text-amber-400" /> Contest Directory
        </div>
        <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
          Explore Software Testing Contests
        </h1>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
          Filter by status or app type. Select a contest to review instructions, register, and submit your testing findings for cash rewards.
        </p>
      </div>

      {/* FILTERS ENGINE */}
      <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-4 max-w-5xl mx-auto">
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          
          {/* SEARCH */}
          <div className="relative">
            <input 
              type="text" 
              placeholder="Search contest title or product name..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="form-input pl-10"
            />
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* STATUS FILTER */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="form-select pl-10"
            >
              <option value="all">All Contest Statuses</option>
              <option value="testing_live">🟢 Testing Live</option>
              <option value="registration_open">🔵 Registration Open</option>
              <option value="upcoming">🌐 Upcoming</option>
              <option value="winner_announced">🏆 Winner Announced</option>
              <option value="submission_closed">⏳ Submission Closed</option>
            </select>
            <Filter className="w-4 h-4 text-indigo-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* TYPE FILTER */}
          <div className="relative">
            <select
              value={typeFilter}
              onChange={e => setTypeFilter(e.target.value)}
              className="form-select pl-10"
            >
              <option value="all">All Platform Types</option>
              <option value="mobile_app">📱 Mobile Apps (iOS / Android)</option>
              <option value="web_app">💻 Web Applications & SaaS</option>
              <option value="website">🌐 Public Websites</option>
            </select>
            <Smartphone className="w-4 h-4 text-cyan-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

        </div>

      </div>

      {/* CONTESTS GRID */}
      {filteredContests.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {filteredContests.map(contest => (
            <ContestCard 
              key={contest.id} 
              contest={contest} 
              onOpenWinnerModal={(c) => setSelectedWinnerContest(c)}
            />
          ))}
        </div>
      ) : (
        <div className="bg-glass p-12 rounded-3xl text-center space-y-4 max-w-lg mx-auto border border-white/10">
          <Trophy className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Contests Match Your Filter</h3>
          <p className="text-gray-400 text-sm">
            Try resetting your search query or status filter to see all active software testing contests.
          </p>
          <button 
            onClick={() => { setStatusFilter('all'); setTypeFilter('all'); setSearchQuery(''); }}
            className="btn btn-secondary text-xs"
          >
            Reset Filters
          </button>
        </div>
      )}

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

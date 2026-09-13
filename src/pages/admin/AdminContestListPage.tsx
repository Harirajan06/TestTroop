import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { dbStore, fetchContestsAsync } from '../../lib/supabase';
import { StatusBadge } from '../../components/StatusBadge';
import { Contest } from '../../types';
import { 
  Trophy, 
  PlusCircle, 
  Users, 
  FileText, 
  Award, 
  Edit3, 
  Trash2, 
  Search, 
  Eye 
} from 'lucide-react';

export const AdminContestListPage: React.FC = () => {
  const [contests, setContests] = useState<Contest[]>(() => dbStore.getContests());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchContestsAsync().then(fetched => {
      if (fetched && fetched.length > 0) {
        setContests(fetched);
      }
    });
  }, []);

  const filteredContests = contests.filter(c => 
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.product_name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDeleteContest = (id: string, title: string) => {
    if (window.confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      dbStore.deleteContest(id);
      setContests(dbStore.getContests());
    }
  };

  return (
    <div className="space-y-8">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-white">Contest Management</h1>
          <p className="text-gray-400 text-xs mt-1">Create, publish, edit, review submissions, and announce winners</p>
        </div>

        <Link to="/admin/contests/create" className="btn btn-primary text-xs flex items-center gap-2">
          <PlusCircle className="w-4 h-4" /> Create Contest
        </Link>
      </div>

      {/* SEARCH */}
      <div className="bg-glass-card p-4 rounded-2xl border border-white/10 max-w-md">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search contests..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* CONTESTS TABLE */}
      <div className="bg-glass-card rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">Contest Title</th>
                <th className="p-4">Type / Platform</th>
                <th className="p-4">Status</th>
                <th className="p-4">Prize Pool</th>
                <th className="p-4">Participants</th>
                <th className="p-4">Submissions</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredContests.map(c => (
                <tr key={c.id} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white max-w-xs">
                    <span className="truncate block">{c.title}</span>
                    <span className="text-[11px] text-gray-400 font-normal">{c.product_name}</span>
                  </td>
                  <td className="p-4 capitalize">
                    {c.contest_type.replace('_', ' ')}
                    <span className="text-gray-500 block text-[10px]">{c.platform}</span>
                  </td>
                  <td className="p-4">
                    <StatusBadge status={c.status} />
                  </td>
                  <td className="p-4 font-bold text-emerald-400">
                    ${c.prize_amount.toLocaleString()}
                  </td>
                  <td className="p-4">
                    <Link to={`/admin/contests/${c.id}/participants`} className="text-indigo-400 hover:underline font-semibold flex items-center gap-1">
                      <Users className="w-3.5 h-3.5" /> {c.registration_count || 0} Registered
                    </Link>
                  </td>
                  <td className="p-4">
                    <Link to={`/admin/contests/${c.id}/submissions`} className="text-cyan-400 hover:underline font-semibold flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5" /> {c.submission_count || 0} Submissions
                    </Link>
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Link to={`/contests/${c.slug}`} title="View Public Page" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
                        <Eye className="w-4 h-4" />
                      </Link>
                      <Link to={`/admin/contests/${c.id}/edit`} title="Edit Contest" className="p-2 text-indigo-400 hover:text-white rounded-lg hover:bg-indigo-500/20">
                        <Edit3 className="w-4 h-4" />
                      </Link>
                      <Link to={`/admin/contests/${c.id}/reviews`} title="Judge Submissions" className="p-2 text-amber-400 hover:text-white rounded-lg hover:bg-amber-500/20">
                        <Trophy className="w-4 h-4" />
                      </Link>
                      <Link to={`/admin/contests/${c.id}/winner`} title="Publish Winner" className="p-2 text-pink-400 hover:text-white rounded-lg hover:bg-pink-500/20">
                        <Award className="w-4 h-4" />
                      </Link>
                      <button 
                        onClick={() => handleDeleteContest(c.id, c.title)}
                        title="Delete Contest"
                        className="p-2 text-red-400 hover:text-white rounded-lg hover:bg-red-500/20"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

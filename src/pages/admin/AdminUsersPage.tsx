import React, { useState, useEffect } from 'react';
import { dbStore, fetchRegistrationsAsync, fetchContestsAsync } from '../../lib/supabase';
import { ContestRegistration, Contest } from '../../types';
import { Users, Search, Mail, Phone, Linkedin, Trash2, Trophy } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [registrations, setRegistrations] = useState<ContestRegistration[]>(() => dbStore.getRegistrations());
  const [contests, setContests] = useState<Contest[]>(() => dbStore.getContests());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([fetchRegistrationsAsync(), fetchContestsAsync()]).then(([fetchedRegs, fetchedContests]) => {
      if (fetchedRegs) setRegistrations(fetchedRegs);
      if (fetchedContests) setContests(fetchedContests);
    });
  }, []);

  const contestTitle = (contestId: string) => contests.find(c => c.id === contestId)?.title || 'Unknown Contest';

  const filteredRegistrations = registrations.filter(r =>
    r.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.mobile_number.includes(searchQuery)
  );

  const handleDeleteRegistration = (id: string, name: string) => {
    if (window.confirm(`Remove ${name}'s registration? This cannot be undone.`)) {
      dbStore.deleteRegistration(id);
      setRegistrations(dbStore.getRegistrations());
    }
  };

  return (
    <div className="space-y-8">

      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-cyan-400" /> Registered Tester Roster ({registrations.length})
        </h1>
        <p className="text-gray-400 text-xs mt-1">Everyone who has registered for a contest, across all contests</p>
      </div>

      {/* SEARCH */}
      <div className="bg-glass-card p-4 rounded-2xl border border-white/10 max-w-md">
        <div className="relative">
          <input
            type="text"
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* REGISTRATIONS TABLE */}
      {filteredRegistrations.length > 0 ? (
        <div className="bg-glass-card rounded-3xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="p-4">Tester</th>
                  <th className="p-4">Contest</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Mobile</th>
                  <th className="p-4">LinkedIn</th>
                  <th className="p-4">Registered Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredRegistrations.map(r => (
                  <tr key={r.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white">{r.full_name}</td>
                    <td className="p-4 text-gray-300">
                      <span className="flex items-center gap-1.5"><Trophy className="w-3.5 h-3.5 text-amber-400 shrink-0" /> {contestTitle(r.contest_id)}</span>
                    </td>
                    <td className="p-4 text-indigo-300 font-medium">
                      <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {r.email}</span>
                    </td>
                    <td className="p-4 text-gray-300 font-mono">
                      <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {r.mobile_number}</span>
                    </td>
                    <td className="p-4">
                      {r.linkedin_url ? (
                        <a href={r.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:underline flex items-center gap-1.5">
                          <Linkedin className="w-3.5 h-3.5" /> Profile
                        </a>
                      ) : (
                        <span className="text-gray-500">N/A</span>
                      )}
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(r.registered_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDeleteRegistration(r.id, r.full_name)}
                        className="p-2 text-red-400 hover:text-white rounded-lg hover:bg-red-500/20"
                        title="Remove Registration"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-glass p-12 rounded-3xl text-center space-y-3 max-w-lg mx-auto border border-white/10">
          <Users className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Registered Testers Found</h3>
          <p className="text-gray-400 text-sm">
            Testers who register for a contest will appear here automatically.
          </p>
        </div>
      )}

    </div>
  );
};

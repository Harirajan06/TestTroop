import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore, fetchProfilesAsync, fetchRegistrationsAsync } from '../../lib/supabase';
import { UserProfile, ContestRegistration } from '../../types';
import { 
  Users, 
  ArrowLeft, 
  Search, 
  Mail, 
  Phone, 
  CheckCircle2, 
  Clock, 
  ShieldCheck, 
  Download 
} from 'lucide-react';

export const AdminParticipantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const contest = dbStore.getContests().find(c => c.id === id);
  const [registrations, setRegistrations] = useState<ContestRegistration[]>(() => dbStore.getRegistrations().filter(r => r.contest_id === id));
  const [allUsers, setAllUsers] = useState<UserProfile[]>(() => dbStore.getUsers());
  const submissions = dbStore.getSubmissions().filter(s => s.contest_id === id);

  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    Promise.all([
      fetchRegistrationsAsync(id),
      fetchProfilesAsync()
    ]).then(([fetchedRegs, fetchedProfiles]) => {
      if (fetchedRegs) setRegistrations(fetchedRegs.filter(r => r.contest_id === id));
      if (fetchedProfiles) setAllUsers(fetchedProfiles);
    });
  }, [id]);

  const submittedUserIds = new Set(submissions.map(s => s.user_id));

  const participantData = registrations.map(reg => {
    const u = allUsers.find(user => user.id === reg.user_id);
    return {
      registrationId: reg.id,
      userId: reg.user_id,
      registeredAt: reg.registered_at,
      fullName: u?.full_name || 'Registered Tester',
      email: u?.email || 'N/A',
      mobileNumber: u?.mobile_number || 'N/A',
      hasSubmitted: submittedUserIds.has(reg.user_id),
    };
  });

  const filteredParticipants = participantData.filter(p => 
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mobileNumber.includes(searchQuery)
  );

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/admin/contests" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider block">
              {contest?.title || 'Contest'}
            </span>
            <h1 className="text-2xl font-bold text-white flex items-center gap-2">
              <Users className="w-6 h-6 text-cyan-400" /> Participant Roster ({registrations.length})
            </h1>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs text-indigo-300 font-semibold">
          <ShieldCheck className="w-4 h-4 text-amber-400" />
          <span>Admin Role Authorized (Sensitive Contact Access)</span>
        </div>
      </div>

      {/* SEARCH */}
      <div className="bg-glass-card p-4 rounded-2xl border border-white/10 max-w-md">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search participant name, email, or mobile..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
        </div>
      </div>

      {/* PARTICIPANTS TABLE */}
      <div className="bg-glass-card rounded-3xl border border-white/10 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-900/90 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
              <tr>
                <th className="p-4">Tester Name</th>
                <th className="p-4">Email Address</th>
                <th className="p-4">Mobile Phone Number</th>
                <th className="p-4">Registration Date</th>
                <th className="p-4">Submission Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredParticipants.map(p => (
                <tr key={p.registrationId} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">
                    {p.fullName}
                  </td>
                  <td className="p-4 text-indigo-300 font-medium flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-gray-400" /> {p.email}
                  </td>
                  <td className="p-4 text-gray-300 font-mono flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-emerald-400" /> {p.mobileNumber}
                  </td>
                  <td className="p-4 text-gray-400">
                    {new Date(p.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    {p.hasSubmitted ? (
                      <span className="badge bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Submitted
                      </span>
                    ) : (
                      <span className="badge bg-amber-500/15 text-amber-300 border border-amber-500/30 font-semibold">
                        <Clock className="w-3 h-3 text-amber-400" /> Registered Only
                      </span>
                    )}
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

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { dbStore, fetchRegistrationsAsync } from '../../lib/supabase';
import { ContestRegistration } from '../../types';
import {
  Users,
  ArrowLeft,
  Search,
  Mail,
  Phone,
  Linkedin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Download,
  KeyRound,
  AlertCircle,
} from 'lucide-react';

export const AdminParticipantsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const contest = dbStore.getContests().find(c => c.id === id);
  const [registrations, setRegistrations] = useState<ContestRegistration[]>(() => dbStore.getRegistrations().filter(r => r.contest_id === id));
  const submissions = dbStore.getSubmissions().filter(s => s.contest_id === id);

  const [searchQuery, setSearchQuery] = useState('');
  const [sendingCredentials, setSendingCredentials] = useState(false);
  const [credentialsStatus, setCredentialsStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchRegistrationsAsync(id).then(fetchedRegs => {
      if (fetchedRegs) setRegistrations(fetchedRegs.filter(r => r.contest_id === id));
    });
  }, [id]);

  const submittedRegistrationIds = new Set(submissions.map(s => s.registration_id));

  const participantData = registrations.map(reg => ({
    registrationId: reg.id,
    registeredAt: reg.registered_at,
    fullName: reg.full_name || 'Registered Tester',
    email: reg.email || 'N/A',
    mobileNumber: reg.mobile_number || 'N/A',
    linkedinUrl: reg.linkedin_url,
    cityState: reg.city_state,
    credentialsSentAt: reg.credentials_sent_at,
    hasSubmitted: submittedRegistrationIds.has(reg.id),
  }));

  const filteredParticipants = participantData.filter(p =>
    p.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.mobileNumber.includes(searchQuery)
  );

  const pendingCredentialsCount = participantData.filter(p => !p.credentialsSentAt).length;

  const handleSendCredentials = async () => {
    if (!id) return;
    setSendingCredentials(true);
    setCredentialsStatus(null);
    try {
      const result = await dbStore.sendContestCredentials(id);
      setCredentialsStatus(
        `Sent to ${result.sent} tester${result.sent === 1 ? '' : 's'}` +
        (result.failed ? `, ${result.failed} failed` : '') +
        (result.skipped ? ` (${result.skipped} already had credentials)` : '')
      );
      const fetched = await fetchRegistrationsAsync(id);
      setRegistrations(fetched.filter(r => r.contest_id === id));
    } catch (err: any) {
      setCredentialsStatus(err.message || 'Failed to send credentials.');
    } finally {
      setSendingCredentials(false);
    }
  };

  return (
    <div className="space-y-8">
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/plasma/contests" className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
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

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-indigo-950/60 border border-indigo-500/30 px-3 py-1.5 rounded-xl text-xs text-indigo-300 font-semibold">
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            <span>Admin Role Authorized (Sensitive Contact Access)</span>
          </div>

          <button
            onClick={handleSendCredentials}
            disabled={sendingCredentials || registrations.length === 0}
            className="btn btn-primary text-xs flex items-center gap-2 disabled:opacity-50"
          >
            <KeyRound className="w-4 h-4" />
            {sendingCredentials ? 'Sending...' : `Send Contest Credentials${pendingCredentialsCount ? ` (${pendingCredentialsCount})` : ''}`}
          </button>
        </div>
      </div>

      {credentialsStatus && (
        <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-indigo-200 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>{credentialsStatus}</span>
        </div>
      )}

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
                <th className="p-4">LinkedIn</th>
                <th className="p-4">City / State</th>
                <th className="p-4">Registration Date</th>
                <th className="p-4">Credentials</th>
                <th className="p-4">Submission Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5 text-gray-300">
              {filteredParticipants.map(p => (
                <tr key={p.registrationId} className="hover:bg-white/5 transition-colors">
                  <td className="p-4 font-bold text-white">
                    {p.fullName}
                  </td>
                  <td className="p-4 text-indigo-300 font-medium">
                    <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5 text-gray-400 shrink-0" /> {p.email}</span>
                  </td>
                  <td className="p-4 text-gray-300 font-mono">
                    <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5 text-emerald-400 shrink-0" /> {p.mobileNumber}</span>
                  </td>
                  <td className="p-4">
                    {p.linkedinUrl ? (
                      <a href={p.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-indigo-300 hover:underline flex items-center gap-1.5">
                        <Linkedin className="w-3.5 h-3.5" /> Profile
                      </a>
                    ) : (
                      <span className="text-gray-500">N/A</span>
                    )}
                  </td>
                  <td className="p-4 text-gray-400">{p.cityState || 'N/A'}</td>
                  <td className="p-4 text-gray-400">
                    {new Date(p.registeredAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  <td className="p-4">
                    {p.credentialsSentAt ? (
                      <span className="badge bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 font-semibold">
                        <KeyRound className="w-3 h-3 text-cyan-400" /> Sent
                      </span>
                    ) : (
                      <span className="text-gray-500 italic">Not sent</span>
                    )}
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

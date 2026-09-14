import React, { useState } from 'react';
import { Contest } from '../types';
import { dbStore } from '../lib/supabase';
import { BugathonRulesModal } from './BugathonRulesModal';
import { X, User, Mail, Phone, Linkedin, MapPin, AlertTriangle, CheckCircle2 } from 'lucide-react';

interface RegistrationModalProps {
  contest: Contest;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegistrationModal: React.FC<RegistrationModalProps> = ({
  contest,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [linkedinUrl, setLinkedinUrl] = useState('');
  const [cityState, setCityState] = useState('');
  const [ageConfirmed, setAgeConfirmed] = useState(false);
  const [consentTempAccount, setConsentTempAccount] = useState(false);
  const [rulesAcknowledged, setRulesAcknowledged] = useState(false);

  const [showRulesModal, setShowRulesModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const canSubmit =
    fullName.trim() &&
    email.trim() &&
    mobileNumber.trim() &&
    linkedinUrl.trim() &&
    ageConfirmed &&
    consentTempAccount &&
    rulesAcknowledged;

  const handleDecline = (reason: string) => {
    dbStore.logRuleDecline({
      contest_id: contest.id,
      full_name: fullName.trim() || undefined,
      email: email.trim() || undefined,
      mobile_number: mobileNumber.trim() || undefined,
      reason,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;

    setSubmitting(true);
    setError(null);

    try {
      await dbStore.registerForContest({
        contest_id: contest.id,
        full_name: fullName.trim(),
        email: email.trim().toLowerCase(),
        mobile_number: mobileNumber.trim(),
        linkedin_url: linkedinUrl.trim(),
        city_state: cityState.trim() || undefined,
        age_confirmed: ageConfirmed,
        consent_temp_account: consentTempAccount,
        rules_acknowledged: rulesAcknowledged,
      });
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <div className="modal-overlay">
        <div className="modal-content max-w-lg">

          <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
            <div>
              <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">{contest.title}</span>
              <h2 className="text-xl font-bold text-white mt-1">Contest Registration Form</h2>
            </div>
            <button onClick={onClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
              <X className="w-5 h-5" />
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-sm flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">

            <div className="form-group">
              <label className="form-label">Name *</label>
              <div className="relative">
                <input type="text" required value={fullName} onChange={e => setFullName(e.target.value)} className="form-input pl-10" placeholder="Your full name" />
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email *</label>
              <div className="relative">
                <input type="email" required value={email} onChange={e => setEmail(e.target.value)} className="form-input pl-10" placeholder="you@example.com" />
                <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Mobile *</label>
              <div className="relative">
                <input type="tel" required value={mobileNumber} onChange={e => setMobileNumber(e.target.value)} className="form-input pl-10" placeholder="+91 98765 43210" />
                <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">LinkedIn Profile URL *</label>
              <div className="relative">
                <input type="url" required value={linkedinUrl} onChange={e => setLinkedinUrl(e.target.value)} className="form-input pl-10" placeholder="https://linkedin.com/in/yourname" />
                <Linkedin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">City / State</label>
              <div className="relative">
                <input type="text" value={cityState} onChange={e => setCityState(e.target.value)} className="form-input pl-10" placeholder="Bengaluru, Karnataka" />
                <MapPin className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={ageConfirmed}
                  onChange={e => setAgeConfirmed(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0"
                />
                <span>I'm 18 years or older *</span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-gray-300 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentTempAccount}
                  onChange={e => setConsentTempAccount(e.target.checked)}
                  className="mt-0.5 w-4 h-4 shrink-0"
                />
                <span>
                  I consent to The Test Troop Bugathon using my email address to create a temporary test account on
                  my behalf, sending me login credentials for contest participation, and deleting this account and
                  associated data once the contest concludes. (Required) *
                </span>
              </label>

              <label className="flex items-start gap-2.5 text-xs text-gray-300">
                <input
                  type="checkbox"
                  checked={rulesAcknowledged}
                  disabled
                  readOnly
                  className="mt-0.5 w-4 h-4 shrink-0 cursor-not-allowed"
                />
                <span>
                  I have read and agree to the{' '}
                  <button
                    type="button"
                    onClick={() => setShowRulesModal(true)}
                    className="text-indigo-300 underline hover:text-indigo-200 font-semibold"
                  >
                    Bugathon Contest Rules
                  </button>{' '}
                  * {rulesAcknowledged && <CheckCircle2 className="inline w-3.5 h-3.5 text-emerald-400 ml-1" />}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={!canSubmit || submitting}
              className="btn btn-primary w-full py-3 mt-4 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              {submitting ? 'Registering...' : 'Register'}
            </button>

          </form>

        </div>
      </div>

      <BugathonRulesModal
        isOpen={showRulesModal}
        onClose={() => setShowRulesModal(false)}
        onAcknowledge={() => setRulesAcknowledged(true)}
        onDecline={handleDecline}
      />
    </>
  );
};

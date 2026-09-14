import React, { useRef, useState } from 'react';
import { X, ShieldCheck, AlertTriangle, ArrowDown } from 'lucide-react';

interface BugathonRulesModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAcknowledge: () => void;
  onDecline: (reason: string) => void;
}

const LAST_UPDATED = 'September 14, 2026';

export const BugathonRulesModal: React.FC<BugathonRulesModalProps> = ({
  isOpen,
  onClose,
  onAcknowledge,
  onDecline,
}) => {
  const [mode, setMode] = useState<'rules' | 'decline'>('rules');
  const [scrolledToEnd, setScrolledToEnd] = useState(false);
  const [declineReason, setDeclineReason] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  if (!isOpen) return null;

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    const atBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 24;
    if (atBottom) setScrolledToEnd(true);
  };

  const handleClose = () => {
    setMode('rules');
    setScrolledToEnd(false);
    setDeclineReason('');
    onClose();
  };

  const handleAcknowledge = () => {
    onAcknowledge();
    handleClose();
  };

  const handleDeclineSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!declineReason.trim()) return;
    onDecline(declineReason.trim());
    handleClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-3xl flex flex-col max-h-[85vh]">

        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-4 shrink-0">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">
              {mode === 'rules' ? 'Please Read Carefully' : 'One Last Thing'}
            </span>
            <h2 className="text-xl font-bold text-white flex items-center gap-2 mt-1">
              <ShieldCheck className="w-5 h-5 text-indigo-400" />
              {mode === 'rules' ? 'The Test Troop Bugathon — Contest Rules' : 'Why are you declining?'}
            </h2>
          </div>
          <button onClick={handleClose} className="p-2 text-gray-400 hover:text-white rounded-lg hover:bg-white/10">
            <X className="w-5 h-5" />
          </button>
        </div>

        {mode === 'rules' ? (
          <>
            <div
              ref={scrollRef}
              onScroll={handleScroll}
              className="overflow-y-auto pr-2 flex-1 prose prose-invert max-w-none text-sm text-gray-300 leading-relaxed space-y-5"
            >
              <p className="text-xs text-gray-500">Last updated: {LAST_UPDATED}</p>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">1. Overview</h3>
                <p>
                  The Test Troop is conducting a Bugathon — a time-boxed, skill-based bug-hunting contest open to
                  registered participants. Participants test a mobile app and report bugs found during the contest
                  window to earn points. The app's name will be revealed only 5 minutes before the contest begins.
                  Participants with the highest scores win prizes as outlined below.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">2. Eligibility</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Open to individuals aged 18 years or older.</li>
                  <li>Participants must complete the official onboarding form and provide valid and accurate details, including a valid email address, to receive contest login credentials. Registrations with incomplete, false, or unreachable contact details may be disqualified.</li>
                  <li>Employees, direct family members of The Test Troop team, and anyone involved in judging are not eligible to win prizes but may participate for feedback purposes.</li>
                  <li>One entry per person. Duplicate registrations using multiple emails to gain extra submissions will result in disqualification.</li>
                  <li>Participation is free — no purchase or payment is required to enter.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">3. Contest Format</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Contest runs from 8:00 AM to 8:00 PM on the announced contest date (date to be confirmed separately and communicated to registered participants).</li>
                  <li>The app name will be revealed 5 minutes before the contest start time.</li>
                  <li>The app is an existing, published application, available on the respective app stores for its platform.</li>
                  <li>Login credentials (temporary username and randomly generated password) will be emailed to registered participants shortly before the contest start time.</li>
                  <li>Credentials are valid only for the contest duration and will be deactivated afterward.</li>
                  <li>The mode of bug submission will be communicated to registered participants closer to the contest date, via a dedicated submission page. Bugs can be submitted only through the official submission page — submissions sent via WhatsApp, personal number, or any other channel will not be considered.</li>
                  <li>This contest covers functional, UI, and general usability testing only. Deep security or cybersecurity-level testing (e.g., penetration testing, vulnerability probing, exploit attempts) is out of scope and not part of this contest.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">4. Scoring Criteria</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="text-left py-2 pr-3">Bug Type</th>
                        <th className="text-left py-2 pr-3">Points</th>
                        <th className="text-left py-2">Description</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr><td className="py-2 pr-3 font-semibold text-white">Crash / Critical</td><td className="py-2 pr-3">8</td><td className="py-2">App force-closes, data loss, or a feature completely blocked</td></tr>
                      <tr><td className="py-2 pr-3 font-semibold text-white">Functional</td><td className="py-2 pr-3">5</td><td className="py-2">A feature doesn't work as intended, but the app doesn't crash</td></tr>
                      <tr><td className="py-2 pr-3 font-semibold text-white">UI</td><td className="py-2 pr-3">3</td><td className="py-2">Visual/layout issues — misalignment, broken styling, overlapping elements</td></tr>
                      <tr><td className="py-2 pr-3 font-semibold text-white">Typo</td><td className="py-2 pr-3">2</td><td className="py-2">Spelling, grammar, or text display errors</td></tr>
                      <tr><td className="py-2 pr-3 font-semibold text-red-300">Same tester re-submitting same bug</td><td className="py-2 pr-3 text-red-300">−2 (per repeat)</td><td className="py-2">Applies only when the same participant resubmits or rewords a bug they already reported to attempt scoring twice</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 pt-1">
                  Final categorization and point allocation for borderline cases is at The Test Troop's sole discretion,
                  based on actual impact to the user experience. Different participants independently reporting the
                  same bug will each be scored normally — no penalty applies for genuine independent discovery. Each
                  bug report must include a clear description and steps to reproduce (screenshot or screen recording
                  preferred). Vague or non-reproducible reports may be rejected without points.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">5. Invalid Submissions</h3>
                <p>The following will not be awarded points:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Reports with no steps to reproduce or insufficient detail to verify</li>
                  <li>Feature requests or suggestions (not bugs)</li>
                  <li>Reports submitted after the contest submission window closes</li>
                </ul>
                <p>Bug report submissions will close at a specific time announced during the contest. Reports received after this cutoff will not be considered.</p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">6. Tie-Breaker Rule</h3>
                <p>If two or more participants finish with the same total score, the tie will be broken by:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>The participant who reported the highest-severity bug (Crash/Critical &gt; Functional &gt; UI &gt; Typo) wins.</li>
                  <li>If still tied, the participant who submitted their first valid bug earliest during the contest wins.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">7. Prizes</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-white/10 text-gray-400">
                        <th className="text-left py-2 pr-3">Rank</th>
                        <th className="text-left py-2">Prize (INR)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      <tr><td className="py-2 pr-3 font-semibold text-white">1st</td><td className="py-2">₹1,000</td></tr>
                      <tr><td className="py-2 pr-3 font-semibold text-white">2nd</td><td className="py-2">₹500</td></tr>
                      <tr><td className="py-2 pr-3 font-semibold text-white">3rd</td><td className="py-2">₹300</td></tr>
                      <tr><td className="py-2 pr-3 font-semibold text-white">Runner-up (x2)</td><td className="py-2">₹100 each</td></tr>
                    </tbody>
                  </table>
                </div>
                <p className="text-xs text-gray-400 pt-1">
                  Winners will be announced within 48 hours of contest close, on The Test Troop LinkedIn page and via
                  email. Payment will be made via UPI/bank transfer within 7 business days of winner confirmation.
                  Winners will be asked to share payout details only after being confirmed as winners. Prizes are
                  non-transferable and awarded at The Test Troop's discretion based on valid, verified submissions.
                </p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">8. Data & Account Handling</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Temporary accounts are created only for registered participants who have given explicit consent during onboarding.</li>
                  <li>Login credentials are sent to the registered email shortly before contest start.</li>
                  <li>All temporary accounts and associated personal data will be deleted within 48 hours after the contest ends, except for the name/contact information of confirmed winners, retained only as needed for prize payout and record-keeping.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">9. Communication Channels</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Email is the official channel for all registration confirmations, login credentials, the app's Play Store/App Store links, and the submission page link.</li>
                  <li>WhatsApp is used only for reminder notifications (e.g., contest starting in 10 minutes, 5 minutes, and submission window closing soon). No credentials, links, or official information will be sent via WhatsApp.</li>
                  <li>Bug reports sent via WhatsApp or any personal number will not be accepted or scored.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">10. Certificate of Participation</h3>
                <p>All participants who submit at least one valid bug report will receive a Certificate of Participation bearing their full name, issued by The Test Troop. Certificates will be sent via email within a reasonable time after the contest concludes.</p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">11. Code of Conduct</h3>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Participants must not attempt to exploit, damage, or maliciously disrupt the app or backend in ways beyond normal bug discovery (e.g., no attempts to access other users' data, denial-of-service attempts, or unauthorized system access).</li>
                  <li>This contest is limited to functional, UI, and usability bug discovery. No cybersecurity-level or deep security testing (penetration testing, exploit attempts, vulnerability scanning, etc.) is permitted or in scope.</li>
                  <li>Any participant found violating this will be disqualified without notice.</li>
                </ul>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">12. Changes to Rules</h3>
                <p>The Test Troop reserves the right to update these rules, contest timing, or prize structure at any time before the contest begins. Any changes will be communicated via The Test Troop LinkedIn page.</p>
              </section>

              <section className="space-y-1.5">
                <h3 className="text-white font-bold text-base">13. Contact</h3>
                <p>For questions about the contest, reach out at <a href="mailto:thetesttroopp@gmail.com" className="text-indigo-300 hover:underline">thetesttroopp@gmail.com</a>.</p>
              </section>

              <section className="space-y-1.5 pb-2">
                <h3 className="text-white font-bold text-base">14. Acknowledgment</h3>
                <p>
                  By clicking Acknowledge below, you confirm you have read and accept these rules in full. If you
                  decline, you will be asked to briefly share your reason, and you will not be issued contest login
                  credentials.
                </p>
              </section>
            </div>

            {!scrolledToEnd && (
              <div className="text-center text-xs text-amber-300 flex items-center justify-center gap-1.5 py-2 shrink-0">
                <ArrowDown className="w-3.5 h-3.5 animate-bounce" />
                Scroll to the end to enable Acknowledge / Decline
              </div>
            )}

            <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3 shrink-0">
              <button
                type="button"
                disabled={!scrolledToEnd}
                onClick={() => setMode('decline')}
                className="btn btn-ghost disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Decline
              </button>
              <button
                type="button"
                disabled={!scrolledToEnd}
                onClick={handleAcknowledge}
                className="btn btn-primary px-8 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Acknowledge
              </button>
            </div>
          </>
        ) : (
          <form onSubmit={handleDeclineSubmit} className="space-y-5 flex-1 flex flex-col">
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-xl text-amber-200 text-xs flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>You won't be able to register for this contest without acknowledging the rules. Letting us know why helps us improve them.</span>
            </div>

            <div className="form-group flex-1">
              <label className="form-label">Reason for declining *</label>
              <textarea
                required
                autoFocus
                rows={5}
                placeholder="Tell us briefly why you're declining the contest rules..."
                value={declineReason}
                onChange={e => setDeclineReason(e.target.value)}
                className="form-textarea"
              />
            </div>

            <div className="pt-2 border-t border-white/10 flex items-center justify-end gap-3">
              <button type="button" onClick={() => setMode('rules')} className="btn btn-ghost">
                Back to Rules
              </button>
              <button type="submit" disabled={!declineReason.trim()} className="btn btn-primary px-8 disabled:opacity-40">
                Submit
              </button>
            </div>
          </form>
        )}

      </div>
    </div>
  );
};

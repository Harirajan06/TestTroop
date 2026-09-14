import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck } from 'lucide-react';

const SUPPORT_EMAIL = 'thetesttroopp@gmail.com';
const LAST_UPDATED = 'September 14, 2026';

export const PrivacyPolicyPage: React.FC = () => {
  return (
    <div className="py-8 max-w-3xl mx-auto space-y-8">

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1 text-xs font-bold text-purple-300">
          <ShieldCheck className="w-4 h-4 text-purple-400" /> Privacy Policy
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Privacy Policy</h1>
        <p className="text-gray-400 text-xs">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed space-y-8">

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">1. Introduction</h2>
          <p>
            The Test Troop ("we", "us", "our") operates this software testing contest platform. This Privacy Policy
            explains what information we collect from testers and contest participants, how we use it, and the choices
            you have. By registering for a contest or otherwise using the platform, you agree to the practices described here.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">2. Information We Collect</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li><strong>Account information:</strong> full name, email address, and mobile number, provided when your account is created.</li>
            <li><strong>Profile information:</strong> an optional profile photo/avatar URL.</li>
            <li><strong>Contest activity:</strong> which contests you register for, and your submission timestamps.</li>
            <li><strong>Submission content:</strong> bug reports, UI/UX feedback, suggestions, and any screenshots, videos, or attachments you upload as part of a submission.</li>
            <li><strong>Communications:</strong> if you email us for support, we retain that correspondence to respond and keep a record.</li>
          </ul>
          <p>We do not collect payment card details or government ID numbers through this platform.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">3. How We Use Your Information</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>To create and manage your account and contest registrations.</li>
            <li>To evaluate submissions, judge contests, and determine and contact winners.</li>
            <li>To send contest updates, results, and — if you've opted in — email campaigns about new contests.</li>
            <li>To operate WhatsApp group access for registered testers during active contests.</li>
            <li>To maintain platform security and prevent abuse.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">4. How We Store & Protect Your Information</h2>
          <p>
            Your data is stored in a Supabase-hosted PostgreSQL database with row-level security policies restricting
            who can read or write each table — for example, your mobile number and email are never exposed to other
            testers, only to platform administrators. Email campaigns are sent through Brevo; Brevo's API credentials
            are kept server-side and are never exposed to your browser. We do not use custom browser local storage to
            hold your session or personal data — authentication sessions are managed directly by our backend provider.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">5. Sharing of Information</h2>
          <p>
            We do not sell your personal information. We share data only with the service providers necessary to run
            the platform (database hosting and email delivery, as described above), and with contest organizers/admins
            solely for the purpose of judging submissions and awarding prizes. We may disclose information if required
            by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">6. Your Rights</h2>
          <p>
            You can request access to, correction of, or deletion of your personal information at any time by emailing{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-300 hover:underline">{SUPPORT_EMAIL}</a>.
            We will respond within a reasonable timeframe. Deleting your account will remove your profile information;
            submission records tied to already-judged contests may be retained for record-keeping.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">7. Children's Privacy</h2>
          <p>This platform is not directed at children under 18. We do not knowingly collect information from anyone under 18.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">8. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. Material changes will be reflected by updating the "Last updated" date above.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">9. Contact Us</h2>
          <p>
            Questions about this policy? Email us at{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-300 hover:underline">{SUPPORT_EMAIL}</a>{' '}
            or visit our <Link to="/contact" className="text-purple-300 hover:underline">Contact page</Link>.
          </p>
        </section>

      </div>
    </div>
  );
};

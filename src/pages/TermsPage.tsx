import React from 'react';
import { Link } from 'react-router-dom';
import { FileText } from 'lucide-react';

const SUPPORT_EMAIL = 'thetesttroopp@gmail.com';
const LAST_UPDATED = 'September 14, 2026';

export const TermsPage: React.FC = () => {
  return (
    <div className="py-8 max-w-3xl mx-auto space-y-8">

      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1 text-xs font-bold text-purple-300">
          <FileText className="w-4 h-4 text-purple-400" /> Terms & Conditions
        </div>
        <h1 className="text-3xl md:text-4xl font-black text-white tracking-tight">Terms & Conditions</h1>
        <p className="text-gray-400 text-xs">Last updated: {LAST_UPDATED}</p>
      </div>

      <div className="prose prose-invert max-w-none text-gray-300 text-sm leading-relaxed space-y-8">

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">1. Acceptance of Terms</h2>
          <p>
            By registering an account, registering for a contest, or submitting testing findings on The Test Troop
            ("the Platform"), you agree to these Terms & Conditions. If you do not agree, please do not use the Platform.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">2. Eligibility</h2>
          <p>
            You must be at least 18 years old and able to enter a binding agreement to participate. You are responsible
            for providing accurate account information, including a working email address and mobile number.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">3. Contest Participation</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Each contest has its own registration window, testing window, and submission deadline shown on the contest page — late submissions are not accepted.</li>
            <li>You may only submit findings for contests you have registered for, using the product/URL provided for that contest.</li>
            <li>Submissions must be your own original work. Copying another tester's findings or submitting automated/bulk-generated reports without genuine testing is prohibited and may result in disqualification.</li>
            <li>We reserve the right to disqualify any submission or participant that violates these Terms, abuses the Platform, or engages in fraudulent activity.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">4. Judging & Prizes</h2>
          <ul className="list-disc pl-5 space-y-1">
            <li>Submissions are reviewed and scored by contest administrators based on bug quality, coverage, UI/UX feedback quality, and suggestions, at the administrators' reasonable discretion.</li>
            <li>Winner selection and prize amounts are as stated on the individual contest page at the time of registration.</li>
            <li>Prize payouts are processed after winner announcement; payout method and timeline will be communicated directly to the winner.</li>
            <li>Participation does not guarantee a prize. We reserve the right to award no prize for a contest if no submission meets the minimum quality bar.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">5. Submission Content & License</h2>
          <p>
            By submitting a bug report, UI/UX feedback, or suggestion, you grant The Test Troop a non-exclusive,
            royalty-free license to use, reproduce, and act on that content for the purpose of evaluating contest
            entries and improving the tested product. You retain ownership of your original submission content.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">6. Confidentiality</h2>
          <p>
            Contest target applications, product URLs, and testing instructions shared with you are confidential and
            provided solely for the purpose of testing during the applicable contest window. Do not share access
            credentials, product URLs, or unreleased product details outside the contest's official WhatsApp group.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">7. Account Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these Terms, misuse the Platform, or engage in abusive
            behavior toward other testers, contest organizers, or staff.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">8. Disclaimers & Limitation of Liability</h2>
          <p>
            The Platform is provided "as is" without warranties of any kind. We are not liable for indirect,
            incidental, or consequential damages arising from your use of the Platform, to the maximum extent
            permitted by law.
          </p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">9. Changes to These Terms</h2>
          <p>We may update these Terms from time to time. Continued use of the Platform after changes are posted constitutes acceptance of the updated Terms.</p>
        </section>

        <section className="space-y-2">
          <h2 className="text-white text-lg font-bold">10. Contact</h2>
          <p>
            Questions about these Terms? Email{' '}
            <a href={`mailto:${SUPPORT_EMAIL}`} className="text-purple-300 hover:underline">{SUPPORT_EMAIL}</a>{' '}
            or visit our <Link to="/contact" className="text-purple-300 hover:underline">Contact page</Link>. See also our{' '}
            <Link to="/privacy-policy" className="text-purple-300 hover:underline">Privacy Policy</Link>.
          </p>
        </section>

      </div>
    </div>
  );
};

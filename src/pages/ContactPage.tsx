import React from 'react';
import { Mail, MessageSquare, Clock } from 'lucide-react';

const SUPPORT_EMAIL = 'thetesttroopp@gmail.com';

export const ContactPage: React.FC = () => {
  return (
    <div className="space-y-10 py-8 max-w-3xl mx-auto">

      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 bg-purple-500/10 border border-purple-500/30 rounded-full px-4 py-1 text-xs font-bold text-purple-300">
          <Mail className="w-4 h-4 text-purple-400" /> Contact Us
        </div>
        <h1 className="text-3xl md:text-5xl font-black text-white tracking-tight">
          Get In Touch
        </h1>
        <p className="text-gray-300 text-sm md:text-base leading-relaxed">
          Questions about a contest, a submission, a payout, or anything else? Reach out — we usually reply within 1-2 business days.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-3 hover:border-purple-400/40 transition-colors group"
        >
          <Mail className="w-6 h-6 text-purple-400" />
          <h3 className="text-white font-bold">Email Support</h3>
          <p className="text-purple-300 text-sm font-mono group-hover:underline">{SUPPORT_EMAIL}</p>
          <p className="text-gray-400 text-xs">Best for account issues, contest questions, and payout status.</p>
        </a>

        <div className="bg-glass-card p-6 rounded-2xl border border-white/10 space-y-3">
          <MessageSquare className="w-6 h-6 text-emerald-400" />
          <h3 className="text-white font-bold">WhatsApp Group Support</h3>
          <p className="text-gray-400 text-sm">Registered testers get a dedicated WhatsApp group per contest for live Q&A during the testing window.</p>
        </div>
      </div>

      <div className="bg-glass-card p-6 rounded-2xl border border-white/10 flex items-center gap-4">
        <Clock className="w-6 h-6 text-amber-400 shrink-0" />
        <p className="text-gray-300 text-sm">
          Support hours: Monday - Saturday, 10 AM - 6 PM IST. We aim to respond to every email within 1-2 business days.
        </p>
      </div>

    </div>
  );
};

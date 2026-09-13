import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Github, Twitter, Linkedin, MessageSquare } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-950 border-t border-white/10 pt-16 pb-12 mt-20">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-12">
          
          {/* COL 1: BRAND */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-cyan-400 flex items-center justify-center text-white">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="font-heading font-bold text-lg text-white">THE TEST TROOP</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed">
              The premier crowdsourced software testing contest platform. Connecting innovative digital products with elite QA testers worldwide.
            </p>
          </div>

          {/* COL 2: QUICK LINKS */}
          <div>
            <h4 className="font-heading text-white font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><Link to="/contests" className="hover:text-indigo-400 transition-colors">Active Contests</Link></li>
              <li><Link to="/winners" className="hover:text-indigo-400 transition-colors">Hall of Winners</Link></li>
              <li><Link to="/dashboard" className="hover:text-indigo-400 transition-colors">Tester Dashboard</Link></li>
              <li><Link to="/signup" className="hover:text-indigo-400 transition-colors">Become a Tester</Link></li>
            </ul>
          </div>

          {/* COL 3: TESTING CATEGORIES */}
          <div>
            <h4 className="font-heading text-white font-semibold mb-4 text-sm uppercase tracking-wider">Testing Domains</h4>
            <ul className="space-y-2.5 text-sm text-gray-400">
              <li><span className="hover:text-cyan-400 cursor-pointer">Mobile Apps (iOS & Android)</span></li>
              <li><span className="hover:text-cyan-400 cursor-pointer">Web Applications & SaaS</span></li>
              <li><span className="hover:text-cyan-400 cursor-pointer">Fintech & Biometric Auth</span></li>
              <li><span className="hover:text-cyan-400 cursor-pointer">UI / UX Audits</span></li>
            </ul>
          </div>

          {/* COL 4: COMMUNITY & WHATSAPP */}
          <div>
            <h4 className="font-heading text-white font-semibold mb-4 text-sm uppercase tracking-wider">Troop Community</h4>
            <p className="text-gray-400 text-xs mb-4">Join our official tester channels for real-time contest drops and payout updates.</p>
            <div className="flex items-center gap-3 text-gray-400">
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"><Twitter className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"><Github className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-white transition-colors"><Linkedin className="w-4 h-4" /></a>
              <a href="#" className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-emerald-400 transition-colors"><MessageSquare className="w-4 h-4" /></a>
            </div>
          </div>

        </div>

        {/* BOTTOM COPYRIGHT */}
        <div className="pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between text-xs text-gray-500 gap-4">
          <p>© {new Date().getFullYear()} The Test Troop. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-gray-400 cursor-pointer">Privacy Policy</span>
            <span className="hover:text-gray-400 cursor-pointer">Terms of Service</span>
            <span className="hover:text-gray-400 cursor-pointer">Security Policy</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

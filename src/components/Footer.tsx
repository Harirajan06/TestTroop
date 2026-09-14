import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Heart, Github, Twitter, Linkedin, MessageSquare } from 'lucide-react';
import { useSiteSettings } from '../context/SiteSettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSiteSettings();
  return (
    <footer className="border-t border-purple-500/15 pt-12 pb-10 mt-16 bg-[#0e0734]/80 backdrop-blur-lg">
      <div className="container mx-auto px-4 sm:px-6 space-y-8">
        
        {/* TOP ROW: LOGO, NAV LINKS, SOCIALS */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group shrink-0">
            <img 
              src="/appicon.jpeg" 
              alt="The Test Troop Logo" 
              className="w-9 h-9 rounded-xl shadow-lg shadow-[#6D19FF]/30 group-hover:scale-105 transition-transform shrink-0 object-cover border border-purple-400/20"
            />
            <div className="shrink-0 text-left">
              <span className="font-heading font-black text-base tracking-tight text-white block">
                THE TEST <span className="text-gradient">TROOP</span>
              </span>
              <span className="text-[9px] text-purple-200/50 font-semibold tracking-widest uppercase block -mt-1">
                Elite Testing Community
              </span>
            </div>
          </Link>

          {/* Centered Navigation Links */}
          <nav className="flex items-center gap-6 sm:gap-8 text-xs sm:text-sm font-semibold text-gray-300">
            {settings.contests_visible && <Link to="/contests" className="hover:text-purple-300 transition-colors">Contests</Link>}
            {settings.winners_visible && <Link to="/winners" className="hover:text-purple-300 transition-colors">Hall of Winners</Link>}
            {settings.learn_visible && <Link to="/learn" className="hover:text-purple-300 transition-colors">Learn</Link>}
            {settings.community_visible && <Link to="/community" className="hover:text-purple-300 transition-colors">Community</Link>}
          </nav>

          {/* Social Icons */}
          <div className="flex items-center gap-4 text-gray-400 shrink-0">
            <a href="#" className="hover:text-white transition-colors" aria-label="GitHub"><Github className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors" aria-label="LinkedIn"><Linkedin className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors" aria-label="Twitter"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="hover:text-white transition-colors" aria-label="YouTube"><MessageSquare className="w-4 h-4" /></a>
          </div>
        </div>

        {/* BOTTOM ROW: COPYRIGHT & LEGAL */}
        <div className="pt-6 border-t border-purple-500/10 flex flex-col sm:flex-row items-center justify-between text-xs text-purple-200/50 gap-4">
          <p>© 2024 The Test Troop. All rights reserved.</p>
          <div className="flex items-center gap-6 text-xs text-purple-200/60">
            <Link to="/privacy-policy" className="hover:text-white transition-colors">Privacy</Link>
            <Link to="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link to="/contact" className="hover:text-white transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

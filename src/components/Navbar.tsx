import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSiteSettings } from '../context/SiteSettingsContext';
import { ShieldCheck, User, LogOut, Trophy, Award, LayoutDashboard, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const { settings } = useSiteSettings();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 border-b border-purple-500/15 bg-[#14094e]/80 backdrop-blur-xl transition-colors">
      <div className="container mx-auto px-4 sm:px-6 h-20 flex items-center justify-between relative">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group shrink-0 z-10">
          <img 
            src="/appicon.jpeg" 
            alt="The Test Troop Logo" 
            className="w-10 h-10 rounded-xl shadow-lg shadow-[#6D19FF]/30 group-hover:scale-105 transition-transform shrink-0 object-cover border border-purple-400/20"
          />
          <div className="shrink-0">
            <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
              THE TEST <span className="text-gradient">TROOP</span>
            </span>
            <span className="text-[9px] text-purple-200/60 font-semibold tracking-widest uppercase block -mt-1 whitespace-nowrap">
              Elite Testing Community
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS - CENTERED */}
        <nav className="hidden md:flex items-center gap-7 lg:gap-9 md:absolute md:left-1/2 md:-translate-x-1/2 text-sm font-semibold text-gray-300">
          {settings.contests_visible && (
            <Link
              to="/contests"
              className={`hover:text-purple-300 transition-colors whitespace-nowrap ${isActive('/contests') ? 'text-purple-400 font-bold' : ''}`}
            >
              Contests
            </Link>
          )}
          {settings.winners_visible && (
            <Link
              to="/winners"
              className={`hover:text-purple-300 transition-colors whitespace-nowrap ${isActive('/winners') ? 'text-purple-400 font-bold' : ''}`}
            >
              Hall of Winners
            </Link>
          )}
          {settings.learn_visible && (
            <Link
              to="/learn"
              className={`hover:text-purple-300 transition-colors whitespace-nowrap ${isActive('/learn') ? 'text-purple-400 font-bold' : ''}`}
            >
              Learn
            </Link>
          )}
          {settings.community_visible && (
            <Link
              to="/community"
              className={`hover:text-purple-300 transition-colors whitespace-nowrap ${isActive('/community') ? 'text-purple-400 font-bold' : ''}`}
            >
              Community
            </Link>
          )}
          {user && (
            <Link 
              to="/dashboard" 
              className={`hover:text-purple-300 transition-colors whitespace-nowrap ${isActive('/dashboard') ? 'text-purple-400 font-bold' : ''}`}
            >
              My Contests
            </Link>
          )}
        </nav>

        {/* RIGHT ACTIONS (Logged-in user controls only, otherwise empty balance spacer) */}
        <div className="hidden md:flex items-center justify-end z-10 min-w-[40px]">
          {user ? (
            <div className="flex items-center gap-3">
              {isAdmin && (
                <Link to="/plasma" className="btn btn-secondary btn-sm flex items-center gap-1.5 whitespace-nowrap">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin</span>
                </Link>
              )}
              
              <Link to="/profile" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition-all">
                <img 
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                  alt={user.full_name} 
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-purple-500/50"
                />
                <span className="text-xs font-semibold text-white max-w-[100px] truncate">{user.full_name}</span>
              </Link>

              <button
                onClick={logout}
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Invisible spacer to maintain symmetry on wide screens */
            <div className="w-10 h-10" />
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden text-gray-300 hover:text-white p-2 z-10 rounded-lg hover:bg-white/5 transition-colors"
          aria-label="Toggle navigation menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-white/10 px-6 py-6 space-y-4">
          {settings.contests_visible && (
            <Link to="/contests" className="block text-gray-200 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Contests</Link>
          )}
          {settings.winners_visible && (
            <Link to="/winners" className="block text-gray-200 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Hall of Winners</Link>
          )}
          {settings.learn_visible && (
            <Link to="/learn" className="block text-gray-200 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Learn</Link>
          )}
          {settings.community_visible && (
            <Link to="/community" className="block text-gray-200 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Community</Link>
          )}
          {user && (
            <Link to="/dashboard" className="block text-gray-200 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>My Contests Dashboard</Link>
          )}
          {isAdmin && (
            <Link to="/plasma" className="block text-amber-400 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Admin Console</Link>
          )}
          {user ? (
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm text-gray-300">{user.full_name}</span>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-red-400 text-sm font-semibold flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : null}
        </div>
      )}
    </header>
  );
};

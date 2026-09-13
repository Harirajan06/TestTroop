import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, User, LogOut, Trophy, Award, LayoutDashboard, Menu, X } from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-glass sticky top-0 z-50 border-b border-white/10">
      <div className="container mx-auto px-4 h-20 flex items-center justify-between gap-4">
        
        {/* LOGO */}
        <Link to="/" className="flex items-center gap-3 group shrink-0">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-indigo-500/30 group-hover:scale-105 transition-transform shrink-0">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div className="shrink-0">
            <span className="font-heading font-black text-lg sm:text-xl tracking-tight text-white flex items-center gap-1.5 whitespace-nowrap">
              THE TEST <span className="text-gradient">TROOP</span>
            </span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-widest uppercase block -mt-1 whitespace-nowrap">
              Elite Testing Community
            </span>
          </div>
        </Link>

        {/* DESKTOP NAV LINKS */}
        <nav className="hidden lg:flex items-center gap-6 xl:gap-8 text-sm font-semibold text-gray-300 shrink-0">
          <Link 
            to="/contests" 
            className={`hover:text-indigo-400 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('/contests') ? 'text-indigo-400 font-bold' : ''}`}
          >
            <Trophy className="w-4 h-4" />
            Contests
          </Link>
          <Link 
            to="/winners" 
            className={`hover:text-indigo-400 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('/winners') ? 'text-indigo-400 font-bold' : ''}`}
          >
            <Award className="w-4 h-4 text-pink-400" />
            Hall of Winners
          </Link>
          {user && (
            <Link 
              to="/dashboard" 
              className={`hover:text-indigo-400 transition-colors flex items-center gap-2 whitespace-nowrap ${isActive('/dashboard') ? 'text-indigo-400 font-bold' : ''}`}
            >
              <LayoutDashboard className="w-4 h-4 text-cyan-400" />
              My Contests
            </Link>
          )}
        </nav>

        {/* USER ACTIONS */}
        <div className="hidden md:flex items-center gap-2 lg:gap-3 shrink-0">
          {user ? (
            <div className="flex items-center gap-2 lg:gap-3">
              {isAdmin && (
                <Link to="/admin" className="btn btn-secondary btn-sm flex items-center gap-1.5 whitespace-nowrap shrink-0">
                  <ShieldCheck className="w-4 h-4 text-amber-400" />
                  <span>Admin Console</span>
                </Link>
              )}
              
              <Link to="/profile" className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-2.5 py-1.5 rounded-xl border border-white/10 transition-all shrink-0">
                <img 
                  src={user.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
                  alt={user.full_name} 
                  className="w-7 h-7 rounded-full object-cover ring-2 ring-indigo-500/50 shrink-0"
                />
                <span className="text-xs sm:text-sm font-semibold text-white max-w-[100px] xl:max-w-[130px] truncate">{user.full_name}</span>
              </Link>

              <button 
                onClick={logout} 
                className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10 shrink-0"
                title="Logout"
              >
                <LogOut className="w-4 h-4 sm:w-5 sm:h-5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 lg:gap-3 shrink-0">
              <Link to="/login" className="btn btn-ghost btn-sm whitespace-nowrap">Log In</Link>
              <Link to="/signup" className="btn btn-primary btn-sm whitespace-nowrap">Sign Up Free</Link>
            </div>
          )}
        </div>

        {/* MOBILE MENU TOGGLE */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="lg:hidden text-gray-300 p-2 shrink-0"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MOBILE MENU */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-slate-950 border-b border-white/10 px-6 py-6 space-y-4">
          <Link to="/contests" className="block text-gray-200 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Contests</Link>
          <Link to="/winners" className="block text-gray-200 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Hall of Winners</Link>
          {user && (
            <Link to="/dashboard" className="block text-gray-200 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>My Contests Dashboard</Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="block text-amber-400 font-semibold py-2" onClick={() => setMobileMenuOpen(false)}>Admin Console</Link>
          )}
          {user ? (
            <div className="pt-4 border-t border-white/10 flex items-center justify-between">
              <span className="text-sm text-gray-300">{user.full_name}</span>
              <button onClick={() => { logout(); setMobileMenuOpen(false); }} className="text-red-400 text-sm font-semibold flex items-center gap-1">
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          ) : (
            <div className="pt-4 border-t border-white/10 flex flex-col gap-2">
              <Link to="/login" className="btn btn-secondary w-full" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
              <Link to="/signup" className="btn btn-primary w-full" onClick={() => setMobileMenuOpen(false)}>Sign Up Free</Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};

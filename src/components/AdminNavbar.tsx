import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, ArrowLeft, UserCheck } from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="bg-slate-950 border-b border-indigo-500/20 h-16 sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <Link to="/" className="flex items-center gap-2 text-xs text-gray-400 hover:text-white transition-colors bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Public App
        </Link>
        <div className="h-4 w-[1px] bg-white/10 hidden sm:block" />
        <span className="font-heading font-bold text-sm text-indigo-300 tracking-wider uppercase flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-amber-400" /> Admin Control Center
        </span>
      </div>

      <div className="flex items-center gap-4">
        <button 
          onClick={() => navigate('/')}
          className="text-xs text-indigo-300 hover:text-white bg-indigo-900/40 hover:bg-indigo-900/80 px-3 py-1.5 rounded-lg border border-indigo-500/30 transition-colors flex items-center gap-1.5"
        >
          <UserCheck className="w-3.5 h-3.5 text-cyan-400" /> Switch to Tester View
        </button>

        <div className="flex items-center gap-3 border-l border-white/10 pl-4">
          <img 
            src={user?.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'} 
            alt="Admin" 
            className="w-7 h-7 rounded-full object-cover ring-2 ring-amber-400/50"
          />
          <span className="text-xs font-semibold text-white hidden sm:block">{user?.full_name}</span>
          <button 
            onClick={logout} 
            className="p-1.5 text-gray-400 hover:text-red-400 transition-colors rounded-lg hover:bg-red-500/10"
            title="Logout"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
};

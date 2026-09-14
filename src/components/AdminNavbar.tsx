import React from 'react';
import { useAuth } from '../context/AuthContext';
import { LogOut } from 'lucide-react';

export const AdminNavbar: React.FC = () => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-slate-950 border-b border-indigo-500/20 h-16 sticky top-0 z-40 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4">
        <span className="font-heading font-bold text-sm text-indigo-300 tracking-wider uppercase flex items-center gap-2">
          <img src="/appicon.jpeg" alt="App Icon" className="w-5 h-5 rounded object-cover" /> Admin Control Center
        </span>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
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

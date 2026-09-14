import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Trophy, 
  Users, 
  FileText, 
  Award, 
  Mail, 
  Settings, 
  PlusCircle, 
  CheckSquare 
} from 'lucide-react';

export const AdminSidebar: React.FC = () => {
  const navItems = [
    { to: '/plasma', label: 'Overview Dashboard', icon: LayoutDashboard, end: true },
    { to: '/plasma/contests', label: 'Manage Contests', icon: Trophy },
    { to: '/plasma/contests/create', label: 'Create Contest', icon: PlusCircle },
    { to: '/plasma/users', label: 'Registered Testers', icon: Users },
    { to: '/plasma/campaigns', label: 'Brevo Campaigns', icon: Mail },
    { to: '/plasma/settings', label: 'Platform Settings', icon: Settings },
  ];

  return (
    <aside className="w-64 bg-slate-950 border-r border-white/10 min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between hidden md:block">
      <div className="space-y-6">
        <div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider px-3 mb-2 block">
            Navigation
          </span>
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => 
                    `flex items-center gap-3 px-3 py-2.5 rounded-xl font-medium text-sm transition-all ${
                      isActive 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' 
                        : 'text-gray-400 hover:text-white hover:bg-white/5'
                    }`
                  }
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </NavLink>
              );
            })}
          </nav>
        </div>
      </div>

      <div className="p-3 bg-indigo-950/40 border border-indigo-500/20 rounded-xl">
        <span className="text-xs font-semibold text-indigo-300 flex items-center gap-1.5 mb-1">
          <CheckSquare className="w-3.5 h-3.5 text-emerald-400" /> Secure Admin Mode
        </span>
        <p className="text-[11px] text-gray-400 leading-normal">
          Brevo API credentials & RLS authorization strictly active.
        </p>
      </div>
    </aside>
  );
};

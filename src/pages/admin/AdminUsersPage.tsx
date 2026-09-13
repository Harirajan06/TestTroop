import React, { useState, useEffect } from 'react';
import { dbStore, fetchProfilesAsync } from '../../lib/supabase';
import { UserProfile, UserRole } from '../../types';
import { Users, Search, Mail, Phone, ShieldCheck, Trash2 } from 'lucide-react';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>(() => dbStore.getUsers());
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchProfilesAsync().then(fetched => {
      if (fetched && fetched.length > 0) {
        setUsers(fetched);
      }
    });
  }, []);

  const filteredUsers = users.filter(u => 
    u.full_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    u.mobile_number.includes(searchQuery)
  );

  const toggleUserRole = (user: UserProfile) => {
    const newRole: UserRole = user.role === 'admin' ? 'user' : 'admin';
    const updated = { ...user, role: newRole };
    dbStore.saveUser(updated);
    setUsers(dbStore.getUsers());
  };

  const handleDeleteUser = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove user "${name}"?`)) {
      dbStore.deleteUser(id);
      setUsers(dbStore.getUsers());
    }
  };

  return (
    <div className="space-y-8">
      
      <div>
        <h1 className="text-3xl font-bold text-white flex items-center gap-2">
          <Users className="w-7 h-7 text-cyan-400" /> Registered Tester Roster ({users.length})
        </h1>
        <p className="text-gray-400 text-xs mt-1">Manage user profiles, contact metrics, and authorization roles</p>
      </div>

      {/* SEARCH */}
      <div className="bg-glass-card p-4 rounded-2xl border border-white/10 max-w-md">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Search by name, email, or phone..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="form-input pl-10"
          />
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* USERS TABLE */}
      {filteredUsers.length > 0 ? (
        <div className="bg-glass-card rounded-3xl border border-white/10 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-900/90 text-gray-400 font-semibold border-b border-white/10 uppercase tracking-wider">
                <tr>
                  <th className="p-4">User</th>
                  <th className="p-4">Email</th>
                  <th className="p-4">Mobile Phone</th>
                  <th className="p-4">Role</th>
                  <th className="p-4">Joined Date</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5 text-gray-300">
                {filteredUsers.map(u => (
                  <tr key={u.id} className="hover:bg-white/5 transition-colors">
                    <td className="p-4 font-bold text-white flex items-center gap-3">
                      <img 
                        src={u.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80'} 
                        alt={u.full_name} 
                        className="w-8 h-8 rounded-full object-cover ring-2 ring-indigo-500/30"
                      />
                      <span>{u.full_name}</span>
                    </td>
                    <td className="p-4 text-indigo-300 font-medium">{u.email}</td>
                    <td className="p-4 text-gray-300 font-mono">{u.mobile_number}</td>
                    <td className="p-4">
                      <span className={`badge ${u.role === 'admin' ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'badge-registration_open'}`}>
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="p-4 text-gray-400">
                      {new Date(u.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button 
                          onClick={() => toggleUserRole(u)}
                          className="btn btn-secondary btn-sm text-[11px]"
                        >
                          Set as {u.role === 'admin' ? 'Tester' : 'Admin'}
                        </button>
                        <button 
                          onClick={() => handleDeleteUser(u.id, u.full_name)}
                          className="p-2 text-red-400 hover:text-white rounded-lg hover:bg-red-500/20"
                          title="Remove User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-glass p-12 rounded-3xl text-center space-y-3 max-w-lg mx-auto border border-white/10">
          <Users className="w-12 h-12 text-gray-500 mx-auto" />
          <h3 className="text-xl font-bold text-white">No Registered Users Found</h3>
          <p className="text-gray-400 text-sm">
            Newly registered testers will appear here automatically upon signup.
          </p>
        </div>
      )}

    </div>
  );
};

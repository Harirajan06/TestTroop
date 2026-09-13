import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, CheckCircle, AlertCircle, Camera, ShieldCheck } from 'lucide-react';

export const UserProfilePage: React.FC = () => {
  const { user, updateProfile } = useAuth();

  const [fullName, setFullName] = useState(user?.full_name || '');
  const [mobileNumber, setMobileNumber] = useState(user?.mobile_number || '');
  const [avatarUrl, setAvatarUrl] = useState(user?.avatar_url || '');

  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!fullName.trim()) {
      setError('Full name cannot be empty.');
      return;
    }

    setLoading(true);
    const res = await updateProfile({
      full_name: fullName.trim(),
      mobile_number: mobileNumber.trim(),
      avatar_url: avatarUrl.trim() || undefined,
    });
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      setSuccess(true);
      setTimeout(() => setSuccess(false), 4000);
    }
  };

  return (
    <div className="max-w-2xl mx-auto py-10 px-4 space-y-8">
      
      <div className="space-y-2 text-center">
        <h1 className="text-3xl font-bold text-white">Tester Profile</h1>
        <p className="text-gray-400 text-xs">Manage your contact information and public avatar</p>
      </div>

      <div className="bg-glass-card p-8 rounded-3xl border border-white/10 space-y-6">
        
        {/* AVATAR DISPLAY */}
        <div className="flex items-center gap-6 pb-6 border-b border-white/10">
          <img 
            src={avatarUrl || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=250&q=80'} 
            alt={fullName} 
            className="w-20 h-20 rounded-full object-cover ring-4 ring-indigo-500/50 shadow-xl"
          />
          <div>
            <h3 className="text-lg font-bold text-white">{user?.full_name}</h3>
            <p className="text-xs text-gray-400">{user?.email}</p>
            <span className="inline-block mt-2 px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-full uppercase">
              Role: {user?.role}
            </span>
          </div>
        </div>

        {error && (
          <div className="p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="p-3.5 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Profile successfully updated!</span>
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-5">
          
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                className="form-input pl-10"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address (Managed by Supabase Auth)</label>
            <div className="relative">
              <input 
                type="email" 
                disabled 
                value={user?.email || ''} 
                className="form-input pl-10 opacity-60 cursor-not-allowed bg-slate-900"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Mobile Phone Number (Private to Authorized Admins)</label>
            <div className="relative">
              <input 
                type="tel" 
                value={mobileNumber} 
                onChange={e => setMobileNumber(e.target.value)}
                className="form-input pl-10"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Profile Avatar Image URL</label>
            <div className="relative">
              <input 
                type="url" 
                placeholder="https://images.unsplash.com/..."
                value={avatarUrl} 
                onChange={e => setAvatarUrl(e.target.value)}
                className="form-input pl-10"
              />
              <Camera className="w-4 h-4 text-gray-400 absolute left-3.5 top-3.5" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary w-full py-3"
          >
            {loading ? 'Saving Changes...' : 'Update Profile Information'}
          </button>

        </form>

      </div>
    </div>
  );
};

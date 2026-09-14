import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight, ShieldAlert } from 'lucide-react';

export const AdminLoginPage: React.FC = () => {
  const { login, user } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Sanitization & Security Validation
    const cleanEmail = email.trim().toLowerCase();
    const cleanPassword = password.trim();

    if (!cleanEmail || !cleanPassword) {
      setError('Please enter both your admin email address and password.');
      return;
    }

    setLoading(true);
    const res = await login(cleanEmail, cleanPassword);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      navigate('/plasma', { replace: true });
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-12 px-4 bg-slate-950">
      <div className="w-full max-w-md bg-glass-card p-8 rounded-3xl border border-indigo-500/30 shadow-2xl relative">
        
        <div className="text-center space-y-2 mb-8">
          <div className="w-14 h-14 rounded-2xl bg-indigo-600/20 border border-indigo-500/40 text-amber-400 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-indigo-500/20">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">Admin Portal Login</h1>
          <p className="text-gray-400 text-xs">Secure staff access for The Test Troop Control Center</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2.5">
            <ShieldAlert className="w-5 h-5 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="form-group">
            <label className="form-label">Authorized Admin Email *</label>
            <div className="relative">
              <input 
                type="email" 
                required 
                placeholder="admin@thetesttroop.com"
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="form-input pl-10"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Admin Security Password *</label>
            <div className="relative">
              <input 
                type="password" 
                required 
                placeholder="••••••••••••"
                value={password} 
                onChange={e => setPassword(e.target.value)}
                className="form-input pl-10"
              />
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <button 
            type="submit" 
            disabled={loading} 
            className="btn btn-primary w-full py-3.5 mt-2 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating Admin Credentials...</span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Enter Admin Console</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

        </form>

        <div className="mt-6 text-center text-xs text-gray-500">
          <Link to="/" className="hover:text-gray-300 transition-colors">
            ← Return to Public Website
          </Link>
        </div>

      </div>
    </div>
  );
};

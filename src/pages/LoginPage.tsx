import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const cleanEmail = email.trim().toLowerCase();
    const res = await login(cleanEmail, password);
    setLoading(false);

    if (res.error) {
      setError(res.error);
    } else {
      // If user is Admin staff, redirect directly to Admin Console /admin
      if (cleanEmail === 'testtroopp@gmail.com') {
        navigate('/admin', { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative">
        
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Log In to The Test Troop</h1>
          <p className="text-gray-400 text-xs">Enter your registered email & password to access your dashboard</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="form-group">
            <label className="form-label">Registered Email *</label>
            <div className="relative">
              <input 
                type="email" 
                required 
                placeholder="you@example.com"
                value={email} 
                onChange={e => setEmail(e.target.value)}
                className="form-input pl-10"
              />
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="form-group">
            <div className="flex items-center justify-between">
              <label className="form-label">Password *</label>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Password reset link sent to your registered email."); }} className="text-[11px] text-indigo-400 hover:underline">
                Forgot Password?
              </a>
            </div>
            <div className="relative">
              <input 
                type="password" 
                required 
                placeholder="••••••••"
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
            className="btn btn-primary w-full py-3 mt-4 text-sm font-semibold flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Authenticating...</span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Sign In</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Don't have an account?{' '}
          <Link to="/signup" className="text-indigo-400 font-semibold hover:underline">
            Create One Free
          </Link>
        </div>

      </div>
    </div>
  );
};

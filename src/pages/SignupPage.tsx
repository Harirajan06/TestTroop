import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Mail, Lock, User, Phone, AlertCircle, CheckCircle2, ArrowRight, Send } from 'lucide-react';

export const SignupPage: React.FC = () => {
  const { signup } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isConfirmationSent, setIsConfirmationSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Client Form Validations & Sanitization
    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim().toLowerCase();
    const cleanMobile = mobileNumber.trim();
    const cleanPassword = password.trim();

    if (!cleanFullName) {
      setError('Please enter your full name.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      setError('Please provide a valid email address.');
      return;
    }

    const phoneRegex = /^[+]?[(]?[0-9]{1,4}[)]?[-\s./0-9]{7,15}$/;
    if (!phoneRegex.test(cleanMobile)) {
      setError('Please enter a valid mobile phone number (e.g. +1 555 019 2831).');
      return;
    }

    if (cleanPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    if (cleanPassword !== confirmPassword.trim()) {
      setError('Passwords do not match. Please re-enter your password.');
      return;
    }

    setLoading(true);
    const result = await signup(cleanFullName, cleanEmail, cleanMobile, cleanPassword);
    setLoading(false);

    if (result.error) {
      setError(result.error);
    } else if (result.requiresEmailConfirmation) {
      setIsConfirmationSent(true);
    }
  };

  // IF EMAIL CONFIRMATION LINK HAS BEEN DISPATCHED
  if (isConfirmationSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
        <div className="w-full max-w-lg bg-glass-card p-8 rounded-3xl border border-indigo-500/40 text-center space-y-6 shadow-2xl relative overflow-hidden">
          
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20 animate-bounce">
            <Mail className="w-8 h-8" />
          </div>

          <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest block">
            Verification Link Dispatched
          </span>

          <h2 className="text-2xl font-bold text-white">
            Please Confirm Your Email Address
          </h2>

          <p className="text-gray-300 text-sm leading-relaxed bg-slate-900/80 p-5 rounded-2xl border border-white/5">
            We have sent a verification confirmation link to <strong className="text-cyan-400 font-mono">{email}</strong>.
            <br /><br />
            Supabase email verification is enabled. Please open your email inbox, click the confirmation link to activate your account, and then log in.
          </p>

          <div className="pt-2 flex items-center justify-center gap-4">
            <Link to="/login" className="btn btn-primary w-full py-3 flex items-center justify-center gap-2">
              <span>Go to Login Page</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4">
      <div className="w-full max-w-md bg-glass-card p-8 rounded-3xl border border-white/10 shadow-2xl relative">
        
        <div className="text-center space-y-2 mb-8">
          <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center mx-auto mb-3 shadow-lg shadow-indigo-500/20">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h1 className="text-2xl font-bold text-white">Create Tester Account</h1>
          <p className="text-gray-400 text-xs">Join The Test Troop community & start earning rewards</p>
        </div>

        {error && (
          <div className="mb-6 p-3.5 bg-red-500/15 border border-red-500/30 rounded-xl text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          
          <div className="form-group">
            <label className="form-label">Full Name *</label>
            <div className="relative">
              <input 
                type="text" 
                required 
                placeholder="e.g. Devon Vance"
                value={fullName} 
                onChange={e => setFullName(e.target.value)}
                className="form-input pl-10"
              />
              <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address *</label>
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
            <label className="form-label">Mobile Phone Number *</label>
            <div className="relative">
              <input 
                type="tel" 
                required 
                placeholder="+1 (555) 019-2831"
                value={mobileNumber} 
                onChange={e => setMobileNumber(e.target.value)}
                className="form-input pl-10"
              />
              <Phone className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
            <span className="text-[11px] text-gray-500 mt-1">Stored securely. Never publicly exposed.</span>
          </div>

          <div className="form-group">
            <label className="form-label">Password *</label>
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

          <div className="form-group">
            <label className="form-label">Confirm Password *</label>
            <div className="relative">
              <input 
                type="password" 
                required 
                placeholder="••••••••"
                value={confirmPassword} 
                onChange={e => setConfirmPassword(e.target.value)}
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
              <span>Registering...</span>
            ) : (
              <span className="flex items-center gap-2">
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </span>
            )}
          </button>

        </form>

        <div className="mt-6 pt-6 border-t border-white/10 text-center text-xs text-gray-400">
          Already registered?{' '}
          <Link to="/login" className="text-indigo-400 font-semibold hover:underline">
            Log In Here
          </Link>
        </div>

      </div>
    </div>
  );
};

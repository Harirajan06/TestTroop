import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile } from '../types';
import { supabase, isSupabaseConfigured, dbStore } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Builds a UserProfile from a Supabase Auth user + its `profiles` row (or a
// safe fallback if the row hasn't been created yet by the DB trigger).
const buildProfile = async (authUser: { id: string; email?: string; user_metadata?: any }): Promise<UserProfile> => {
  const { data: profile } = await supabase!
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .single();

  if (profile) return profile as UserProfile;

  return {
    id: authUser.id,
    full_name: authUser.user_metadata?.full_name || 'Tester',
    email: authUser.email || '',
    mobile_number: authUser.user_metadata?.mobile_number || '',
    role: 'user',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setLoading(false);
      return;
    }

    let active = true;

    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!active) return;
      if (session?.user) {
        setUser(await buildProfile(session.user));
      }
      setLoading(false);
    });

    // Supabase's own client keeps the session valid across reloads/tabs —
    // this listener just mirrors that into our React state, no custom storage.
    const { data: subscription } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!active) return;
      if (session?.user) {
        setUser(await buildProfile(session.user));
      } else {
        setUser(null);
      }
    });

    return () => {
      active = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  const login = async (emailInput: string, passwordInput: string): Promise<{ error?: string }> => {
    if (!isSupabaseConfigured || !supabase) {
      return { error: 'Authentication is not configured for this environment.' };
    }

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.toLowerCase().includes('email not confirmed')) {
        return { error: 'Email confirmation required. Please check your inbox and click the verification link.' };
      }
      return { error: 'Invalid login credentials. Please verify your email address and password.' };
    }

    if (data.user) {
      setUser(await buildProfile(data.user));
    }
    return {};
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
  };

  const updateProfile = async (data: Partial<UserProfile>): Promise<{ error?: string }> => {
    if (!user) return { error: 'Not authenticated' };

    const updated = { ...user, ...data, updated_at: new Date().toISOString() };

    if (isSupabaseConfigured && supabase) {
      const { error } = await supabase
        .from('profiles')
        .update(data)
        .eq('id', user.id);

      if (error) return { error: error.message };
    }

    dbStore.saveUser(updated);
    setUser(updated);
    return {};
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      logout,
      updateProfile,
      isAdmin: user?.role === 'admin',
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};

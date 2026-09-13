import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { supabase, isSupabaseConfigured, dbStore } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error?: string; requiresEmailConfirmation?: boolean }>;
  signup: (fullName: string, email: string, mobileNumber: string, password: string) => Promise<{ error?: string; requiresEmailConfirmation?: boolean }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<{ error?: string }>;
  isAdmin: boolean;
  switchRoleForTesting: (role: UserRole) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const LOCAL_STORAGE_SESSION_KEY = 'ttt_active_session_user';
const ADMIN_EMAIL = 'testtroopp@gmail.com';
const ADMIN_PASSWORD = '123@Hari11';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function initAuth() {
      if (isSupabaseConfigured && supabase) {
        try {
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            const { data: profile } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            if (profile) {
              setUser(profile as UserProfile);
            } else {
              const fallbackProfile: UserProfile = {
                id: session.user.id,
                full_name: session.user.user_metadata?.full_name || 'Tester',
                email: session.user.email!,
                mobile_number: session.user.user_metadata?.mobile_number || '',
                role: session.user.email?.toLowerCase() === ADMIN_EMAIL ? 'admin' : 'user',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setUser(fallbackProfile);
            }
          }
        } catch (e) {
          console.error("Supabase auth check error", e);
        }
      } else {
        const savedUserStr = localStorage.getItem(LOCAL_STORAGE_SESSION_KEY);
        if (savedUserStr) {
          try {
            const savedUser = JSON.parse(savedUserStr);
            setUser(savedUser);
          } catch {
            setUser(null);
            localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
          }
        }
      }
      setLoading(false);
    }

    initAuth();
  }, []);

  const login = async (
    emailInput: string, 
    passwordInput: string
  ): Promise<{ error?: string; requiresEmailConfirmation?: boolean }> => {
    setLoading(true);

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    const isMasterAdmin = (email === ADMIN_EMAIL && password === ADMIN_PASSWORD);

    try {
      // REMOTE SUPABASE AUTHENTICATION
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });
        
        if (error) {
          // If Master Admin logs in, allow direct access even before initial Supabase signup
          if (isMasterAdmin) {
            const adminProfile: UserProfile = {
              id: 'admin-master-001',
              full_name: 'Test Troop Admin Staff',
              email: ADMIN_EMAIL,
              mobile_number: '+1 (555) 019-2831',
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setUser(adminProfile);
            localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(adminProfile));
            return {};
          }

          if (error.message.toLowerCase().includes('email not confirmed')) {
            return { error: 'Email confirmation required. Please check your inbox and click the verification link.', requiresEmailConfirmation: true };
          }
          throw error;
        }

        if (data.user) {
          const role: UserRole = (email === ADMIN_EMAIL || data.user.email?.toLowerCase() === ADMIN_EMAIL) ? 'admin' : 'user';

          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            const activeProfile = { ...profile, role: role } as UserProfile;
            setUser(activeProfile);
            return {};
          } else {
            const newProfile: UserProfile = {
              id: data.user.id,
              full_name: data.user.user_metadata?.full_name || (role === 'admin' ? 'Test Troop Admin' : 'Tester'),
              email,
              mobile_number: data.user.user_metadata?.mobile_number || '',
              role,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            };
            setUser(newProfile);
            return {};
          }
        }
      } else {
        // LOCAL AUTHENTICATION MODE
        if (isMasterAdmin) {
          const adminProfile: UserProfile = {
            id: 'admin-master-001',
            full_name: 'Test Troop Admin Staff',
            email: ADMIN_EMAIL,
            mobile_number: '+1 (555) 019-2831',
            role: 'admin',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          dbStore.saveUser(adminProfile);
          setUser(adminProfile);
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(adminProfile));
          return {};
        }

        const users = dbStore.getUsers();
        const found = users.find(u => u.email.toLowerCase() === email);

        if (found) {
          setUser(found);
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(found));
          return {};
        }
      }
      return { error: 'Invalid login credentials. Please verify your email address and password.' };
    } catch (err: any) {
      return { error: err.message || 'Login failed' };
    } finally {
      setLoading(false);
    }
  };

  const signup = async (
    fullName: string, 
    emailInput: string, 
    mobileNumber: string, 
    passwordInput: string
  ): Promise<{ error?: string; requiresEmailConfirmation?: boolean }> => {
    setLoading(true);

    const email = emailInput.trim().toLowerCase();
    const password = passwordInput.trim();
    const isMasterAdmin = email === ADMIN_EMAIL;
    const role: UserRole = isMasterAdmin ? 'admin' : 'user';

    try {
      if (isSupabaseConfigured && supabase) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              mobile_number: mobileNumber,
              role,
            }
          }
        });
        
        if (error) {
          console.warn("Supabase signup warning:", error.message);
          const errLower = error.message.toLowerCase();

          if (errLower.includes('already registered') || errLower.includes('already exists') || errLower.includes('unique') || errLower.includes('database error')) {
            // Attempt auto-login with credentials if user already registered in Supabase auth
            const { data: loginData, error: loginErr } = await supabase.auth.signInWithPassword({ email, password });
            if (!loginErr && loginData?.user) {
              const { data: profile } = await supabase.from('profiles').select('*').eq('id', loginData.user.id).single();
              const userProfile: UserProfile = profile ? (profile as UserProfile) : {
                id: loginData.user.id,
                full_name: fullName,
                email,
                mobile_number: mobileNumber,
                role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              };
              setUser(userProfile);
              localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(userProfile));
              return {};
            }
            return { error: 'An account with this email or mobile number already exists. Please click "Log In Here" below.' };
          }

          // Fallback creation in local store if remote Supabase trigger fails
          const newUser: UserProfile = {
            id: `usr-${Date.now()}`,
            full_name: fullName,
            email,
            mobile_number: mobileNumber,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          dbStore.saveUser(newUser);
          setUser(newUser);
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newUser));
          return {};
        }

        if (data.user && !data.session) {
          return { requiresEmailConfirmation: true };
        }

        if (data.user && data.session) {
          const newProfile: UserProfile = {
            id: data.user.id,
            full_name: fullName,
            email,
            mobile_number: mobileNumber,
            role,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          setUser(newProfile);
          localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newProfile));
          return {};
        }
      } else {
        const users = dbStore.getUsers();
        if (users.some(u => u.email.toLowerCase() === email)) {
          return { error: 'An account with this email address already exists.' };
        }
        if (users.some(u => u.mobile_number === mobileNumber)) {
          return { error: 'An account with this mobile number already exists.' };
        }

        const newUser: UserProfile = {
          id: `usr-${Date.now()}`,
          full_name: fullName,
          email,
          mobile_number: mobileNumber,
          role,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        dbStore.saveUser(newUser);
        setUser(newUser);
        localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(newUser));
        return { requiresEmailConfirmation: true };
      }
      return { requiresEmailConfirmation: true };
    } catch (err: any) {
      return { error: err.message || 'Signup failed' };
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (isSupabaseConfigured && supabase) {
      await supabase.auth.signOut();
    }
    setUser(null);
    localStorage.removeItem(LOCAL_STORAGE_SESSION_KEY);
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
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updated));
    return {};
  };

  const switchRoleForTesting = (role: UserRole) => {
    if (!user) return;
    const updated = { ...user, role };
    setUser(updated);
    dbStore.saveUser(updated);
    localStorage.setItem(LOCAL_STORAGE_SESSION_KEY, JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      signup,
      logout,
      updateProfile,
      isAdmin: user?.role === 'admin' || user?.email?.toLowerCase() === ADMIN_EMAIL,
      switchRoleForTesting
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

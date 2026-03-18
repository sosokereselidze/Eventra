import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { fetchApi, setToken, getToken } from '@/lib/api';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
  name: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: { user: AuthUser } | null;
  isLoading: boolean;
  isAdmin: boolean;
  isSuperAdmin: boolean;
  signIn: (identifier: string, password: string) => Promise<{ error: Error | null }>;
  googleSignIn: (token: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, username: string, password: string, name: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<{ user: AuthUser } | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const isSuperAdmin = user?.username === (import.meta.env.VITE_ADMIN_USERNAME || 'admin');

  const checkAdminRole = async () => {
    try {
      await fetchApi<{ ok: boolean }>('/api/auth/verify-admin');
      setIsAdmin(true);
    } catch {
      setIsAdmin(false);
    }
  };

  const loadSession = async () => {
    try {
      // We still use getToken() as a hint, but we try anyway if it's missing 
      // because we might have an HttpOnly cookie.
      const { user: u } = await fetchApi<{ user: AuthUser }>('/api/auth/me');
      setUser(u);
      setSession(u ? { user: u } : null);
      if (u) {
        await checkAdminRole();
        // Ensure local token sync if available in response (some backends return it)
      } else {
        setIsAdmin(false);
      }
    } catch {
      // If unauthorized, just clear local state
      setToken(null);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadSession();
  }, []);

  const signIn = async (identifier: string, password: string) => {
    try {
      const { user: u, token } = await fetchApi<{ user: AuthUser; token: string }>(
        '/api/auth/login',
        { method: 'POST', body: JSON.stringify({ identifier, password }), skipAuth: true }
      );
      setToken(token);
      setUser(u);
      setSession(u ? { user: u } : null);
      if (u) await checkAdminRole();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Sign in failed') };
    }
  };

  const googleSignIn = async (googleToken: string) => {
    try {
      const { user: u, token } = await fetchApi<{ user: AuthUser; token: string }>(
        '/api/auth/google',
        { method: 'POST', body: JSON.stringify({ token: googleToken }), skipAuth: true }
      );
      setToken(token);
      setUser(u);
      setSession(u ? { user: u } : null);
      if (u) await checkAdminRole();
      return { error: null };
    } catch (e) {
      return { error: e instanceof Error ? e : new Error('Google sign in failed') };
    }
  };

  const signUp = async (email: string, username: string, password: string, name: string) => {
    try {
      const { user: u, token } = await fetchApi<{ user: AuthUser; token: string }>(
        '/api/auth/signup',
        {
          method: 'POST',
          body: JSON.stringify({ email, username, password, name }),
          skipAuth: true,
        }
      );
      setToken(token);
      setUser(u);
      setSession(u ? { user: u } : null);
      if (u) await checkAdminRole();
      return { error: null };
    } catch (e) {
      const err = e instanceof Error ? e : new Error('Sign up failed');
      return { error: err };
    }
  };

  const signOut = async () => {
    try {
      await fetchApi('/api/auth/logout', { method: 'POST' });
    } catch (e) {
      console.error('Logout error:', e);
    } finally {
      setToken(null);
      setUser(null);
      setSession(null);
      setIsAdmin(false);
    }
  };

  return (
    <AuthContext.Provider value={{ user, session, isLoading, isAdmin, isSuperAdmin, signIn, googleSignIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

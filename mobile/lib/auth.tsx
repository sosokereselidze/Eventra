import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
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
    isLoading: boolean;
    isAdmin: boolean;
    signIn: (identifier: string, password: string) => Promise<{ error: Error | null }>;
    signUp: (email: string, username: string, password: string, name: string) => Promise<{ error: Error | null }>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isAdmin, setIsAdmin] = useState(false);

    const checkAdminRole = async () => {
        try {
            await fetchApi<{ ok: boolean }>('/api/auth/verify-admin');
            setIsAdmin(true);
        } catch {
            setIsAdmin(false);
        }
    };

    const loadSession = async () => {
        const token = await getToken();
        if (!token) {
            setUser(null);
            setIsAdmin(false);
            setIsLoading(false);
            return;
        }
        try {
            const { user: u } = await fetchApi<{ user: AuthUser }>('/api/auth/me');
            setUser(u);
            if (u) await checkAdminRole();
            else setIsAdmin(false);
        } catch {
            await setToken(null);
            setUser(null);
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
            await setToken(token);
            setUser(u);
            if (u) await checkAdminRole();
            return { error: null };
        } catch (e) {
            return { error: e instanceof Error ? e : new Error('Sign in failed') };
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
            await setToken(token);
            setUser(u);
            if (u) await checkAdminRole();
            return { error: null };
        } catch (e) {
            const err = e instanceof Error ? e : new Error('Sign up failed');
            return { error: err };
        }
    };

    const signOut = async () => {
        await setToken(null);
        setUser(null);
        setIsAdmin(false);
    };

    return (
        <AuthContext.Provider value={{ user, isLoading, isAdmin, signIn, signUp, signOut }}>
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

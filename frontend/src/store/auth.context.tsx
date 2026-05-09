'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import api from '@/lib/api';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const storedToken = localStorage.getItem('mess_token');
    const storedUser = localStorage.getItem('mess_user');
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setIsLoading(false);
  }, []);

  const login = async (email: string, password: string) => {
    const { data } = await api.post('/auth/login', { email, password });
    const { user: u, token: t } = data.data;

    // Persist in localStorage for client-side use
    localStorage.setItem('mess_token', t);
    localStorage.setItem('mess_user', JSON.stringify(u));

    // Set cookie for middleware (SSR) use
    document.cookie = `mess_token=${t}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;

    setToken(t);
    setUser(u);
    router.push('/dashboard');
  };

  const signup = async (name: string, email: string, password: string) => {
    const { data } = await api.post('/auth/signup', { name, email, password });
    const { user: u, token: t } = data.data;

    localStorage.setItem('mess_token', t);
    localStorage.setItem('mess_user', JSON.stringify(u));
    document.cookie = `mess_token=${t}; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;

    setToken(t);
    setUser(u);
    router.push('/dashboard');
  };

  const logout = () => {
    localStorage.removeItem('mess_token');
    localStorage.removeItem('mess_user');
    document.cookie = 'mess_token=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT';
    
    setToken(null);
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}

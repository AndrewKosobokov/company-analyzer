'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    name: string;
    email: string;
    organization: string;
  } | null;
  loading: boolean;
  hydrated: boolean;
  login: (token: string, userData: any) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [token, setToken] = useState<string | null>(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('authToken');
    }
    return null;
  });
  const [loading, setLoading] = useState(true);
  const [hydrated, setHydrated] = useState(false);
  const [user, setUser] = useState<{
    name: string;
    email: string;
    organization: string;
  } | null>(null);

  // Check localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');
    
    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
      setIsAuthenticated(true);
    }
    setLoading(false);
    setHydrated(true);
  }, []);

  const login = (token: string, userData: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
  };

const logout = () => {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    
    // Редирект на страницу логина
    window.location.href = '/login';
  }
  setToken(null);
  setUser(null);
  setIsAuthenticated(false);
};

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, loading, hydrated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};














'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface AuthContextType {
  isAuthenticated: boolean;
  token: string | null;
  user: {
    name: string;
    email: string;
    organization: string;
    role?: string;
  } | null;
  isAdmin: boolean;
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
    role?: string;
  } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  // Check localStorage on mount
  useEffect(() => {
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('userData');
    
    if (storedToken && storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(userData);
        setIsAuthenticated(true);
        
        // Check admin status
        checkAdminStatus(storedToken, userData);
      } catch (e) {
        console.error('Error parsing stored user data:', e);
      }
    }
    setLoading(false);
    setHydrated(true);
  }, []);

  const checkAdminStatus = async (token: string, userData: any) => {
    // Проверка по userId (временное решение)
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      if (payload.userId === '6c499a0a-cddf-4bf2-8ac5-8a98d90bac4a') {
        setIsAdmin(true);
        return;
      }
    } catch (e) {
      console.error('Token parse error:', e);
    }

    // Проверка по роли в userData
    if (userData?.role === 'admin') {
      setIsAdmin(true);
      return;
    }

    // Проверка через API
    try {
      const response = await fetch('/api/auth/status', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setIsAdmin(data.user?.role === 'admin' || data.role === 'admin');
      }
    } catch (error) {
      console.error('Error checking admin status:', error);
    }
  };

  const login = (token: string, userData: any) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_token', token);
      localStorage.setItem('authToken', token);
      localStorage.setItem('userData', JSON.stringify(userData));
    }
    setToken(token);
    setUser(userData);
    setIsAuthenticated(true);
    
    // Check admin status after login
    checkAdminStatus(token, userData);
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
    setIsAdmin(false);
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, token, user, isAdmin, loading, hydrated, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};














import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../services/api';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isStudent: boolean;
  login: (credentials: { identifier: string; password: string }) => Promise<void>;
  adminLogin: (credentials: { email: string; password: string }) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem('nmit_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('nmit_token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = localStorage.getItem('nmit_token');
      if (storedToken) {
        try {
          const freshUser = await authApi.getMe();
          setUser(freshUser);
          localStorage.setItem('nmit_user', JSON.stringify(freshUser));
        } catch (err) {
          console.warn('[AUTH_INIT] Session expired or invalid');
          localStorage.removeItem('nmit_token');
          localStorage.removeItem('nmit_user');
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: { identifier: string; password: string }) => {
    const data = await authApi.studentLogin(credentials);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nmit_token', data.token);
    localStorage.setItem('nmit_user', JSON.stringify(data.user));
  };

  const adminLogin = async (credentials: { email: string; password: string }) => {
    const data = await authApi.adminLogin(credentials);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nmit_token', data.token);
    localStorage.setItem('nmit_user', JSON.stringify(data.user));
  };

  const signup = async (formData: any) => {
    const data = await authApi.signup(formData);
    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('nmit_token', data.token);
    localStorage.setItem('nmit_user', JSON.stringify(data.user));
  };

  const logout = () => {
    localStorage.removeItem('nmit_token');
    localStorage.removeItem('nmit_user');
    setToken(null);
    setUser(null);
    window.location.href = '/';
  };

  const refreshUser = async () => {
    if (!token) return;
    try {
      const fresh = await authApi.getMe();
      setUser(fresh);
      localStorage.setItem('nmit_user', JSON.stringify(fresh));
    } catch (e) {
      console.error('Failed to refresh user:', e);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        isAdmin: user?.role === 'ADMIN',
        isStudent: user?.role === 'STUDENT',
        login,
        adminLogin,
        signup,
        logout,
        refreshUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

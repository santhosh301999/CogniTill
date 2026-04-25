import React, { createContext, useContext, useState, useEffect } from 'react';
import client from '../api/client';

interface User {
  id: number;
  username: string;
  role: 'admin' | 'manager' | 'employee';
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedToken = localStorage.getItem('cognitill_token');
    const savedUser = localStorage.getItem('cognitill_user');
    if (savedToken && savedUser) {
      try {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('cognitill_token');
        localStorage.removeItem('cognitill_user');
      }
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const response = await client.post('/auth/login', { username, password });
    const { token: newToken, user: newUser } = response.data;
    setToken(newToken);
    setUser(newUser);
    localStorage.setItem('cognitill_token', newToken);
    localStorage.setItem('cognitill_user', JSON.stringify(newUser));
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cognitill_token');
    localStorage.removeItem('cognitill_user');
  };

  return (
    <AuthContext.Provider value={{
      user, token,
      login, logout,
      isAuthenticated: !!user,
      loading,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};

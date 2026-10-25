import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { apiClient } from '../api/client';
import type { User } from '../api/types';

const TOKEN_KEY = 'token';

type AuthContextValue = {
  user: User | null;
  isAdmin: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  logout: () => void;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadCurrentUser = async () => {
    const currentUser = await apiClient<User>('/auth/me');
    setUser(currentUser);
  };

  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) {
      setLoading(false);
      return;
    }
    loadCurrentUser()
      .catch(() => {
        localStorage.removeItem(TOKEN_KEY);
        setUser(null);
      })
      .finally(() => setLoading(false));
  }, []);

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  };

  const login = async (email: string, password: string) => {
    const { accessToken } = await apiClient<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem(TOKEN_KEY, accessToken);
    try {
      await loadCurrentUser();
    } catch (error) {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);
      throw error;
    }
  };

  const register = async (email: string, password: string) => {
    await apiClient<User>('/auth/register', { method: 'POST', body: { email, password } });
    await login(email, password);
  };

  const value = useMemo<AuthContextValue>(() => ({
    user,
    isAdmin: user?.role === 'ADMIN',
    loading,
    login,
    register,
    logout,
  }), [user, loading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider.');
  return context;
}

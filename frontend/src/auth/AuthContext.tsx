import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { apiClient, resetSessionExpiryNotification, setSessionExpiryHandler } from '../api/client';
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
  const navigate = useNavigate();
  const location = useLocation();

  const loadCurrentUser = async () => {
    const currentUser = await apiClient<User>('/auth/me');
    setUser(currentUser);
  };

  useEffect(() => {
    setSessionExpiryHandler(() => {
      localStorage.removeItem(TOKEN_KEY);
      setUser(null);

      // Don't show the session-expired toast or redirect on auth pages
      if (location.pathname === '/login' || location.pathname === '/register') return;

      toast.error('Session expired, please log in again');
      navigate(
        `/login?redirect=${encodeURIComponent(`${location.pathname}${location.search}`)}`,
        { replace: true }
      );
    });

    return () => setSessionExpiryHandler(undefined);
  }, [location.pathname, location.search, navigate]);


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
    resetSessionExpiryNotification();
  };

  const login = async (email: string, password: string) => {
    const { accessToken } = await apiClient<{ accessToken: string }>('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    localStorage.setItem(TOKEN_KEY, accessToken);
    resetSessionExpiryNotification();
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

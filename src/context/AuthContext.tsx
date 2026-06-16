import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { fetchUser } from '../api/usersApi';

function getUserIdFromToken(token: string): string | null {
  try {
    // JWT uses base64url — replace chars before decoding
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(base64)) as Record<string, unknown>;
    return typeof payload.sub === 'string' ? payload.sub : null;
  } catch {
    return null;
  }
}

interface AuthContextValue {
  token: string | null;
  user: User | null;
  userLoading: boolean;
  setToken: (token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setTokenState] = useState<string | null>(() =>
    localStorage.getItem('access_token'),
  );
  const [user, setUser] = useState<User | null>(null);
  // Start as true only if there's already a token stored (need to load user on boot)
  const [userLoading, setUserLoading] = useState(() => !!localStorage.getItem('access_token'));

  useEffect(() => {
    if (!token) {
      setUser(null);
      setUserLoading(false);
      return;
    }

    const userId = getUserIdFromToken(token);
    if (!userId) {
      localStorage.removeItem('access_token');
      setTokenState(null);
      setUserLoading(false);
      return;
    }

    setUserLoading(true);
    fetchUser(userId)
      .then((u) => setUser(u))
      .catch(() => {
        localStorage.removeItem('access_token');
        setTokenState(null);
        setUser(null);
      })
      .finally(() => setUserLoading(false));
  }, [token]);

  const setToken = useCallback((newToken: string) => {
    localStorage.setItem('access_token', newToken);
    setTokenState(newToken);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    setTokenState(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({ token, user, userLoading, setToken, logout }),
    [token, user, userLoading, setToken, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider');
  return ctx;
}

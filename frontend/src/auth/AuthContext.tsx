import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, setUnauthorizedHandler } from "../api/client";
import type { User } from "../api/types";

type AuthStatus = "loading" | "anonymous" | "authenticated";

interface AuthContextValue {
  status: AuthStatus;
  token: string | null;
  user: User | null;
  error: string | null;
  login(email: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState<string | null>(null);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setError(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => setUnauthorizedHandler(logout), [logout]);

  useEffect(() => {
    setStatus("anonymous");
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const tokenResponse = await api.login(email, password);
    const currentUser = await api.getCurrentUser(tokenResponse.access_token);
    setToken(tokenResponse.access_token);
    setUser(currentUser);
    setStatus("authenticated");
  }, []);

  const value = useMemo(
    () => ({ status, token, user, error, login, logout }),
    [status, token, user, error, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("useAuth debe utilizarse dentro de AuthProvider.");
  }

  return context;
}

export function useOptionalAuth() {
  return useContext(AuthContext);
}

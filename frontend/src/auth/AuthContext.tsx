import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { api, isRequestCancelled, setUnauthorizedHandler } from "../api/client";
import type { User } from "../api/types";

const TOKEN_STORAGE_KEY = "crypto_tracker_access_token";

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
    sessionStorage.removeItem(TOKEN_STORAGE_KEY);
    setToken(null);
    setUser(null);
    setError(null);
    setStatus("anonymous");
  }, []);

  useEffect(() => setUnauthorizedHandler(logout), [logout]);

  useEffect(() => {
    const storedToken = sessionStorage.getItem(TOKEN_STORAGE_KEY);

    if (!storedToken) {
      setStatus("anonymous");
      return;
    }

    setToken(storedToken);
    const controller = new AbortController();

    api
      .getCurrentUser(storedToken, { signal: controller.signal })
      .then((currentUser) => {
        setUser(currentUser);
        setStatus("authenticated");
      })
      .catch((caughtError) => {
        if (!isRequestCancelled(caughtError)) {
          logout();
        }
      });

    return () => controller.abort();
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    setError(null);
    const tokenResponse = await api.login(email, password);
    sessionStorage.setItem(TOKEN_STORAGE_KEY, tokenResponse.access_token);
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

import { jsx as _jsx } from "react/jsx-runtime";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, isRequestCancelled, setUnauthorizedHandler } from "../api/client";
const TOKEN_STORAGE_KEY = "crypto_tracker_access_token";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
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
  const login = useCallback(async (email, password) => {
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
  return _jsx(AuthContext.Provider, { value: value, children: children });
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

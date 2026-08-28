import { jsx as _jsx } from "react/jsx-runtime";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { api, setUnauthorizedHandler } from "../api/client";
const AuthContext = createContext(undefined);
export function AuthProvider({ children }) {
  const [status, setStatus] = useState("loading");
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [error, setError] = useState(null);
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
  const login = useCallback(async (email, password) => {
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

import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
export default function ProtectedRoute() {
  const { status } = useAuth();
  return status === "authenticated"
    ? _jsx(Outlet, {})
    : _jsx(Navigate, {
        replace: true,
        state: { from: window.location.pathname },
        to: "/login",
      });
}

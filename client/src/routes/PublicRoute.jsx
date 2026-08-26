import { jsx as _jsx } from "react/jsx-runtime";
import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
export default function PublicRoute() {
  const { status } = useAuth();
  return status === "authenticated"
    ? _jsx(Navigate, { replace: true, to: "/dashboard" })
    : _jsx(Outlet, {});
}

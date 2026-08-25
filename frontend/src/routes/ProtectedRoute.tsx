import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function ProtectedRoute() {
  const { status } = useAuth();

  return status === "authenticated" ? (
    <Outlet />
  ) : (
    <Navigate replace state={{ from: window.location.pathname }} to="/login" />
  );
}

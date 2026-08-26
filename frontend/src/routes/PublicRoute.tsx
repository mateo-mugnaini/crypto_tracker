import { Navigate, Outlet } from "react-router-dom";

import { useAuth } from "../auth/AuthContext";

export default function PublicRoute() {
  const { status } = useAuth();

  return status === "authenticated" ? <Navigate replace to="/dashboard" /> : <Outlet />;
}

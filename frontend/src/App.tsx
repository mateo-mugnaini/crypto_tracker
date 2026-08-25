import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import styles from "./App.module.css";
import { FavoritesProvider } from "./features/favorites/FavoritesContext";
import { MarketProvider } from "./features/market/MarketContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

function AppContent() {
  const { status } = useAuth();

  if (status === "loading") {
    return <main className={styles.centeredState}>Verificando sesión…</main>;
  }

  const fallbackPath = status === "authenticated" ? "/dashboard" : "/login";

  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
      </Route>

      <Route element={<ProtectedRoute />}>
        <Route path="/dashboard" element={<DashboardPage />} />
      </Route>

      <Route path="/" element={<Navigate replace to={fallbackPath} />} />
      <Route path="*" element={<Navigate replace to={fallbackPath} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <FavoritesProvider>
        <MarketProvider>
          <AppContent />
        </MarketProvider>
      </FavoritesProvider>
    </AuthProvider>
  );
}

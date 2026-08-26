import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ToastProvider } from "./components/ui/ToastProvider";
import styles from "./App.module.css";
import { FavoritesProvider } from "./features/favorites/FavoritesContext";
import { MarketProvider } from "./features/market/MarketContext";
import { PortfolioProvider } from "./features/portfolio/PortfolioContext";
import { AlertsProvider } from "./features/alerts/AlertsContext";
import LoginPage from "./pages/auth/LoginPage";
import RegisterPage from "./pages/auth/RegisterPage";
import DashboardPage from "./pages/dashboard/DashboardPage";
import ComparePage from "./pages/compare/ComparePage";
import FavoritesPage from "./pages/favorites/FavoritesPage";
import HistoryPage from "./pages/history/HistoryPage";
import CoinDetailPage from "./pages/market/CoinDetailPage";
import MarketPage from "./pages/market/MarketPage";
import PortfolioPage from "./pages/portfolio/PortfolioPage";
import AlertsPage from "./pages/alerts/AlertsPage";
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
        <Route path="/market" element={<MarketPage />} />
        <Route path="/market/:coinId" element={<CoinDetailPage />} />
        <Route path="/portfolio" element={<PortfolioPage />} />
        <Route path="/favorites" element={<FavoritesPage />} />
        <Route path="/history" element={<HistoryPage />} />
        <Route path="/compare" element={<ComparePage />} />
        <Route path="/alerts" element={<AlertsPage />} />
      </Route>

      <Route path="/" element={<Navigate replace to={fallbackPath} />} />
      <Route path="*" element={<Navigate replace to={fallbackPath} />} />
    </Routes>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <FavoritesProvider>
          <MarketProvider>
            <PortfolioProvider>
              <AlertsProvider>
                <AppContent />
              </AlertsProvider>
            </PortfolioProvider>
          </MarketProvider>
        </FavoritesProvider>
      </ToastProvider>
    </AuthProvider>
  );
}

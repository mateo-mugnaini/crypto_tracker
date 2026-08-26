import { lazy, Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import OfflineNotice from "./components/ui/OfflineNotice";
import { ToastProvider } from "./components/ui/ToastProvider";
import styles from "./App.module.css";
import { FavoritesProvider } from "./features/favorites/FavoritesContext";
import { MarketProvider } from "./features/market/MarketContext";
import { PortfolioProvider } from "./features/portfolio/PortfolioContext";
import { AlertsProvider } from "./features/alerts/AlertsContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";

const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const DashboardPage = lazy(() => import("./pages/dashboard/DashboardPage"));
const ComparePage = lazy(() => import("./pages/compare/ComparePage"));
const FavoritesPage = lazy(() => import("./pages/favorites/FavoritesPage"));
const HistoryPage = lazy(() => import("./pages/history/HistoryPage"));
const CoinDetailPage = lazy(() => import("./pages/market/CoinDetailPage"));
const MarketPage = lazy(() => import("./pages/market/MarketPage"));
const PortfolioPage = lazy(() => import("./pages/portfolio/PortfolioPage"));
const AlertsPage = lazy(() => import("./pages/alerts/AlertsPage"));

function AppContent() {
  const { status } = useAuth();

  if (status === "loading") {
    return <main className={styles.centeredState}>Verificando sesión…</main>;
  }

  const fallbackPath = status === "authenticated" ? "/dashboard" : "/login";

  return (
    <Suspense fallback={<main className={styles.centeredState}>Cargando vista…</main>}>
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
    </Suspense>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <OfflineNotice />
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
    </ErrorBoundary>
  );
}

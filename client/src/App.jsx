import { Suspense } from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import OfflineNotice from "./components/ui/OfflineNotice";
import { ToastProvider } from "./components/ui/ToastProvider";
import { AlertsProvider } from "./features/alerts/AlertsContext";
import { FavoritesProvider } from "./features/favorites/FavoritesContext";
import { MarketProvider } from "./features/market/MarketContext";
import { PortfolioProvider } from "./features/portfolio/PortfolioContext";
import ProtectedRoute from "./routes/ProtectedRoute";
import PublicRoute from "./routes/PublicRoute";
import PulseCoinDetail from "./pulse/PulseCoinDetail";
import PulseHome from "./pulse/PulseHome";
import { PulseLoginPage, PulseRegisterPage } from "./pulse/PulseAuth";
import PulseMarket from "./pulse/PulseMarket";
import PulsePortfolio from "./pulse/PulsePortfolio";
import {
  PulseAlertsPage,
  PulseComparePage,
  PulseFavoritesPage,
  PulseHistoryPage,
  PulseToolsPage,
} from "./pulse/PulseTools";
import styles from "./App.module.css";
import { useI18n } from "./i18n/I18nContext";

function AppContent() {
  const { status } = useAuth();
  const { t } = useI18n();
  if (status === "loading") {
    return <main className={styles.centeredState}>{t("checking_session")}</main>;
  }
  const fallbackPath = status === "authenticated" ? "/dashboard" : "/login";
  return (
    <Suspense
      fallback={<main className={styles.centeredState}>{t("loading_view")}</main>}
    >
      <Routes>
        <Route element={<PublicRoute />}>
          <Route element={<PulseLoginPage />} path="/login" />
          <Route element={<PulseRegisterPage />} path="/register" />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route element={<PulseHome />} path="/dashboard" />
          <Route element={<PulseMarket />} path="/market" />
          <Route element={<PulseCoinDetail />} path="/market/:coinId" />
          <Route element={<PulsePortfolio />} path="/portfolio" />
          <Route element={<PulseToolsPage />} path="/tools" />
          <Route element={<PulseFavoritesPage />} path="/favorites" />
          <Route element={<PulseHistoryPage />} path="/history" />
          <Route element={<PulseComparePage />} path="/compare" />
          <Route element={<PulseAlertsPage />} path="/alerts" />
        </Route>
        <Route element={<Navigate replace to={fallbackPath} />} path="/" />
        <Route element={<Navigate replace to={fallbackPath} />} path="*" />
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

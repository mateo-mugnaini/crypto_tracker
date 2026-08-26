import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
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
    return _jsx("main", {
      className: styles.centeredState,
      children: "Verificando sesi\u00F3n\u2026",
    });
  }
  const fallbackPath = status === "authenticated" ? "/dashboard" : "/login";
  return _jsx(Suspense, {
    fallback: _jsx("main", {
      className: styles.centeredState,
      children: "Cargando vista\u2026",
    }),
    children: _jsxs(Routes, {
      children: [
        _jsxs(Route, {
          element: _jsx(PublicRoute, {}),
          children: [
            _jsx(Route, { path: "/login", element: _jsx(LoginPage, {}) }),
            _jsx(Route, { path: "/register", element: _jsx(RegisterPage, {}) }),
          ],
        }),
        _jsxs(Route, {
          element: _jsx(ProtectedRoute, {}),
          children: [
            _jsx(Route, { path: "/dashboard", element: _jsx(DashboardPage, {}) }),
            _jsx(Route, { path: "/market", element: _jsx(MarketPage, {}) }),
            _jsx(Route, { path: "/market/:coinId", element: _jsx(CoinDetailPage, {}) }),
            _jsx(Route, { path: "/portfolio", element: _jsx(PortfolioPage, {}) }),
            _jsx(Route, { path: "/favorites", element: _jsx(FavoritesPage, {}) }),
            _jsx(Route, { path: "/history", element: _jsx(HistoryPage, {}) }),
            _jsx(Route, { path: "/compare", element: _jsx(ComparePage, {}) }),
            _jsx(Route, { path: "/alerts", element: _jsx(AlertsPage, {}) }),
          ],
        }),
        _jsx(Route, {
          path: "/",
          element: _jsx(Navigate, { replace: true, to: fallbackPath }),
        }),
        _jsx(Route, {
          path: "*",
          element: _jsx(Navigate, { replace: true, to: fallbackPath }),
        }),
      ],
    }),
  });
}
export default function App() {
  return _jsxs(ErrorBoundary, {
    children: [
      _jsx(OfflineNotice, {}),
      _jsx(AuthProvider, {
        children: _jsx(ToastProvider, {
          children: _jsx(FavoritesProvider, {
            children: _jsx(MarketProvider, {
              children: _jsx(PortfolioProvider, {
                children: _jsx(AlertsProvider, { children: _jsx(AppContent, {}) }),
              }),
            }),
          }),
        }),
      }),
    ],
  });
}

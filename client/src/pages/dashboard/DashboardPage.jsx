import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useMarket } from "../../features/market/MarketContext";
import CoinsPanel from "../../components/dashboard/CoinsPanel";
import FavoritesPanel from "../../components/dashboard/FavoritesPanel";
import PortfolioPanel from "../../components/dashboard/PortfolioPanel";
import PriceComparisonPanel from "../../components/dashboard/PriceComparisonPanel";
import PriceHistoryPanel from "../../components/dashboard/PriceHistoryPanel";
import DashboardLayout from "./DashboardLayout";
import styles from "./DashboardPage.module.css";
export default function DashboardPage() {
  const { coins } = useMarket();
  const pricedCoins = coins.filter((coin) => coin.current_price !== null).length;
  return _jsxs(DashboardLayout, {
    description:
      "Una vista clara para seguir precios, detectar tendencias y entender qu\u00E9 est\u00E1 pasando con tus activos.",
    eyebrow: "Overview / Market intelligence",
    title: "Tu mercado, con contexto.",
    children: [
      _jsxs("section", {
        "aria-label": "Resumen del mercado",
        className: styles.overviewGrid,
        children: [
          _jsxs("article", {
            className: `${styles.summaryCard} ${styles.summaryHighlight}`,
            children: [
              _jsx("span", {
                className: styles.summaryLabel,
                children: "Activos rastreados",
              }),
              _jsx("strong", { children: coins.length }),
              _jsx("small", { children: "Monedas sincronizadas localmente" }),
            ],
          }),
          _jsxs("article", {
            className: styles.summaryCard,
            children: [
              _jsx("span", {
                className: styles.summaryLabel,
                children: "Precios disponibles",
              }),
              _jsxs("strong", {
                children: [
                  pricedCoins,
                  _jsxs("small", { children: [" / ", coins.length || "—"] }),
                ],
              }),
              _jsx("small", { children: "\u00DAltimo snapshot persistido" }),
            ],
          }),
          _jsxs("article", {
            className: styles.summaryCard,
            children: [
              _jsx("span", {
                className: styles.summaryLabel,
                children: "Se\u00F1al de mercado",
              }),
              _jsx("strong", { className: styles.positiveValue, children: "\u25CF" }),
              _jsx("small", { children: "Datos preparados para an\u00E1lisis" }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: styles.dashboardGrid,
        children: [
          _jsx(PortfolioPanel, {}),
          _jsx(CoinsPanel, {}),
          _jsx(FavoritesPanel, {}),
          _jsx(PriceHistoryPanel, {}),
          _jsx(PriceComparisonPanel, {}),
        ],
      }),
    ],
  });
}

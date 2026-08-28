import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ApiError, api, isRequestCancelled } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import { useFavorites } from "../../features/favorites/FavoritesContext";
import { useMarket } from "../../features/market/MarketContext";
import Alert from "../../components/ui/Alert";
import Badge from "../../components/ui/Badge";
import Button from "../../components/ui/Button";
import EmptyState from "../../components/ui/EmptyState";
import Skeleton from "../../components/ui/Skeleton";
import { useToast } from "../../components/ui/ToastProvider";
import PriceHistoryPanel from "../../components/dashboard/PriceHistoryPanel";
import DashboardLayout from "../dashboard/DashboardLayout";
import styles from "./CoinDetailPage.module.css";
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
export default function CoinDetailPage() {
  const { coinId = "" } = useParams();
  const decodedCoinId = decodeURIComponent(coinId);
  const { coins, loadCoins, refresh, status } = useMarket();
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();
  const { showToast } = useToast();
  const { token } = useAuth();
  const [coin, setCoin] = useState(null);
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);
  useEffect(() => {
    const cachedCoin = coins.find((currentCoin) => currentCoin.id === decodedCoinId);
    if (cachedCoin) setCoin(cachedCoin);
  }, [coins, decodedCoinId]);
  useEffect(() => {
    if (!decodedCoinId) return;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);
    api
      .getCoin(decodedCoinId, { signal: controller.signal })
      .then((response) => setCoin(response.data))
      .catch((caughtError) => {
        if (!isRequestCancelled(caughtError)) {
          setError(
            caughtError instanceof ApiError
              ? caughtError.message
              : "No se pudo cargar la moneda.",
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });
    return () => controller.abort();
  }, [decodedCoinId]);
  async function handlePriceUpdate() {
    if (!coin) return;
    if (!token) {
      showToast("Tu sesiÃ³n no estÃ¡ disponible. VolvÃ© a iniciar sesiÃ³n.", "error");
      return;
    }
    setIsUpdating(true);
    try {
      await api.updateCurrentPrice(coin.id, token);
      await refresh();
      showToast(`Precio de ${coin.name} actualizado.`, "success");
    } catch (caughtError) {
      showToast(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo actualizar el precio.",
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  }
  const favorite = coin ? isFavorite(coin.id) : false;
  const isFavoriteUpdating = coin ? updatingCoinIds.includes(coin.id) : false;
  return _jsxs(DashboardLayout, {
    description:
      "Consulta el precio actual, revisa el historial y decide si quer\u00E9s seguir esta moneda.",
    eyebrow: "Mercado / Detalle",
    title: coin?.name || "Detalle de moneda",
    children: [
      isLoading &&
        !coin &&
        _jsxs("div", {
          className: styles.loading,
          role: "status",
          "aria-label": "Cargando moneda",
          children: [
            _jsx(Skeleton, { height: "8rem" }),
            _jsx(Skeleton, { height: "2rem", width: "60%" }),
          ],
        }),
      error && _jsx(Alert, { tone: "error", children: error }),
      !isLoading &&
        !coin &&
        !error &&
        _jsx(EmptyState, {
          description:
            "La moneda solicitada no est\u00E1 disponible en el mercado sincronizado.",
          title: "No encontramos esta moneda.",
          action: _jsx(Link, {
            className: styles.backLink,
            to: "/market",
            children: "Volver al mercado",
          }),
        }),
      coin &&
        _jsxs(_Fragment, {
          children: [
            _jsxs("section", {
              className: styles.hero,
              children: [
                _jsxs("div", {
                  className: styles.identity,
                  children: [
                    _jsx("span", {
                      className: styles.coinIcon,
                      children: coin.symbol.slice(0, 1).toUpperCase(),
                    }),
                    _jsxs("div", {
                      children: [
                        _jsxs(Badge, {
                          children: ["#", coin.market_cap_rank ?? "—", " en ranking"],
                        }),
                        _jsx("h2", { children: coin.name }),
                        _jsxs("span", {
                          children: [coin.symbol.toUpperCase(), " \u00B7 ", coin.id],
                        }),
                      ],
                    }),
                  ],
                }),
                _jsxs("div", {
                  className: styles.valueBlock,
                  children: [
                    _jsx("strong", {
                      children:
                        coin.current_price === null
                          ? "Sin datos"
                          : moneyFormatter.format(coin.current_price),
                    }),
                    _jsx("span", { children: "Precio actual" }),
                  ],
                }),
                _jsxs("div", {
                  className: styles.actions,
                  children: [
                    _jsx(Link, {
                      className: styles.backLink,
                      to: "/market",
                      children: "Volver al mercado",
                    }),
                    _jsx("button", {
                      "aria-label": favorite
                        ? `Quitar ${coin.name} de favoritos`
                        : `Agregar ${coin.name} a favoritos`,
                      "aria-pressed": favorite,
                      className: `${styles.favoriteButton} ${favorite ? styles.favoriteActive : ""}`,
                      disabled: isFavoriteUpdating,
                      onClick: () => void toggleFavorite(coin.id),
                      type: "button",
                      children: favorite ? "★ Favorito" : "☆ Favorito",
                    }),
                    _jsx(Button, {
                      loading: isUpdating,
                      onClick: () => void handlePriceUpdate(),
                      variant: "secondary",
                      children: "Actualizar precio",
                    }),
                    _jsx(Link, {
                      className: styles.portfolioLink,
                      to: "/portfolio",
                      children: "A\u00F1adir a cartera",
                    }),
                  ],
                }),
              ],
            }),
            _jsx(PriceHistoryPanel, { initialCoinId: coin.id }),
          ],
        }),
      status === "loading" &&
        coin &&
        _jsx("p", { className: styles.muted, children: "Actualizando datos\u2026" }),
    ],
  });
}

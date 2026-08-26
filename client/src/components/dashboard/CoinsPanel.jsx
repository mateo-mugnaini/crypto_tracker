import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ApiError, api } from "../../api/client";
import { useFavorites } from "../../features/favorites/FavoritesContext";
import { useMarket } from "../../features/market/MarketContext";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/ToastProvider";
import styles from "./CoinsPanel.module.css";
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
function formatPrice(price) {
  return price === null ? "Sin datos" : moneyFormatter.format(price);
}
export default function CoinsPanel() {
  const { coins, error, loadCoins, refresh, status } = useMarket();
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();
  const { showToast } = useToast();
  const [priceUpdatingCoinId, setPriceUpdatingCoinId] = useState(null);
  const [priceError, setPriceError] = useState(null);
  const [updatedCoinName, setUpdatedCoinName] = useState(null);
  const isLoading = status === "idle" || status === "loading";
  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);
  async function handlePriceUpdate(coinId, coinName) {
    setPriceUpdatingCoinId(coinId);
    setPriceError(null);
    setUpdatedCoinName(null);
    try {
      await api.updateCurrentPrice(coinId);
      setUpdatedCoinName(coinName);
      await refresh();
      showToast(`Precio de ${coinName} actualizado.`, "success");
    } catch (caughtError) {
      setPriceError(
        caughtError instanceof ApiError
          ? caughtError.message
          : "No se pudo actualizar el precio.",
      );
    } finally {
      setPriceUpdatingCoinId(null);
    }
  }
  return _jsxs("details", {
    className: styles.panel,
    "data-dashboard-accordion": "true",
    id: "market",
    open: true,
    children: [
      _jsxs("summary", {
        className: styles.sectionHeading,
        children: [
          _jsxs("div", {
            children: [
              _jsx("span", { className: styles.eyebrow, children: "Mercado local" }),
              _jsx("h2", { children: "Monedas sincronizadas" }),
            ],
          }),
          _jsxs(Badge, { children: [coins.length, " monedas"] }),
        ],
      }),
      isLoading &&
        _jsx("div", {
          className: styles.coinGrid,
          "aria-label": "Cargando monedas",
          role: "status",
          children: [1, 2, 3].map((item) =>
            _jsxs(
              "article",
              {
                className: styles.coinCard,
                children: [
                  _jsx(Skeleton, { height: "2.25rem", width: "2.25rem" }),
                  _jsx(Skeleton, { height: "2.5rem" }),
                  _jsx(Skeleton, { height: "2rem" }),
                ],
              },
              item,
            ),
          ),
        }),
      error &&
        _jsxs("div", {
          className: styles.errorState,
          children: [
            _jsx("p", { className: styles.errorMessage, children: error }),
            _jsx(Button, {
              onClick: () => void loadCoins(true),
              variant: "secondary",
              children: "Reintentar",
            }),
          ],
        }),
      priceError && _jsx("p", { className: styles.errorMessage, children: priceError }),
      updatedCoinName &&
        _jsxs("p", {
          className: styles.successMessage,
          children: [
            "Precio de ",
            updatedCoinName,
            " actualizado y paneles refrescados.",
          ],
        }),
      !isLoading &&
        !error &&
        coins.length === 0 &&
        _jsx(EmptyState, {
          description:
            "Sincroniza el mercado para consultar precios y crear tu cartera.",
          title: "Todav\u00EDa no hay monedas sincronizadas.",
          action: _jsx(Button, {
            onClick: () => void loadCoins(true),
            variant: "secondary",
            children: "Sincronizar mercado",
          }),
        }),
      !isLoading &&
        _jsx("div", {
          className: styles.coinGrid,
          children: coins.map((coin) => {
            const favorite = isFavorite(coin.id);
            const isUpdating = updatingCoinIds.includes(coin.id);
            return _jsxs(
              "article",
              {
                className: styles.coinCard,
                children: [
                  _jsx("div", {
                    className: styles.coinIcon,
                    children: coin.symbol.slice(0, 1).toUpperCase(),
                  }),
                  _jsxs("div", {
                    children: [
                      _jsx("strong", { children: coin.name }),
                      _jsx("span", { children: coin.symbol.toUpperCase() }),
                    ],
                  }),
                  _jsxs("div", {
                    className: styles.priceBlock,
                    children: [
                      _jsx("strong", { children: formatPrice(coin.current_price) }),
                      _jsx("small", { children: "Precio actual" }),
                    ],
                  }),
                  _jsxs("small", { children: ["#", coin.market_cap_rank ?? "—"] }),
                  _jsx("button", {
                    "aria-label": favorite
                      ? `Quitar ${coin.name} de favoritos`
                      : `Agregar ${coin.name} a favoritos`,
                    "aria-pressed": favorite,
                    className: `${styles.favoriteButton} ${favorite ? styles.favoriteActive : ""}`,
                    disabled: isUpdating,
                    onClick: () => void toggleFavorite(coin.id),
                    type: "button",
                    children: favorite ? "★" : "☆",
                  }),
                  _jsx(Button, {
                    disabled: priceUpdatingCoinId === coin.id,
                    loading: priceUpdatingCoinId === coin.id,
                    onClick: () => void handlePriceUpdate(coin.id, coin.name),
                    variant: "secondary",
                    children: "Precio",
                  }),
                ],
              },
              coin.id,
            );
          }),
        }),
    ],
  });
}

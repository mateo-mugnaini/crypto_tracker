import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useFavorites } from "../../features/favorites/FavoritesContext";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import styles from "./FavoritesPanel.module.css";
export default function FavoritesPanel() {
  const { error, favorites, isLoading, removeFavorite, updatingCoinIds } =
    useFavorites();
  return _jsxs("details", {
    className: styles.panel,
    "data-dashboard-accordion": "true",
    id: "favorites",
    open: true,
    children: [
      _jsxs("summary", {
        className: styles.sectionHeading,
        children: [
          _jsxs("div", {
            children: [
              _jsx("span", {
                className: styles.eyebrow,
                children: "Tus guardados",
              }),
              _jsx("h2", { children: "Favoritos" }),
            ],
          }),
          _jsxs(Badge, { children: [favorites.length, " guardados"] }),
        ],
      }),
      isLoading &&
        _jsx("p", { className: styles.muted, children: "Cargando favoritos\u2026" }),
      error && _jsx("p", { className: styles.errorMessage, children: error }),
      !isLoading &&
        !error &&
        favorites.length === 0 &&
        _jsx(EmptyState, {
          description: "Agrega una moneda desde el mercado para verla aqu\u00ED.",
          title: "Todav\u00EDa no ten\u00E9s favoritos.",
        }),
      _jsx("div", {
        className: styles.favoriteGrid,
        children: favorites.map((favorite) => {
          const isUpdating = updatingCoinIds.includes(favorite.coin_id);
          return _jsxs(
            "article",
            {
              className: styles.favoriteCard,
              children: [
                _jsx("div", {
                  className: styles.coinIcon,
                  children: favorite.symbol.slice(0, 1).toUpperCase(),
                }),
                _jsxs("div", {
                  children: [
                    _jsx("strong", { children: favorite.name }),
                    _jsx("span", { children: favorite.symbol.toUpperCase() }),
                  ],
                }),
                _jsx(Button, {
                  "aria-label": `Quitar ${favorite.name} de favoritos`,
                  disabled: isUpdating,
                  onClick: () => void removeFavorite(favorite.coin_id),
                  variant: "danger",
                  children: "Quitar",
                }),
              ],
            },
            favorite.coin_id,
          );
        }),
      }),
    ],
  });
}

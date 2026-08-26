import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { ApiError, api } from "../../api/client";
import { useFavorites } from "../../features/favorites/FavoritesContext";
import { useMarket } from "../../features/market/MarketContext";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/ToastProvider";
import styles from "./MarketExplorer.module.css";
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
function formatPrice(price) {
  return price === null ? "Sin datos" : moneyFormatter.format(price);
}
function updateSearchParams(current, changes) {
  const next = new URLSearchParams(current);
  Object.entries(changes).forEach(([key, value]) => {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  });
  return next;
}
function compareCoins(left, right, sort, direction) {
  let result;
  if (sort === "name") {
    result = left.name.localeCompare(right.name);
  } else if (sort === "price") {
    if (left.current_price === null && right.current_price !== null) return 1;
    if (left.current_price !== null && right.current_price === null) return -1;
    result = (left.current_price ?? 0) - (right.current_price ?? 0);
  } else {
    if (left.market_cap_rank === null && right.market_cap_rank !== null) return 1;
    if (left.market_cap_rank !== null && right.market_cap_rank === null) return -1;
    result =
      (left.market_cap_rank ?? Number.MAX_SAFE_INTEGER) -
      (right.market_cap_rank ?? Number.MAX_SAFE_INTEGER);
  }
  return direction === "asc" ? result : -result;
}
function MarketSkeleton() {
  return _jsx("div", {
    "aria-label": "Cargando mercado",
    className: styles.grid,
    role: "status",
    children: [1, 2, 3, 4].map((item) =>
      _jsxs(
        "article",
        {
          className: styles.card,
          children: [
            _jsx(Skeleton, { height: "2.5rem", width: "2.5rem" }),
            _jsx(Skeleton, { height: "1.8rem" }),
            _jsx(Skeleton, { height: "1.4rem" }),
            _jsx(Skeleton, { height: "2.5rem" }),
          ],
        },
        item,
      ),
    ),
  });
}
export default function MarketExplorer() {
  const { coins, error, loadCoins, refresh, status } = useMarket();
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [updatingPriceId, setUpdatingPriceId] = useState(null);
  const isLoading = status === "idle" || status === "loading";
  const query = searchParams.get("q") || "";
  const sort = searchParams.get("sort") || "rank";
  const direction = searchParams.get("direction") || "asc";
  const density = searchParams.get("view") || "cards";
  const favoritesOnly = searchParams.get("favorites") === "1";
  const pricedOnly = searchParams.get("priced") === "1";
  const maxRank = searchParams.get("maxRank") || "";
  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);
  const filteredCoins = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    const numericMaxRank = Number(maxRank);
    return coins
      .filter((coin) => {
        const matchesQuery =
          !normalizedQuery ||
          [coin.id, coin.name, coin.symbol].some((value) =>
            value.toLowerCase().includes(normalizedQuery),
          );
        const matchesFavorite = !favoritesOnly || isFavorite(coin.id);
        const matchesPrice = !pricedOnly || coin.current_price !== null;
        const matchesRank =
          !maxRank ||
          (Number.isFinite(numericMaxRank) &&
            coin.market_cap_rank !== null &&
            coin.market_cap_rank <= numericMaxRank);
        return matchesQuery && matchesFavorite && matchesPrice && matchesRank;
      })
      .sort((left, right) => compareCoins(left, right, sort, direction));
  }, [coins, direction, favoritesOnly, isFavorite, maxRank, pricedOnly, query, sort]);
  function setFilter(key, value) {
    setSearchParams(updateSearchParams(searchParams, { [key]: value }));
  }
  async function handlePriceUpdate(coin) {
    setUpdatingPriceId(coin.id);
    try {
      await api.updateCurrentPrice(coin.id);
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
      setUpdatingPriceId(null);
    }
  }
  function renderFavoriteButton(coin) {
    const favorite = isFavorite(coin.id);
    return _jsx("button", {
      "aria-label": favorite
        ? `Quitar ${coin.name} de favoritos`
        : `Agregar ${coin.name} a favoritos`,
      "aria-pressed": favorite,
      className: `${styles.favoriteButton} ${favorite ? styles.favoriteActive : ""}`,
      disabled: updatingCoinIds.includes(coin.id),
      onClick: () => void toggleFavorite(coin.id),
      type: "button",
      children: favorite ? "★" : "☆",
    });
  }
  return _jsxs("section", {
    "aria-busy": isLoading || updatingPriceId !== null,
    "aria-label": "Explorador de mercado",
    className: styles.panel,
    children: [
      _jsxs("div", {
        className: styles.toolbar,
        children: [
          _jsxs("label", {
            className: styles.searchField,
            children: [
              _jsx("span", { children: "Buscar moneda" }),
              _jsx("input", {
                onChange: (event) => setFilter("q", event.target.value),
                placeholder: "Bitcoin, btc o bitcoin",
                type: "search",
                value: query,
              }),
            ],
          }),
          _jsxs("label", {
            children: [
              _jsx("span", { children: "Ordenar por" }),
              _jsxs("select", {
                onChange: (event) => setFilter("sort", event.target.value),
                value: sort,
                children: [
                  _jsx("option", { value: "rank", children: "Ranking" }),
                  _jsx("option", { value: "name", children: "Nombre" }),
                  _jsx("option", { value: "price", children: "Precio" }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs("details", {
        className: styles.advancedFilters,
        children: [
          _jsx("summary", {
            className: styles.advancedSummary,
            children: "Más filtros",
          }),
          _jsxs("div", {
            className: styles.advancedContent,
            children: [
              _jsxs("label", {
                children: [
                  _jsx("span", { children: "Dirección" }),
                  _jsxs("select", {
                    onChange: (event) => setFilter("direction", event.target.value),
                    value: direction,
                    children: [
                      _jsx("option", { value: "asc", children: "Ascendente" }),
                      _jsx("option", { value: "desc", children: "Descendente" }),
                    ],
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  _jsx("span", { children: "Ranking máximo" }),
                  _jsx("input", {
                    min: "1",
                    onChange: (event) => setFilter("maxRank", event.target.value),
                    placeholder: "Ej. 100",
                    type: "number",
                    value: maxRank,
                  }),
                ],
              }),
            ],
          }),
        ],
      }),
      _jsxs("div", {
        className: styles.filterRow,
        children: [
          _jsx("button", {
            "aria-pressed": favoritesOnly,
            className: favoritesOnly ? styles.filterActive : styles.filterButton,
            onClick: () => setFilter("favorites", favoritesOnly ? null : "1"),
            type: "button",
            children: "Solo favoritos",
          }),
          _jsx("button", {
            "aria-pressed": pricedOnly,
            className: pricedOnly ? styles.filterActive : styles.filterButton,
            onClick: () => setFilter("priced", pricedOnly ? null : "1"),
            type: "button",
            children: "Con precio disponible",
          }),
          _jsxs("div", {
            className: styles.viewToggle,
            "aria-label": "Densidad de vista",
            children: [
              _jsx("button", {
                "aria-pressed": density === "cards",
                className:
                  density === "cards" ? styles.filterActive : styles.filterButton,
                onClick: () => setFilter("view", "cards"),
                type: "button",
                children: "Tarjetas",
              }),
              _jsx("button", {
                "aria-pressed": density === "table",
                className:
                  density === "table" ? styles.filterActive : styles.filterButton,
                onClick: () => setFilter("view", "table"),
                type: "button",
                children: "Tabla",
              }),
            ],
          }),
          _jsxs(Badge, { children: [filteredCoins.length, " resultados"] }),
        ],
      }),
      error &&
        _jsxs("div", {
          className: styles.errorState,
          children: [
            _jsx("p", { children: error }),
            _jsx(Button, {
              onClick: () => void loadCoins(true),
              variant: "secondary",
              children: "Reintentar",
            }),
          ],
        }),
      isLoading && _jsx(MarketSkeleton, {}),
      !isLoading &&
        !error &&
        filteredCoins.length === 0 &&
        _jsx(EmptyState, {
          description: "Prueba con otro texto o quita alguno de los filtros activos.",
          title: "No encontramos monedas.",
          action: _jsx(Button, {
            onClick: () => setSearchParams(new URLSearchParams()),
            variant: "secondary",
            children: "Limpiar filtros",
          }),
        }),
      !isLoading &&
        filteredCoins.length > 0 &&
        density === "cards" &&
        _jsx("div", {
          className: styles.grid,
          children: filteredCoins.map((coin) =>
            _jsxs(
              "article",
              {
                className: styles.card,
                children: [
                  _jsxs("div", {
                    className: styles.cardTop,
                    children: [
                      _jsx("div", {
                        className: styles.coinIcon,
                        children: coin.symbol.slice(0, 1).toUpperCase(),
                      }),
                      _jsxs("div", {
                        className: styles.coinName,
                        children: [
                          _jsx(Link, {
                            to: `/market/${encodeURIComponent(coin.id)}`,
                            children: coin.name,
                          }),
                          _jsxs("span", {
                            children: [
                              coin.symbol.toUpperCase(),
                              " \u00B7 #",
                              coin.market_cap_rank ?? "—",
                            ],
                          }),
                        ],
                      }),
                      renderFavoriteButton(coin),
                    ],
                  }),
                  _jsxs("div", {
                    className: styles.price,
                    children: [
                      _jsx("strong", { children: formatPrice(coin.current_price) }),
                      _jsx("span", {
                        children:
                          coin.current_price === null
                            ? "Precio pendiente"
                            : "Precio actual",
                      }),
                    ],
                  }),
                  _jsxs("div", {
                    className: styles.cardActions,
                    children: [
                      _jsx(Link, {
                        className: styles.detailLink,
                        to: `/market/${encodeURIComponent(coin.id)}`,
                        children: "Ver detalle",
                      }),
                      _jsx(Button, {
                        loading: updatingPriceId === coin.id,
                        onClick: () => void handlePriceUpdate(coin),
                        variant: "secondary",
                        children: "Actualizar precio",
                      }),
                    ],
                  }),
                ],
              },
              coin.id,
            ),
          ),
        }),
      !isLoading &&
        filteredCoins.length > 0 &&
        density === "table" &&
        _jsx("div", {
          className: styles.tableWrapper,
          children: _jsxs("table", {
            children: [
              _jsx("thead", {
                children: _jsxs("tr", {
                  children: [
                    _jsx("th", { children: "Activo" }),
                    _jsx("th", { children: "Ranking" }),
                    _jsx("th", { children: "Precio" }),
                    _jsx("th", { children: "Acciones" }),
                  ],
                }),
              }),
              _jsx("tbody", {
                children: filteredCoins.map((coin) =>
                  _jsxs(
                    "tr",
                    {
                      children: [
                        _jsx("td", {
                          children: _jsxs(Link, {
                            className: styles.tableCoin,
                            to: `/market/${encodeURIComponent(coin.id)}`,
                            children: [
                              _jsx("span", {
                                className: styles.coinIcon,
                                children: coin.symbol.slice(0, 1).toUpperCase(),
                              }),
                              _jsxs("span", {
                                children: [
                                  _jsx("strong", { children: coin.name }),
                                  _jsx("small", {
                                    children: coin.symbol.toUpperCase(),
                                  }),
                                ],
                              }),
                            ],
                          }),
                        }),
                        _jsxs("td", { children: ["#", coin.market_cap_rank ?? "—"] }),
                        _jsx("td", { children: formatPrice(coin.current_price) }),
                        _jsxs("td", {
                          className: styles.tableActions,
                          children: [
                            renderFavoriteButton(coin),
                            _jsx(Button, {
                              loading: updatingPriceId === coin.id,
                              onClick: () => void handlePriceUpdate(coin),
                              variant: "secondary",
                              children: "Precio",
                            }),
                          ],
                        }),
                      ],
                    },
                    coin.id,
                  ),
                ),
              }),
            ],
          }),
        }),
    ],
  });
}

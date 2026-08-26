import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";

import { ApiError, api } from "../../api/client";
import { useFavorites } from "../../features/favorites/FavoritesContext";
import { useMarket } from "../../features/market/MarketContext";
import type { Coin } from "../../api/types";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import Skeleton from "../ui/Skeleton";
import { useToast } from "../ui/ToastProvider";
import styles from "./MarketExplorer.module.css";

type SortKey = "rank" | "name" | "price";
type Direction = "asc" | "desc";
type Density = "cards" | "table";

const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatPrice(price: number | null) {
  return price === null ? "Sin datos" : moneyFormatter.format(price);
}

function updateSearchParams(
  current: URLSearchParams,
  changes: Record<string, string | null>,
) {
  const next = new URLSearchParams(current);
  Object.entries(changes).forEach(([key, value]) => {
    if (value === null || value === "") next.delete(key);
    else next.set(key, value);
  });
  return next;
}

function compareCoins(left: Coin, right: Coin, sort: SortKey, direction: Direction) {
  let result: number;

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
  return (
    <div aria-label="Cargando mercado" className={styles.grid} role="status">
      {[1, 2, 3, 4].map((item) => (
        <article className={styles.card} key={item}>
          <Skeleton height="2.5rem" width="2.5rem" />
          <Skeleton height="1.8rem" />
          <Skeleton height="1.4rem" />
          <Skeleton height="2.5rem" />
        </article>
      ))}
    </div>
  );
}

export default function MarketExplorer() {
  const { coins, error, loadCoins, refresh, status } = useMarket();
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();
  const { showToast } = useToast();
  const [searchParams, setSearchParams] = useSearchParams();
  const [updatingPriceId, setUpdatingPriceId] = useState<string | null>(null);
  const isLoading = status === "idle" || status === "loading";
  const query = searchParams.get("q") || "";
  const sort = (searchParams.get("sort") as SortKey) || "rank";
  const direction = (searchParams.get("direction") as Direction) || "asc";
  const density = (searchParams.get("view") as Density) || "cards";
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

  function setFilter(key: string, value: string | null) {
    setSearchParams(updateSearchParams(searchParams, { [key]: value }));
  }

  async function handlePriceUpdate(coin: Coin) {
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

  function renderFavoriteButton(coin: Coin) {
    const favorite = isFavorite(coin.id);
    return (
      <button
        aria-label={
          favorite
            ? `Quitar ${coin.name} de favoritos`
            : `Agregar ${coin.name} a favoritos`
        }
        aria-pressed={favorite}
        className={`${styles.favoriteButton} ${favorite ? styles.favoriteActive : ""}`}
        disabled={updatingCoinIds.includes(coin.id)}
        onClick={() => void toggleFavorite(coin.id)}
        type="button"
      >
        {favorite ? "★" : "☆"}
      </button>
    );
  }

  return (
    <section aria-label="Explorador de mercado" className={styles.panel}>
      <div className={styles.toolbar}>
        <label className={styles.searchField}>
          <span>Buscar moneda</span>
          <input
            onChange={(event) => setFilter("q", event.target.value)}
            placeholder="Bitcoin, btc o bitcoin"
            type="search"
            value={query}
          />
        </label>
        <label>
          <span>Ordenar por</span>
          <select
            onChange={(event) => setFilter("sort", event.target.value)}
            value={sort}
          >
            <option value="rank">Ranking</option>
            <option value="name">Nombre</option>
            <option value="price">Precio</option>
          </select>
        </label>
        <label>
          <span>Dirección</span>
          <select
            onChange={(event) => setFilter("direction", event.target.value)}
            value={direction}
          >
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        </label>
        <label>
          <span>Ranking máximo</span>
          <input
            min="1"
            onChange={(event) => setFilter("maxRank", event.target.value)}
            placeholder="100"
            type="number"
            value={maxRank}
          />
        </label>
      </div>

      <div className={styles.filterRow}>
        <button
          aria-pressed={favoritesOnly}
          className={favoritesOnly ? styles.filterActive : styles.filterButton}
          onClick={() => setFilter("favorites", favoritesOnly ? null : "1")}
          type="button"
        >
          Solo favoritos
        </button>
        <button
          aria-pressed={pricedOnly}
          className={pricedOnly ? styles.filterActive : styles.filterButton}
          onClick={() => setFilter("priced", pricedOnly ? null : "1")}
          type="button"
        >
          Con precio disponible
        </button>
        <div className={styles.viewToggle} aria-label="Densidad de vista">
          <button
            aria-pressed={density === "cards"}
            className={density === "cards" ? styles.filterActive : styles.filterButton}
            onClick={() => setFilter("view", "cards")}
            type="button"
          >
            Tarjetas
          </button>
          <button
            aria-pressed={density === "table"}
            className={density === "table" ? styles.filterActive : styles.filterButton}
            onClick={() => setFilter("view", "table")}
            type="button"
          >
            Tabla
          </button>
        </div>
        <Badge>{filteredCoins.length} resultados</Badge>
      </div>

      {error && (
        <div className={styles.errorState}>
          <p>{error}</p>
          <Button onClick={() => void loadCoins(true)} variant="secondary">
            Reintentar
          </Button>
        </div>
      )}

      {isLoading && <MarketSkeleton />}
      {!isLoading && !error && filteredCoins.length === 0 && (
        <EmptyState
          description="Prueba con otro texto o quita alguno de los filtros activos."
          title="No encontramos monedas."
          action={
            <Button
              onClick={() => setSearchParams(new URLSearchParams())}
              variant="secondary"
            >
              Limpiar filtros
            </Button>
          }
        />
      )}

      {!isLoading && filteredCoins.length > 0 && density === "cards" && (
        <div className={styles.grid}>
          {filteredCoins.map((coin) => (
            <article className={styles.card} key={coin.id}>
              <div className={styles.cardTop}>
                <div className={styles.coinIcon}>
                  {coin.symbol.slice(0, 1).toUpperCase()}
                </div>
                <div className={styles.coinName}>
                  <Link to={`/market/${encodeURIComponent(coin.id)}`}>{coin.name}</Link>
                  <span>
                    {coin.symbol.toUpperCase()} · #{coin.market_cap_rank ?? "—"}
                  </span>
                </div>
                {renderFavoriteButton(coin)}
              </div>
              <div className={styles.price}>
                <strong>{formatPrice(coin.current_price)}</strong>
                <span>
                  {coin.current_price === null ? "Precio pendiente" : "Precio actual"}
                </span>
              </div>
              <div className={styles.cardActions}>
                <Link
                  className={styles.detailLink}
                  to={`/market/${encodeURIComponent(coin.id)}`}
                >
                  Ver detalle
                </Link>
                <Button
                  loading={updatingPriceId === coin.id}
                  onClick={() => void handlePriceUpdate(coin)}
                  variant="secondary"
                >
                  Actualizar precio
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {!isLoading && filteredCoins.length > 0 && density === "table" && (
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>Activo</th>
                <th>Ranking</th>
                <th>Precio</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredCoins.map((coin) => (
                <tr key={coin.id}>
                  <td>
                    <Link
                      className={styles.tableCoin}
                      to={`/market/${encodeURIComponent(coin.id)}`}
                    >
                      <span className={styles.coinIcon}>
                        {coin.symbol.slice(0, 1).toUpperCase()}
                      </span>
                      <span>
                        <strong>{coin.name}</strong>
                        <small>{coin.symbol.toUpperCase()}</small>
                      </span>
                    </Link>
                  </td>
                  <td>#{coin.market_cap_rank ?? "—"}</td>
                  <td>{formatPrice(coin.current_price)}</td>
                  <td className={styles.tableActions}>
                    {renderFavoriteButton(coin)}
                    <Button
                      loading={updatingPriceId === coin.id}
                      onClick={() => void handlePriceUpdate(coin)}
                      variant="secondary"
                    >
                      Precio
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

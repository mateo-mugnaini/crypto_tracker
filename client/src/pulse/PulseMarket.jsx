import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useFavorites } from "../features/favorites/FavoritesContext";
import { useMarket } from "../features/market/MarketContext";
import { useToast } from "../components/ui/ToastProvider";
import PulseShell from "./PulseShell";
import { formatCurrency, initials } from "./pulseUtils";
import styles from "./PulseViews.module.css";

export default function PulseMarket() {
  const { coins, error, loadCoins, refresh, status } = useMarket();
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();
  const { showToast } = useToast();
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);

  useEffect(() => {
    if (status === "idle") void loadCoins();
  }, [loadCoins, status]);

  const visibleCoins = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    if (!normalized) return coins;
    return coins.filter((coin) =>
      `${coin.name} ${coin.symbol} ${coin.id}`.toLowerCase().includes(normalized),
    );
  }, [coins, query]);

  async function updatePrice(coin) {
    setUpdatingId(coin.id);
    try {
      await api.updateCurrentPrice(coin.id);
      await refresh();
      showToast(`${coin.name} fue actualizada.`, "success");
    } catch (caughtError) {
      showToast(caughtError.message || "No se pudo actualizar el precio.", "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <PulseShell
      description="Buscá una moneda y abrí solo la información que necesitás."
      title="Mercado"
    >
      <div className={styles.stack}>
        <div className={styles.searchRow}>
          <div className={styles.field}>
            <label htmlFor="market-search">Buscar moneda</label>
            <input
              id="market-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Bitcoin, BTC…"
              type="search"
              value={query}
            />
          </div>
          {query && (
            <button
              className={styles.secondaryButton}
              onClick={() => setQuery("")}
              type="button"
            >
              Limpiar
            </button>
          )}
        </div>

        {error && <div className={styles.notice}>{error}</div>}
        <p className={styles.resultHint}>
          {visibleCoins.length} resultado{visibleCoins.length === 1 ? "" : "s"}
        </p>
        {status === "loading" && !coins.length ? (
          <div className={styles.empty}>Cargando mercado…</div>
        ) : visibleCoins.length ? (
          <div className={styles.coinList}>
            {visibleCoins.map((coin) => {
              const favoriteUpdating = updatingCoinIds.includes(coin.id);
              return (
                <div className={styles.coinRow} key={coin.id}>
                  <Link className={styles.coinIdentity} to={`/market/${coin.id}`}>
                    <span className={styles.coinIcon}>{initials(coin.symbol)}</span>
                    <span className={styles.coinName}>
                      <strong>{coin.name}</strong>
                      <span>
                        {coin.symbol.toUpperCase()}{" "}
                        {coin.market_cap_rank ? `· #${coin.market_cap_rank}` : ""}
                      </span>
                    </span>
                  </Link>
                  <span className={styles.coinPrice}>
                    {formatCurrency(coin.current_price)}
                  </span>
                  <span className={styles.coinActions}>
                    <button
                      aria-label={`${isFavorite(coin.id) ? "Quitar" : "Agregar"} ${coin.name} de favoritos`}
                      className={`${styles.iconButton} ${isFavorite(coin.id) ? styles.iconButtonActive : ""}`}
                      disabled={favoriteUpdating}
                      onClick={() => void toggleFavorite(coin.id)}
                      type="button"
                    >
                      {isFavorite(coin.id) ? "★" : "☆"}
                    </button>
                    <button
                      className={styles.iconButton}
                      disabled={updatingId === coin.id}
                      onClick={() => void updatePrice(coin)}
                      type="button"
                    >
                      {updatingId === coin.id ? "…" : "↻"}
                    </button>
                    <Link className={styles.rowLink} to={`/market/${coin.id}`}>
                      Abrir
                    </Link>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>No encontramos una moneda con ese nombre.</div>
        )}
      </div>
    </PulseShell>
  );
}

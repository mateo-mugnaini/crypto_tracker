import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useFavorites } from "../features/favorites/FavoritesContext";
import { useMarket } from "../features/market/MarketContext";
import { useToast } from "../components/ui/ToastProvider";
import { useI18n } from "../i18n/I18nContext";
import PulseShell from "./PulseShell";
import { formatCurrency, initials } from "./pulseUtils";
import styles from "./PulseViews.module.css";

export default function PulseMarket() {
  const { coins, error, loadCoins, refresh, status } = useMarket();
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();
  const { showToast } = useToast();
  const { token } = useAuth();
  const [query, setQuery] = useState("");
  const [updatingId, setUpdatingId] = useState(null);
  const { t } = useI18n();

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
    if (!token) {
      showToast(t("session_unavailable"), "error");
      return;
    }
    setUpdatingId(coin.id);
    try {
      await api.updateCurrentPrice(coin.id, token);
      await refresh();
      showToast(t("price_updated", { name: coin.name }), "success");
    } catch (caughtError) {
      showToast(caughtError.message || t("generic_error"), "error");
    } finally {
      setUpdatingId(null);
    }
  }

  return (
    <PulseShell description={t("market_description")} title={t("market_title")}>
      <div className={styles.stack}>
        <div className={styles.searchRow}>
          <div className={styles.field}>
            <label htmlFor="market-search">{t("search_coin")}</label>
            <input
              id="market-search"
              onChange={(event) => setQuery(event.target.value)}
              placeholder={t("search_placeholder")}
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
              {t("clear")}
            </button>
          )}
        </div>

        {error && <div className={styles.notice}>{error}</div>}
        <p className={styles.resultHint}>
          {visibleCoins.length}{" "}
          {visibleCoins.length === 1 ? t("result_count") : t("results")}
        </p>
        {status === "loading" && !coins.length ? (
          <div className={styles.empty}>{t("loading_market")}</div>
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
                      aria-label={
                        isFavorite(coin.id)
                          ? t("remove_favorite", { name: coin.name })
                          : t("add_favorite", { name: coin.name })
                      }
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
                      {t("open")}
                    </Link>
                  </span>
                </div>
              );
            })}
          </div>
        ) : (
          <div className={styles.empty}>{t("no_coin")}</div>
        )}
      </div>
    </PulseShell>
  );
}

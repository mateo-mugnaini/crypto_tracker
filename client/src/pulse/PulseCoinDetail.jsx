import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useFavorites } from "../features/favorites/FavoritesContext";
import { useMarket } from "../features/market/MarketContext";
import { useToast } from "../components/ui/ToastProvider";
import { useI18n } from "../i18n/I18nContext";
import PulseShell from "./PulseShell";
import { formatCurrency, formatDate, initials } from "./pulseUtils";
import styles from "./PulseViews.module.css";

export default function PulseCoinDetail() {
  const { coinId } = useParams();
  const { coins, refresh } = useMarket();
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();
  const { showToast } = useToast();
  const { token } = useAuth();
  const [coin, setCoin] = useState(
    () => coins.find((item) => item.id === coinId) || null,
  );
  const [error, setError] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    const cachedCoin = coins.find((item) => item.id === coinId);
    if (cachedCoin) setCoin(cachedCoin);
  }, [coinId, coins]);

  useEffect(() => {
    const controller = new AbortController();
    api
      .getCoin(coinId, { signal: controller.signal })
      .then((response) => setCoin(response.data))
      .catch((caughtError) => {
        if (!controller.signal.aborted) setError(caughtError.message || t("no_coin"));
      });
    return () => controller.abort();
  }, [coinId, t]);

  async function updatePrice() {
    if (!token) {
      showToast(t("session_unavailable"), "error");
      return;
    }
    setIsUpdating(true);
    try {
      await api.updateCurrentPrice(coinId, token);
      await refresh();
      const response = await api.getCoin(coinId);
      setCoin(response.data);
      showToast(t("price_updated", { name: coinId }), "success");
    } catch (caughtError) {
      showToast(caughtError.message || t("generic_error"), "error");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <PulseShell title={coin?.name || t("coin")}>
      <div className={styles.stack}>
        <Link className={styles.backLink} to="/market">
          ← {t("detail_back")}
        </Link>
        {error && <div className={styles.notice}>{error}</div>}
        {!coin && !error ? (
          <div className={styles.empty}>{t("loading_coin")}</div>
        ) : (
          coin && (
            <>
              <section className={styles.detailHero}>
                <div>
                  <div className={styles.detailIdentity}>
                    <span className={styles.coinIcon}>{initials(coin.symbol)}</span>
                    <div>
                      <h2>{coin.name}</h2>
                      <p>
                        {coin.symbol.toUpperCase()}{" "}
                        {coin.market_cap_rank
                          ? `· Ranking #${coin.market_cap_rank}`
                          : ""}
                      </p>
                    </div>
                  </div>
                  <div className={styles.detailActions}>
                    <button
                      className={styles.primaryButton}
                      disabled={updatingCoinIds.includes(coin.id)}
                      onClick={() => void toggleFavorite(coin.id)}
                      type="button"
                    >
                      {isFavorite(coin.id)
                        ? `★ ${t("remove_favorite_short")}`
                        : `☆ ${t("add_favorite_short")}`}
                    </button>
                    <button
                      className={styles.secondaryButton}
                      disabled={isUpdating}
                      onClick={() => void updatePrice()}
                      type="button"
                    >
                      {isUpdating ? t("refreshing") : t("update_price")}
                    </button>
                    <Link
                      className={styles.secondaryButton}
                      to={`/portfolio?coin=${coin.id}`}
                    >
                      {t("add_portfolio")}
                    </Link>
                  </div>
                </div>
                <strong className={styles.detailPrice}>
                  {formatCurrency(coin.current_price)}
                </strong>
              </section>
              <section className={styles.infoGrid} aria-label={t("coin_data")}>
                <div className={styles.infoItem}>
                  <span>{t("last_update")}</span>
                  <strong>{formatDate(coin.updated_at || coin.recorded_at)}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>{t("identifier")}</span>
                  <strong>{coin.id}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>{t("more_info")}</span>
                  <Link className={styles.textLink} to={`/history?coin=${coin.id}`}>
                    {t("history_link")}
                  </Link>
                </div>
              </section>
            </>
          )
        )}
      </div>
    </PulseShell>
  );
}

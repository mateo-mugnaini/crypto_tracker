import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError, api, isRequestCancelled } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import type { Coin } from "../../api/types";
import { useFavorites } from "../../features/favorites/FavoritesContext";
import { useMarket } from "../../features/market/MarketContext";
import { useI18n } from "../../i18n/I18nContext";
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
  const [coin, setCoin] = useState<Coin | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);
  const { t } = useI18n();

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
            caughtError instanceof ApiError ? caughtError.message : t("no_coin"),
          );
        }
      })
      .finally(() => {
        if (!controller.signal.aborted) setIsLoading(false);
      });

    return () => controller.abort();
  }, [decodedCoinId, t]);

  async function handlePriceUpdate() {
    if (!coin) return;
    if (!token) {
      showToast(t("session_unavailable"), "error");
      return;
    }
    setIsUpdating(true);
    try {
      await api.updateCurrentPrice(coin.id, token);
      await refresh();
      showToast(t("price_updated", { name: coin.name }), "success");
    } catch (caughtError) {
      showToast(
        caughtError instanceof ApiError ? caughtError.message : t("error_operation"),
        "error",
      );
    } finally {
      setIsUpdating(false);
    }
  }

  const favorite = coin ? isFavorite(coin.id) : false;
  const isFavoriteUpdating = coin ? updatingCoinIds.includes(coin.id) : false;

  return (
    <DashboardLayout
      description={t("market_description")}
      eyebrow="market_eyebrow"
      title={coin?.name || t("coin_detail")}
    >
      {isLoading && !coin && (
        <div className={styles.loading} role="status" aria-label={t("loading_coin")}>
          <Skeleton height="8rem" />
          <Skeleton height="2rem" width="60%" />
        </div>
      )}

      {error && <Alert tone="error">{error}</Alert>}

      {!isLoading && !coin && !error && (
        <EmptyState
          description={t("no_coin")}
          title={t("no_coins_found")}
          action={
            <Link className={styles.backLink} to="/market">
              {t("back_to_market")}
            </Link>
          }
        />
      )}

      {coin && (
        <>
          <section className={styles.hero}>
            <div className={styles.identity}>
              <span className={styles.coinIcon}>
                {coin.symbol.slice(0, 1).toUpperCase()}
              </span>
              <div>
                <Badge>
                  #{coin.market_cap_rank ?? "—"} {t("ranking")}
                </Badge>
                <h2>{coin.name}</h2>
                <span>
                  {coin.symbol.toUpperCase()} · {coin.id}
                </span>
              </div>
            </div>
            <div className={styles.valueBlock}>
              <strong>
                {coin.current_price === null
                  ? t("not_synced")
                  : moneyFormatter.format(coin.current_price)}
              </strong>
              <span>{t("current_value")}</span>
            </div>
            <div className={styles.actions}>
              <button
                aria-label={
                  favorite
                    ? t("remove_favorite", { name: coin.name })
                    : t("add_favorite", { name: coin.name })
                }
                aria-pressed={favorite}
                className={`${styles.favoriteButton} ${favorite ? styles.favoriteActive : ""}`}
                disabled={isFavoriteUpdating}
                onClick={() => void toggleFavorite(coin.id)}
                type="button"
              >
                {favorite ? `★ ${t("in_favorites")}` : `☆ ${t("add_favorite_short")}`}
              </button>
              <Button
                loading={isUpdating}
                onClick={() => void handlePriceUpdate()}
                variant="secondary"
              >
                {t("update_price")}
              </Button>
              <Link className={styles.portfolioLink} to="/portfolio">
                {t("add_to_portfolio")}
              </Link>
            </div>
          </section>
          <PriceHistoryPanel initialCoinId={coin.id} />
        </>
      )}
      {status === "loading" && coin && (
        <p className={styles.muted}>{t("refreshing")}</p>
      )}
    </DashboardLayout>
  );
}

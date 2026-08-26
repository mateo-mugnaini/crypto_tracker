import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import { ApiError, api, isRequestCancelled } from "../../api/client";
import type { Coin } from "../../api/types";
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
  const [coin, setCoin] = useState<Coin | null>(null);
  const [error, setError] = useState<string | null>(null);
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
    setIsUpdating(true);
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
      setIsUpdating(false);
    }
  }

  const favorite = coin ? isFavorite(coin.id) : false;
  const isFavoriteUpdating = coin ? updatingCoinIds.includes(coin.id) : false;

  return (
    <DashboardLayout
      description="Consulta el precio actual, revisa el historial y decide si querés seguir esta moneda."
      eyebrow="Market / Coin detail"
      title={coin?.name || "Detalle de moneda"}
    >
      {isLoading && !coin && (
        <div className={styles.loading} role="status" aria-label="Cargando moneda">
          <Skeleton height="8rem" />
          <Skeleton height="2rem" width="60%" />
        </div>
      )}

      {error && <Alert tone="error">{error}</Alert>}

      {!isLoading && !coin && !error && (
        <EmptyState
          description="La moneda solicitada no está disponible en el mercado sincronizado."
          title="No encontramos esta moneda."
          action={
            <Link className={styles.backLink} to="/market">
              Volver al mercado
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
                <Badge>#{coin.market_cap_rank ?? "—"} en ranking</Badge>
                <h2>{coin.name}</h2>
                <span>
                  {coin.symbol.toUpperCase()} · {coin.id}
                </span>
              </div>
            </div>
            <div className={styles.valueBlock}>
              <strong>
                {coin.current_price === null
                  ? "Sin datos"
                  : moneyFormatter.format(coin.current_price)}
              </strong>
              <span>Precio actual</span>
            </div>
            <div className={styles.actions}>
              <button
                aria-label={
                  favorite
                    ? `Quitar ${coin.name} de favoritos`
                    : `Agregar ${coin.name} a favoritos`
                }
                aria-pressed={favorite}
                className={`${styles.favoriteButton} ${favorite ? styles.favoriteActive : ""}`}
                disabled={isFavoriteUpdating}
                onClick={() => void toggleFavorite(coin.id)}
                type="button"
              >
                {favorite ? "★ Favorito" : "☆ Favorito"}
              </button>
              <Button
                loading={isUpdating}
                onClick={() => void handlePriceUpdate()}
                variant="secondary"
              >
                Actualizar precio
              </Button>
              <Link className={styles.portfolioLink} to="/portfolio">
                Añadir a cartera
              </Link>
            </div>
          </section>
          <PriceHistoryPanel initialCoinId={coin.id} />
        </>
      )}
      {status === "loading" && coin && (
        <p className={styles.muted}>Actualizando datos…</p>
      )}
    </DashboardLayout>
  );
}

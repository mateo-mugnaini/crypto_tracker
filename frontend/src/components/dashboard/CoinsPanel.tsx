import { useEffect, useState } from "react";

import { ApiError, api } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
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

function formatPrice(price: number | null) {
  return price === null ? "Sin datos" : moneyFormatter.format(price);
}

export default function CoinsPanel() {
  const { coins, error, loadCoins, refresh, status } = useMarket();
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();
  const { showToast } = useToast();
  const { token } = useAuth();
  const [priceUpdatingCoinId, setPriceUpdatingCoinId] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [updatedCoinName, setUpdatedCoinName] = useState<string | null>(null);
  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);

  async function handlePriceUpdate(coinId: string, coinName: string) {
    if (!token) {
      setPriceError("Tu sesión no está disponible. Volvé a iniciar sesión.");
      return;
    }
    setPriceUpdatingCoinId(coinId);
    setPriceError(null);
    setUpdatedCoinName(null);

    try {
      await api.updateCurrentPrice(coinId, token);
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

  return (
    <details className={styles.panel} data-dashboard-accordion="true" id="market" open>
      <summary className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>Mercado local</span>
          <h2>Monedas sincronizadas</h2>
        </div>
        <Badge>{coins.length} monedas</Badge>
      </summary>

      {isLoading && (
        <div className={styles.coinGrid} aria-label="Cargando monedas" role="status">
          {[1, 2, 3].map((item) => (
            <article className={styles.coinCard} key={item}>
              <Skeleton height="2.25rem" width="2.25rem" />
              <Skeleton height="2.5rem" />
              <Skeleton height="2rem" />
            </article>
          ))}
        </div>
      )}
      {error && (
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>{error}</p>
          <Button onClick={() => void loadCoins(true)} variant="secondary">
            Reintentar
          </Button>
        </div>
      )}
      {priceError && <p className={styles.errorMessage}>{priceError}</p>}
      {updatedCoinName && (
        <p className={styles.successMessage}>
          Precio de {updatedCoinName} actualizado y paneles refrescados.
        </p>
      )}
      {!isLoading && !error && coins.length === 0 && (
        <EmptyState
          description="Sincroniza el mercado para consultar precios y crear tu cartera."
          title="Todavía no hay monedas sincronizadas."
          action={
            <Button onClick={() => void loadCoins(true)} variant="secondary">
              Sincronizar mercado
            </Button>
          }
        />
      )}

      {!isLoading && (
        <div className={styles.coinGrid}>
          {coins.map((coin) => {
            const favorite = isFavorite(coin.id);
            const isUpdating = updatingCoinIds.includes(coin.id);

            return (
              <article className={styles.coinCard} key={coin.id}>
                <div className={styles.coinIcon}>
                  {coin.symbol.slice(0, 1).toUpperCase()}
                </div>
                <div>
                  <strong>{coin.name}</strong>
                  <span>{coin.symbol.toUpperCase()}</span>
                </div>
                <div className={styles.priceBlock}>
                  <strong>{formatPrice(coin.current_price)}</strong>
                  <small>Precio actual</small>
                </div>
                <small>#{coin.market_cap_rank ?? "—"}</small>
                <button
                  aria-label={
                    favorite
                      ? `Quitar ${coin.name} de favoritos`
                      : `Agregar ${coin.name} a favoritos`
                  }
                  aria-pressed={favorite}
                  className={`${styles.favoriteButton} ${favorite ? styles.favoriteActive : ""}`}
                  disabled={isUpdating}
                  onClick={() => void toggleFavorite(coin.id)}
                  type="button"
                >
                  {favorite ? "★" : "☆"}
                </button>
                <Button
                  disabled={priceUpdatingCoinId === coin.id}
                  loading={priceUpdatingCoinId === coin.id}
                  onClick={() => void handlePriceUpdate(coin.id, coin.name)}
                  variant="secondary"
                >
                  Precio
                </Button>
              </article>
            );
          })}
        </div>
      )}
    </details>
  );
}

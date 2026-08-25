import { useEffect, useState } from "react";

import { ApiError, api } from "../../api/client";
import { useFavorites } from "../../features/favorites/FavoritesContext";
import { useMarket } from "../../features/market/MarketContext";
import styles from "./CoinsPanel.module.css";

export default function CoinsPanel() {
  const { coins, error, loadCoins, refresh, status } = useMarket();
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();
  const [priceUpdatingCoinId, setPriceUpdatingCoinId] = useState<string | null>(null);
  const [priceError, setPriceError] = useState<string | null>(null);
  const [updatedCoinName, setUpdatedCoinName] = useState<string | null>(null);
  const isLoading = status === "idle" || status === "loading";

  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);

  async function handlePriceUpdate(coinId: string, coinName: string) {
    setPriceUpdatingCoinId(coinId);
    setPriceError(null);
    setUpdatedCoinName(null);

    try {
      await api.updateCurrentPrice(coinId);
      setUpdatedCoinName(coinName);
      await refresh();
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
    <section className={styles.panel}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>Mercado local</span>
          <h2>Monedas sincronizadas</h2>
        </div>
        <span className={styles.pill}>{coins.length} monedas</span>
      </div>

      {isLoading && <p className={styles.muted}>Cargando monedas…</p>}
      {error && (
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>{error}</p>
          <button onClick={() => void loadCoins(true)} type="button">
            Reintentar
          </button>
        </div>
      )}
      {priceError && <p className={styles.errorMessage}>{priceError}</p>}
      {updatedCoinName && (
        <p className={styles.successMessage}>
          Precio de {updatedCoinName} actualizado y paneles refrescados.
        </p>
      )}
      {!isLoading && !error && coins.length === 0 && (
        <p className={styles.muted}>Todavia no hay monedas sincronizadas.</p>
      )}

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
              <button
                className={styles.updateButton}
                disabled={priceUpdatingCoinId === coin.id}
                onClick={() => void handlePriceUpdate(coin.id, coin.name)}
                type="button"
              >
                {priceUpdatingCoinId === coin.id ? "…" : "Precio"}
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

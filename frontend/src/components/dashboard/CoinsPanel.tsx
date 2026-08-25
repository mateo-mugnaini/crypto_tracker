import { useEffect, useState } from "react";

import { ApiError, api } from "../../api/client";
import type { Coin } from "../../api/types";
import { useFavorites } from "../../features/favorites/FavoritesContext";
import styles from "./CoinsPanel.module.css";

export default function CoinsPanel() {
  const [coins, setCoins] = useState<Coin[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isFavorite, toggleFavorite, updatingCoinIds } = useFavorites();

  useEffect(() => {
    api
      .getCoins()
      .then((response) => setCoins(response.data))
      .catch((caughtError) => {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudieron cargar las monedas.",
        );
      })
      .finally(() => setIsLoading(false));
  }, []);

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
      {error && <p className={styles.errorMessage}>{error}</p>}
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
            </article>
          );
        })}
      </div>
    </section>
  );
}

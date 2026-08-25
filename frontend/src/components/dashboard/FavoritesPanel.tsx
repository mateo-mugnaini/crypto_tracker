import { useFavorites } from "../../features/favorites/FavoritesContext";
import styles from "./FavoritesPanel.module.css";

export default function FavoritesPanel() {
  const {
    error,
    favorites,
    isLoading,
    removeFavorite,
    updatingCoinIds,
  } = useFavorites();

  return (
    <section className={styles.panel}>
      <div className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>Tu selección</span>
          <h2>Favoritos</h2>
        </div>
        <span className={styles.pill}>{favorites.length} guardados</span>
      </div>

      {isLoading && <p className={styles.muted}>Cargando favoritos…</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!isLoading && !error && favorites.length === 0 && (
        <p className={styles.muted}>
          Todavia no tenes favoritos. Agrega una moneda desde el mercado.
        </p>
      )}

      <div className={styles.favoriteGrid}>
        {favorites.map((favorite) => {
          const isUpdating = updatingCoinIds.includes(favorite.coin_id);

          return (
            <article className={styles.favoriteCard} key={favorite.coin_id}>
              <div className={styles.coinIcon}>
                {favorite.symbol.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <strong>{favorite.name}</strong>
                <span>{favorite.symbol.toUpperCase()}</span>
              </div>
              <button
                aria-label={`Quitar ${favorite.name} de favoritos`}
                className={styles.removeButton}
                disabled={isUpdating}
                onClick={() => void removeFavorite(favorite.coin_id)}
                type="button"
              >
                Quitar
              </button>
            </article>
          );
        })}
      </div>
    </section>
  );
}

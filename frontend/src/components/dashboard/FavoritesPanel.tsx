import { useFavorites } from "../../features/favorites/FavoritesContext";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import EmptyState from "../ui/EmptyState";
import styles from "./FavoritesPanel.module.css";

export default function FavoritesPanel() {
  const { error, favorites, isLoading, removeFavorite, updatingCoinIds } =
    useFavorites();

  return (
    <details
      className={styles.panel}
      data-dashboard-accordion="true"
      id="favorites"
      open
    >
      <summary className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>Tu selección</span>
          <h2>Favoritos</h2>
        </div>
        <Badge>{favorites.length} guardados</Badge>
      </summary>

      {isLoading && <p className={styles.muted}>Cargando favoritos…</p>}
      {error && <p className={styles.errorMessage}>{error}</p>}
      {!isLoading && !error && favorites.length === 0 && (
        <EmptyState
          description="Agrega una moneda desde el mercado para verla aquí."
          title="Todavía no tenés favoritos."
        />
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
              <Button
                aria-label={`Quitar ${favorite.name} de favoritos`}
                disabled={isUpdating}
                onClick={() => void removeFavorite(favorite.coin_id)}
                variant="danger"
              >
                Quitar
              </Button>
            </article>
          );
        })}
      </div>
    </details>
  );
}

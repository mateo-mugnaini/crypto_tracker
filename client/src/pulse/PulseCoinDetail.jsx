import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../auth/AuthContext";
import { useFavorites } from "../features/favorites/FavoritesContext";
import { useMarket } from "../features/market/MarketContext";
import { useToast } from "../components/ui/ToastProvider";
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
        if (!controller.signal.aborted)
          setError(caughtError.message || "No se pudo cargar la moneda.");
      });
    return () => controller.abort();
  }, [coinId]);

  async function updatePrice() {
    if (!token) {
      showToast("Tu sesiÃ³n no estÃ¡ disponible. VolvÃ© a iniciar sesiÃ³n.", "error");
      return;
    }
    setIsUpdating(true);
    try {
      await api.updateCurrentPrice(coinId, token);
      await refresh();
      const response = await api.getCoin(coinId);
      setCoin(response.data);
      showToast("Precio actualizado.", "success");
    } catch (caughtError) {
      showToast(caughtError.message || "No se pudo actualizar el precio.", "error");
    } finally {
      setIsUpdating(false);
    }
  }

  return (
    <PulseShell title={coin?.name || "Moneda"}>
      <div className={styles.stack}>
        <Link className={styles.backLink} to="/market">
          ← Volver al mercado
        </Link>
        {error && <div className={styles.notice}>{error}</div>}
        {!coin && !error ? (
          <div className={styles.empty}>Cargando moneda…</div>
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
                      {isFavorite(coin.id) ? "★ En favoritos" : "☆ Agregar a favoritos"}
                    </button>
                    <button
                      className={styles.secondaryButton}
                      disabled={isUpdating}
                      onClick={() => void updatePrice()}
                      type="button"
                    >
                      {isUpdating ? "Actualizando…" : "Actualizar precio"}
                    </button>
                    <Link
                      className={styles.secondaryButton}
                      to={`/portfolio?coin=${coin.id}`}
                    >
                      Sumar a cartera
                    </Link>
                  </div>
                </div>
                <strong className={styles.detailPrice}>
                  {formatCurrency(coin.current_price)}
                </strong>
              </section>
              <section className={styles.infoGrid} aria-label="Datos de la moneda">
                <div className={styles.infoItem}>
                  <span>Última actualización</span>
                  <strong>{formatDate(coin.updated_at || coin.recorded_at)}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>Identificador</span>
                  <strong>{coin.id}</strong>
                </div>
                <div className={styles.infoItem}>
                  <span>Más información</span>
                  <Link className={styles.textLink} to={`/history?coin=${coin.id}`}>
                    Ver historial de precios
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

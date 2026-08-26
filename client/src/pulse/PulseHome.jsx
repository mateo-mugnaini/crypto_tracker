import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useFavorites } from "../features/favorites/FavoritesContext";
import { useMarket } from "../features/market/MarketContext";
import { usePortfolio } from "../features/portfolio/PortfolioContext";
import PulseShell from "./PulseShell";
import { displayName, formatCurrency, formatNumber, initials } from "./pulseUtils";
import styles from "./PulseViews.module.css";

export default function PulseHome() {
  const { user } = useAuth();
  const { coins, status } = useMarket();
  const { favorites } = useFavorites();
  const { portfolio } = usePortfolio();
  const favoriteCoins = favorites
    .map((favorite) => coins.find((coin) => coin.id === favorite.coin_id))
    .filter(Boolean)
    .slice(0, 3);
  const pricedCoins = coins.filter((coin) => coin.current_price !== null).length;

  return (
    <PulseShell title="Inicio">
      <div className={styles.stack}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>Tu resumen</p>
            <h2>Hola, {displayName(user)}.</h2>
            <p>Una mirada rápida a lo importante. El resto queda a un clic.</p>
          </div>
          <Link className={styles.heroAction} to="/market">
            Ver mercado
          </Link>
        </section>

        <section className={styles.metrics} aria-label="Resumen">
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Valor de cartera</span>
            <strong className={styles.metricValue}>
              {formatCurrency(portfolio?.total_current_value)}
            </strong>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Monedas disponibles</span>
            <strong className={styles.metricValue}>
              {status === "loading" ? "…" : formatNumber(coins.length, 0)}
            </strong>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>Favoritos</span>
            <strong className={styles.metricValue}>
              {formatNumber(favorites.length, 0)}
            </strong>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Para empezar</h2>
          </div>
          <div className={styles.quickLinks}>
            <Link className={styles.quickLink} to="/market">
              Explorar monedas
            </Link>
            <Link className={styles.quickLink} to="/portfolio">
              Cargar mi cartera
            </Link>
            <Link className={styles.quickLink} to="/favorites">
              Ver favoritos
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Favoritos recientes</h2>
            <Link to="/favorites">Ver todos</Link>
          </div>
          {favoriteCoins.length ? (
            <div className={styles.coinList}>
              {favoriteCoins.map((coin) => (
                <Link
                  className={styles.coinRow}
                  key={coin.id}
                  to={`/market/${coin.id}`}
                >
                  <span className={styles.coinIdentity}>
                    <span className={styles.coinIcon}>{initials(coin.symbol)}</span>
                    <span className={styles.coinName}>
                      <strong>{coin.name}</strong>
                      <span>{coin.symbol.toUpperCase()}</span>
                    </span>
                  </span>
                  <span className={styles.coinPrice}>
                    {formatCurrency(coin.current_price)}
                  </span>
                  <span className={styles.rowLink} aria-hidden="true">
                    Abrir
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              Marcá una moneda como favorita desde Mercado y aparecerá acá.
            </div>
          )}
        </section>

        <p className={styles.resultHint}>
          {pricedCoins} monedas tienen precio actualizado.
        </p>
      </div>
    </PulseShell>
  );
}

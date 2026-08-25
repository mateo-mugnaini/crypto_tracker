import { useMarket } from "../../features/market/MarketContext";
import CoinsPanel from "../../components/dashboard/CoinsPanel";
import FavoritesPanel from "../../components/dashboard/FavoritesPanel";
import PriceHistoryPanel from "../../components/dashboard/PriceHistoryPanel";
import PriceComparisonPanel from "../../components/dashboard/PriceComparisonPanel";
import PortfolioPanel from "../../components/dashboard/PortfolioPanel";
import Topbar from "../../components/dashboard/Topbar";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { coins, isAutoRefreshEnabled, lastUpdated, status } = useMarket();
  const pricedCoins = coins.filter((coin) => coin.current_price !== null).length;
  const syncLabel = status === "loading"
    ? "Actualizando mercado"
    : isAutoRefreshEnabled
      ? "Sincronización automática activa"
      : "Actualización manual disponible";

  return (
    <div className={styles.shell}>
      <Topbar />

      <div className={styles.content}>
        <main className={styles.dashboard}>
          <header className={styles.pageHeader} id="overview">
            <div>
              <span className={styles.eyebrow}>Overview / Market intelligence</span>
              <h1>Tu mercado, con contexto.</h1>
              <p>
                Una vista clara para seguir precios, detectar tendencias y
                entender qué está pasando con tus activos.
              </p>
            </div>
            <div className={styles.headerMeta}>
              <span className={styles.liveBadge}>
                <span /> {syncLabel}
              </span>
              <small>
                {lastUpdated
                  ? `Última lectura ${lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Esperando la primera lectura"}
              </small>
            </div>
          </header>

          <section className={styles.overviewGrid} aria-label="Resumen del mercado">
            <article className={`${styles.summaryCard} ${styles.summaryHighlight}`}>
              <span className={styles.summaryLabel}>Activos rastreados</span>
              <strong>{coins.length}</strong>
              <small>Monedas sincronizadas localmente</small>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Precios disponibles</span>
              <strong>{pricedCoins}<small> / {coins.length || "—"}</small></strong>
              <small>Último snapshot persistido</small>
            </article>
            <article className={styles.summaryCard}>
              <span className={styles.summaryLabel}>Señal de mercado</span>
              <strong className={styles.positiveValue}>●</strong>
              <small>Datos preparados para análisis</small>
            </article>
          </section>

          <div className={styles.dashboardGrid}>
            <PortfolioPanel />
            <CoinsPanel />
            <FavoritesPanel />
            <PriceHistoryPanel />
            <PriceComparisonPanel />
          </div>
        </main>
      </div>
    </div>
  );
}

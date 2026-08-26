import { useMarket } from "../../features/market/MarketContext";
import CoinsPanel from "../../components/dashboard/CoinsPanel";
import FavoritesPanel from "../../components/dashboard/FavoritesPanel";
import PortfolioPanel from "../../components/dashboard/PortfolioPanel";
import PriceComparisonPanel from "../../components/dashboard/PriceComparisonPanel";
import PriceHistoryPanel from "../../components/dashboard/PriceHistoryPanel";
import DashboardLayout from "./DashboardLayout";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { coins } = useMarket();
  const pricedCoins = coins.filter((coin) => coin.current_price !== null).length;

  return (
    <DashboardLayout
      description="Una vista clara para seguir precios, detectar tendencias y entender qué está pasando con tus activos."
      eyebrow="Overview / Market intelligence"
      title="Tu mercado, con contexto."
    >
      <section aria-label="Resumen del mercado" className={styles.overviewGrid}>
        <article className={`${styles.summaryCard} ${styles.summaryHighlight}`}>
          <span className={styles.summaryLabel}>Activos rastreados</span>
          <strong>{coins.length}</strong>
          <small>Monedas sincronizadas localmente</small>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Precios disponibles</span>
          <strong>
            {pricedCoins}
            <small> / {coins.length || "—"}</small>
          </strong>
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
    </DashboardLayout>
  );
}

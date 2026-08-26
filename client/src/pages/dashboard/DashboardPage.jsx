import { Link } from "react-router-dom";
import { useMarket } from "../../features/market/MarketContext";
import CoinsPanel from "../../components/dashboard/CoinsPanel";
import FavoritesPanel from "../../components/dashboard/FavoritesPanel";
import PortfolioPanel from "../../components/dashboard/PortfolioPanel";
import DashboardLayout from "./DashboardLayout";
import styles from "./DashboardPage.module.css";

function formatLastRead(value) {
  return value
    ? value.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })
    : "—";
}

export default function DashboardPage() {
  const { coins, lastUpdated } = useMarket();
  const pricedCoins = coins.filter((coin) => coin.current_price !== null).length;

  return (
    <DashboardLayout
      description="Consulta tus monedas, revisa tu cartera y encuentra lo importante sin recorrer varias pantallas."
      eyebrow="Resumen"
      title="Tu mercado, en claro."
    >
      <section aria-label="Resumen del mercado" className={styles.overviewGrid}>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Monedas disponibles</span>
          <strong>{coins.length}</strong>
          <small>Activos sincronizados</small>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Con precio actual</span>
          <strong>
            {pricedCoins}
            <small> / {coins.length || "—"}</small>
          </strong>
          <small>Datos listos para consultar</small>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>Última lectura</span>
          <strong>{formatLastRead(lastUpdated)}</strong>
          <small>{lastUpdated ? "Mercado actualizado" : "Esperando datos"}</small>
        </article>
      </section>

      <section aria-label="Accesos rápidos" className={styles.quickActions}>
        <span className={styles.quickActionsTitle}>¿Qué querés hacer?</span>
        <div>
          <Link className={styles.quickAction} to="/market">
            <strong>Buscar una moneda</strong>
            <span>Explorá precios y detalles</span>
          </Link>
          <Link className={styles.quickAction} to="/portfolio">
            <strong>Ver mi cartera</strong>
            <span>Revisá tu inversión</span>
          </Link>
          <Link className={styles.quickAction} to="/alerts">
            <strong>Crear una alerta</strong>
            <span>Recibí un aviso por precio</span>
          </Link>
        </div>
      </section>

      <div className={styles.dashboardGrid}>
        <PortfolioPanel />
        <CoinsPanel />
        <FavoritesPanel />
      </div>
    </DashboardLayout>
  );
}

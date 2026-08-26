import { useMarket } from "../../features/market/MarketContext";
import Topbar from "../../components/dashboard/Topbar";
import styles from "./DashboardPage.module.css";

export default function DashboardLayout({ children, description, eyebrow, title }) {
  const { isAutoRefreshEnabled, lastUpdated, liveStatus, status } = useMarket();
  const syncLabel =
    status === "loading"
      ? "Actualizando"
      : liveStatus === "connected"
        ? "En vivo"
        : liveStatus === "connecting"
          ? "Conectando"
          : liveStatus === "fallback"
            ? "Actualización alternativa"
            : isAutoRefreshEnabled
              ? "Actualización activa"
              : "Actualización manual";

  return (
    <div className={styles.shell}>
      <Topbar />
      <div className={styles.content}>
        <main className={styles.dashboard}>
          <header className={styles.pageHeader}>
            <div>
              <span className={styles.eyebrow}>{eyebrow}</span>
              <h1>{title}</h1>
              <p>{description}</p>
            </div>
            <div className={styles.headerMeta}>
              <span className={styles.liveBadge}>
                <span />
                {syncLabel}
              </span>
              <small>
                {lastUpdated
                  ? `Última lectura ${lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Sin lecturas todavía"}
              </small>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

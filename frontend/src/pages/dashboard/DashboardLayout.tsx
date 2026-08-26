import type { ReactNode } from "react";

import { useMarket } from "../../features/market/MarketContext";
import Topbar from "../../components/dashboard/Topbar";
import styles from "./DashboardPage.module.css";

interface DashboardLayoutProps {
  children: ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

export default function DashboardLayout({
  children,
  description,
  eyebrow,
  title,
}: DashboardLayoutProps) {
  const { isAutoRefreshEnabled, lastUpdated, status } = useMarket();
  const syncLabel =
    status === "loading"
      ? "Actualizando mercado"
      : isAutoRefreshEnabled
        ? "Sincronización automática activa"
        : "Actualización manual disponible";

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
                <span /> {syncLabel}
              </span>
              <small>
                {lastUpdated
                  ? `Última lectura ${lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}`
                  : "Esperando la primera lectura"}
              </small>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

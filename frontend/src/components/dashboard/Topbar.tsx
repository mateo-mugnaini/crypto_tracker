import { useAuth } from "../../auth/AuthContext";
import { useMarket } from "../../features/market/MarketContext";
import styles from "./Topbar.module.css";

export default function Topbar() {
  const { user, logout } = useAuth();
  const {
    autoRefreshIntervalMs,
    isAutoRefreshEnabled,
    lastUpdated,
    refresh,
    status,
  } = useMarket();
  const isRefreshing = status === "loading";

  return (
    <header className={styles.topbar}>
      <div className={styles.brandMark}>CT</div>
      <div>
        <strong>Crypto Tracker</strong>
        <span>Panel de mercado</span>
      </div>
      <div className={styles.actions}>
        {lastUpdated && (
          <span className={styles.lastUpdated}>
            Actualizado {lastUpdated.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })}
          </span>
        )}
        {isAutoRefreshEnabled && (
          <span className={styles.autoRefresh}>
            Auto lectura {Math.round(autoRefreshIntervalMs / 1000)}s
          </span>
        )}
        <span className={styles.userChip}>{user?.username}</span>
        <button
          className={styles.secondaryButton}
          disabled={isRefreshing}
          onClick={() => void refresh()}
          type="button"
        >
          {isRefreshing ? "Actualizando…" : "Refrescar"}
        </button>
        <button className={styles.secondaryButton} onClick={logout} type="button">
          Salir
        </button>
      </div>
    </header>
  );
}

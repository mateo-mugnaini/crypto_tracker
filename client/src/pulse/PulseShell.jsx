import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useMarket } from "../features/market/MarketContext";
import styles from "./PulseShell.module.css";

function formatUpdated(date) {
  if (!date) return "Sin sincronizar";
  return `Actualizado ${new Intl.DateTimeFormat("es", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date)}`;
}

function primaryClassName({ isActive }) {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;
}

export default function PulseShell({ children, title, description, actions }) {
  const { user, logout } = useAuth();
  const { lastUpdated, liveStatus, refresh } = useMarket();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    document.title = title ? `${title} · Pulso` : "Pulso · Seguimiento cripto";
  }, [title]);

  async function handleRefresh() {
    if (isRefreshing) return;
    setIsRefreshing(true);
    await refresh();
    setIsRefreshing(false);
  }

  const isToolRoute = ["/favorites", "/history", "/compare", "/alerts"].some((path) =>
    location.pathname.startsWith(path),
  );

  return (
    <div className={styles.app}>
      <header className={styles.header}>
        <div className={styles.headerInner}>
          <Link className={styles.brand} to="/dashboard" aria-label="Ir a inicio">
            <span className={styles.brandMark}>P</span>
            <span>Pulso</span>
          </Link>

          <nav className={styles.nav} aria-label="Navegación principal">
            <NavLink className={primaryClassName} to="/dashboard" end>
              Inicio
            </NavLink>
            <NavLink className={primaryClassName} to="/market">
              Mercado
            </NavLink>
            <NavLink className={primaryClassName} to="/portfolio">
              Cartera
            </NavLink>
            <details
              className={`${styles.more} ${isToolRoute ? styles.moreActive : ""}`}
            >
              <summary>Más</summary>
              <div className={styles.moreMenu}>
                <Link to="/favorites">Favoritos</Link>
                <Link to="/history">Historial</Link>
                <Link to="/compare">Comparar</Link>
                <Link to="/alerts">Alertas</Link>
              </div>
            </details>
          </nav>

          <div className={styles.account}>
            <span className={styles.userName}>{user?.username || "Mi cuenta"}</span>
            <button className={styles.logoutButton} onClick={logout} type="button">
              Salir
            </button>
          </div>
        </div>
      </header>

      <div className={styles.statusBar}>
        <span className={styles.statusText}>
          <span
            className={`${styles.statusDot} ${liveStatus === "connected" ? styles.statusLive : ""}`}
          />
          {liveStatus === "connected" ? "Datos en vivo" : formatUpdated(lastUpdated)}
        </span>
        <button
          className={styles.refreshButton}
          disabled={isRefreshing}
          onClick={handleRefresh}
          type="button"
        >
          {isRefreshing ? "Actualizando…" : "Actualizar"}
        </button>
      </div>

      <main className={styles.main}>
        {(title || description || actions) && (
          <div className={styles.pageHeading}>
            <div>
              {title && <h1>{title}</h1>}
              {description && <p>{description}</p>}
            </div>
            {actions && <div className={styles.pageActions}>{actions}</div>}
          </div>
        )}
        {children}
      </main>
    </div>
  );
}

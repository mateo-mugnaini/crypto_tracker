import { NavLink } from "react-router-dom";
import { useAuth } from "../../auth/AuthContext";
import { useMarket } from "../../features/market/MarketContext";
import { useOptionalAlerts } from "../../features/alerts/AlertsContext";
import styles from "./Topbar.module.css";

function NavIcon({ kind }) {
  const paths = {
    overview: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Zm10-7h6v-3h-6v3Z",
    portfolio: "M3 7h18v13H3V7Zm3-4h12l2 4H4l2-4Zm3 9h6m-6 4h4",
    market: "M4 18 9 12l4 4 7-9M4 20h16",
    favorites:
      "m12 20-1.45-1.32C5.4 14.36 2 11.28 2 7.5A4.5 4.5 0 0 1 6.5 3c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 15.5 3 4.5 4.5 0 0 1 20 7.5c0 3.78-3.4 6.86-8.55 11.18L12 20Z",
    history: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    compare: "M5 19V9m7 10V5m7 14v-7",
    alerts: "M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-4 13h-2",
  };

  return (
    <svg aria-hidden="true" className={styles.navIcon} fill="none" viewBox="0 0 24 24">
      <path
        d={paths[kind]}
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.8"
      />
    </svg>
  );
}

const primaryLinks = [
  ["/dashboard", "Resumen", "overview"],
  ["/market", "Mercado", "market"],
  ["/portfolio", "Cartera", "portfolio"],
  ["/favorites", "Favoritos", "favorites"],
];

const analysisLinks = [
  ["/history", "Historial", "history"],
  ["/compare", "Comparar", "compare"],
  ["/alerts", "Alertas", "alerts"],
];

const links = [...primaryLinks, ...analysisLinks];

function Brand() {
  return (
    <div className={styles.brand}>
      <span className={styles.brandMark}>C</span>
      <span>
        <strong>Crypto Tracker</strong>
        <small>Tu mercado, en claro</small>
      </span>
    </div>
  );
}

function NavigationLinks({ items, mobile = false }) {
  return items.map(([to, label, icon]) => (
    <NavLink
      className={({ isActive }) =>
        `${mobile ? styles.mobileNavLink : styles.navLink} ${isActive ? (mobile ? styles.mobileActiveLink : styles.activeLink) : ""}`
      }
      end={to === "/dashboard"}
      key={to}
      to={to}
    >
      <NavIcon kind={icon} />
      <span>{label}</span>
    </NavLink>
  ));
}

function ActionButtons() {
  const { logout, user } = useAuth();
  const { isAutoRefreshEnabled, refresh, status } = useMarket();
  const unreadCount = useOptionalAlerts()?.unreadCount ?? 0;
  const isRefreshing = status === "loading";

  return (
    <div className={styles.actions}>
      <span className={styles.userIdentity}>
        <span className={styles.avatar}>
          {user?.username?.slice(0, 1).toUpperCase()}
        </span>
        <span>
          <strong>{user?.username}</strong>
          <small>
            {isAutoRefreshEnabled ? "Actualización activa" : "Vista manual"}
          </small>
        </span>
      </span>
      <NavLink
        aria-label="Ver alertas"
        className={styles.notificationButton}
        title={unreadCount ? `${unreadCount} alertas nuevas` : "Ver alertas"}
        to="/alerts"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9m-4 13h-2"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        {unreadCount > 0 && (
          <span className={styles.notificationCount}>
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </NavLink>
      <button
        aria-label="Actualizar mercado"
        className={styles.iconButton}
        disabled={isRefreshing}
        onClick={() => void refresh()}
        type="button"
      >
        <svg aria-hidden="true" fill="none" viewBox="0 0 24 24">
          <path
            d="M20 11a8 8 0 0 0-14.9-3M4 5v4h4m-4 4a8 8 0 0 0 14.9 3M20 19v-4h-4"
            stroke="currentColor"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="1.8"
          />
        </svg>
        <span>{isRefreshing ? "Actualizando" : "Actualizar"}</span>
      </button>
      <button className={styles.logoutButton} onClick={logout} type="button">
        Salir
      </button>
    </div>
  );
}

export default function Topbar() {
  return (
    <div className={styles.navigationRoot}>
      <aside aria-label="Navegación principal" className={styles.sidebar}>
        <Brand />
        <div className={styles.navGroup}>
          <span className={styles.navLabel}>Navegar</span>
          <nav>
            <NavigationLinks items={primaryLinks} />
          </nav>
        </div>
        <div className={styles.navGroup}>
          <span className={styles.navLabel}>Herramientas</span>
          <nav>
            <NavigationLinks items={analysisLinks} />
          </nav>
        </div>
        <div className={styles.sidebarFooter}>
          <span className={styles.statusDot} />
          <span>
            <strong>Servicio conectado</strong>
            <small>Datos listos para consultar</small>
          </span>
        </div>
      </aside>
      <header className={styles.mobileHeader}>
        <Brand />
        <ActionButtons />
        <nav aria-label="Navegación móvil" className={styles.mobileNav}>
          <NavigationLinks items={links} mobile />
        </nav>
      </header>
      <div className={styles.desktopActions}>
        <ActionButtons />
      </div>
    </div>
  );
}

import { NavLink } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { useMarket } from "../../features/market/MarketContext";
import styles from "./Topbar.module.css";

function NavIcon({
  kind,
}: {
  kind: "overview" | "portfolio" | "market" | "favorites" | "history" | "compare";
}) {
  const paths = {
    overview: "M4 13h6V4H4v9Zm10 7h6V4h-6v16ZM4 20h6v-3H4v3Zm10-7h6v-3h-6v3Z",
    portfolio: "M3 7h18v13H3V7Zm3-4h12l2 4H4l2-4Zm3 9h6m-6 4h4",
    market: "M4 18 9 12l4 4 7-9M4 20h16",
    favorites:
      "m12 20-1.45-1.32C5.4 14.36 2 11.28 2 7.5A4.5 4.5 0 0 1 6.5 3c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 15.5 3 4.5 4.5 0 0 1 20 7.5c0 3.78-3.4 6.86-8.55 11.18L12 20Z",
    history: "M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
    compare: "M5 19V9m7 10V5m7 14v-7",
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

function ActionButtons() {
  const { logout, user } = useAuth();
  const { isAutoRefreshEnabled, refresh, status } = useMarket();
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
            {isAutoRefreshEnabled ? "Sincronización activa" : "Vista manual"}
          </small>
        </span>
      </span>
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

const links = [
  ["/dashboard", "Resumen", "overview"],
  ["/portfolio", "Mi cartera", "portfolio"],
  ["/market", "Mercado", "market"],
  ["/favorites", "Favoritos", "favorites"],
  ["/history", "Historial", "history"],
  ["/compare", "Comparativa", "compare"],
] as const;

export default function Topbar() {
  return (
    <div className={styles.navigationRoot}>
      <aside aria-label="Navegación principal" className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>C</span>
          <span>
            <strong>Crypto Tracker</strong>
            <small>Market intelligence</small>
          </span>
        </div>

        <div className={styles.navGroup}>
          <span className={styles.navLabel}>Workspace</span>
          <nav>
            {links.map(([to, label, icon]) => (
              <NavLink
                className={({ isActive }) =>
                  `${styles.navLink} ${isActive ? styles.activeLink : ""}`
                }
                end={to === "/dashboard"}
                key={to}
                to={to}
              >
                <NavIcon kind={icon} />
                <span>{label}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <span className={styles.statusDot} />
          <span>
            <strong>API conectada</strong>
            <small>Datos sincronizados</small>
          </span>
        </div>
      </aside>

      <header className={styles.mobileHeader}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>C</span>
          <span>
            <strong>Crypto Tracker</strong>
            <small>Market intelligence</small>
          </span>
        </div>
        <ActionButtons />
        <nav aria-label="Navegación móvil" className={styles.mobileNav}>
          {links.map(([to, label, icon]) => (
            <NavLink
              className={({ isActive }) =>
                `${styles.mobileNavLink} ${isActive ? styles.mobileActiveLink : ""}`
              }
              end={to === "/dashboard"}
              key={to}
              to={to}
            >
              <NavIcon kind={icon} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>
      </header>

      <div className={styles.desktopActions}>
        <ActionButtons />
      </div>
    </div>
  );
}

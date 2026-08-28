import { NavLink } from "react-router-dom";

import { useAuth } from "../../auth/AuthContext";
import { useMarket } from "../../features/market/MarketContext";
import { useOptionalAlerts } from "../../features/alerts/AlertsContext";
import { useI18n } from "../../i18n/I18nContext";
import LanguageSelector from "../ui/LanguageSelector";
import styles from "./Topbar.module.css";

function NavIcon({
  kind,
}: {
  kind:
    | "overview"
    | "portfolio"
    | "market"
    | "favorites"
    | "history"
    | "compare"
    | "alerts";
}) {
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

function ActionButtons() {
  const { logout, user } = useAuth();
  const { isAutoRefreshEnabled, refresh, status } = useMarket();
  const unreadCount = useOptionalAlerts()?.unreadCount ?? 0;
  const isRefreshing = status === "loading";
  const { t } = useI18n();

  return (
    <div className={styles.actions}>
      <span className={styles.userIdentity}>
        <span className={styles.avatar}>
          {user?.username?.slice(0, 1).toUpperCase()}
        </span>
        <span>
          <strong>{user?.username}</strong>
          <small>{isAutoRefreshEnabled ? t("active_sync") : t("manual_view")}</small>
        </span>
      </span>
      <NavLink
        aria-label={t("view_alerts")}
        className={styles.notificationButton}
        title={unreadCount ? t("new_alerts", { count: unreadCount }) : t("view_alerts")}
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
        aria-label={t("refresh_market")}
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
        <span>{isRefreshing ? t("refreshing") : t("refresh")}</span>
      </button>
      <button className={styles.logoutButton} onClick={logout} type="button">
        {t("logout")}
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
  ["/alerts", "Alertas", "alerts"],
] as const;

export default function Topbar() {
  const { t } = useI18n();
  return (
    <div className={styles.navigationRoot}>
      <aside aria-label={t("main_navigation")} className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>C</span>
          <span>
            <strong>Crypto Tracker</strong>
            <small>{t("market_intelligence")}</small>
          </span>
        </div>

        <div className={styles.navGroup}>
          <span className={styles.navLabel}>{t("workspace")}</span>
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
                <span>
                  {t(
                    {
                      Resumen: "nav_summary",
                      "Mi cartera": "nav_portfolio",
                      Mercado: "nav_market",
                      Favoritos: "nav_favorites",
                      Historial: "nav_history",
                      Comparativa: "nav_compare",
                      Alertas: "nav_alerts",
                    }[label],
                  )}
                </span>
              </NavLink>
            ))}
          </nav>
        </div>

        <div className={styles.sidebarFooter}>
          <span className={styles.statusDot} />
          <span>
            <strong>{t("api_connected")}</strong>
            <small>{t("synced_data")}</small>
          </span>
        </div>
      </aside>

      <header className={styles.mobileHeader}>
        <LanguageSelector />
        <div className={styles.brand}>
          <span className={styles.brandMark}>C</span>
          <span>
            <strong>Crypto Tracker</strong>
            <small>{t("market_intelligence")}</small>
          </span>
        </div>
        <ActionButtons />
        <nav aria-label={t("mobile_navigation")} className={styles.mobileNav}>
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
              <span>
                {t(
                  {
                    Resumen: "nav_summary",
                    "Mi cartera": "nav_portfolio",
                    Mercado: "nav_market",
                    Favoritos: "nav_favorites",
                    Historial: "nav_history",
                    Comparativa: "nav_compare",
                    Alertas: "nav_alerts",
                  }[label],
                )}
              </span>
            </NavLink>
          ))}
        </nav>
      </header>

      <div className={styles.desktopActions}>
        <LanguageSelector />
        <ActionButtons />
      </div>
    </div>
  );
}

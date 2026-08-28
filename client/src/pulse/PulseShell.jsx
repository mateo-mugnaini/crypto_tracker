import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useMarket } from "../features/market/MarketContext";
import styles from "./PulseShell.module.css";
import LanguageSelector from "../components/ui/LanguageSelector";
import { useI18n } from "../i18n/I18nContext";

function formatUpdated(date, locale) {
  if (!date) return null;
  return new Intl.DateTimeFormat(
    locale === "it" ? "it-IT" : locale === "en" ? "en-US" : "es-AR",
    {
      hour: "2-digit",
      minute: "2-digit",
    },
  ).format(date);
}

function primaryClassName({ isActive }) {
  return isActive ? `${styles.navLink} ${styles.navLinkActive}` : styles.navLink;
}

export default function PulseShell({ children, title, description, actions }) {
  const { user, logout } = useAuth();
  const { lastUpdated, liveStatus, refresh } = useMarket();
  const location = useLocation();
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { t, locale } = useI18n();

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
          <Link className={styles.brand} to="/dashboard" aria-label={t("go_home")}>
            <span className={styles.brandMark}>P</span>
            <span>Pulso</span>
          </Link>

          <nav className={styles.nav} aria-label={t("nav_main")}>
            <NavLink className={primaryClassName} to="/dashboard" end>
              {t("nav_home")}
            </NavLink>
            <NavLink className={primaryClassName} to="/market">
              {t("nav_market")}
            </NavLink>
            <NavLink className={primaryClassName} to="/portfolio">
              {t("nav_portfolio")}
            </NavLink>
            <details
              className={`${styles.more} ${isToolRoute ? styles.moreActive : ""}`}
            >
              <summary>{t("nav_more")}</summary>
              <div className={styles.moreMenu}>
                <Link to="/favorites">{t("nav_favorites")}</Link>
                <Link to="/history">{t("nav_history")}</Link>
                <Link to="/compare">{t("nav_compare")}</Link>
                <Link to="/alerts">{t("nav_alerts")}</Link>
              </div>
            </details>
          </nav>

          <div className={styles.account}>
            <span className={styles.userName}>{user?.username || t("account")}</span>
            <button className={styles.logoutButton} onClick={logout} type="button">
              {t("logout")}
            </button>
          </div>
        </div>
      </header>

      <div className={styles.statusBar}>
        <span className={styles.statusText}>
          <span
            className={`${styles.statusDot} ${liveStatus === "connected" ? styles.statusLive : ""}`}
          />
          {liveStatus === "connected"
            ? t("connected")
            : lastUpdated
              ? t("updated", { time: formatUpdated(lastUpdated, locale) })
              : t("not_synced")}
        </span>
        <button
          className={styles.refreshButton}
          disabled={isRefreshing}
          onClick={handleRefresh}
          type="button"
        >
          {isRefreshing ? t("refreshing") : t("refresh")}
        </button>
      </div>

      <main className={styles.main}>
        <div className={styles.languageControl}>
          <LanguageSelector />
        </div>
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

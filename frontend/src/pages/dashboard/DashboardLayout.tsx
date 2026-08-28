import type { ReactNode } from "react";

import { useMarket } from "../../features/market/MarketContext";
import { useI18n } from "../../i18n/I18nContext";
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
  const { isAutoRefreshEnabled, lastUpdated, liveStatus, status } = useMarket();
  const { locale, t } = useI18n();
  const dateLocale = locale === "it" ? "it-IT" : locale === "en" ? "en-US" : "es-AR";
  const syncLabel =
    status === "loading"
      ? t("refresh_market")
      : liveStatus === "connected"
        ? t("live_connected")
        : liveStatus === "connecting"
          ? t("live_connecting")
          : liveStatus === "fallback"
            ? "Polling fallback"
            : isAutoRefreshEnabled
              ? "Sincronización automática activa"
              : t("manual_view");

  return (
    <div className={styles.shell}>
      <Topbar />
      <div className={styles.content}>
        <main className={styles.dashboard}>
          <header className={styles.pageHeader}>
            <div>
              <span className={styles.eyebrow}>{t(eyebrow)}</span>
              <h1>{t(title)}</h1>
              <p>{t(description)}</p>
            </div>
            <div className={styles.headerMeta}>
              <span className={styles.liveBadge}>
                <span /> {syncLabel}
              </span>
              <small>
                {lastUpdated
                  ? t("last_reading", {
                      time: lastUpdated.toLocaleTimeString(dateLocale, {
                        hour: "2-digit",
                        minute: "2-digit",
                      }),
                    })
                  : t("not_synced")}
              </small>
            </div>
          </header>
          {children}
        </main>
      </div>
    </div>
  );
}

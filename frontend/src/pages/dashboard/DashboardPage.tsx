import { useMarket } from "../../features/market/MarketContext";
import { useI18n } from "../../i18n/I18nContext";
import CoinsPanel from "../../components/dashboard/CoinsPanel";
import FavoritesPanel from "../../components/dashboard/FavoritesPanel";
import PortfolioPanel from "../../components/dashboard/PortfolioPanel";
import PriceComparisonPanel from "../../components/dashboard/PriceComparisonPanel";
import PriceHistoryPanel from "../../components/dashboard/PriceHistoryPanel";
import DashboardLayout from "./DashboardLayout";
import styles from "./DashboardPage.module.css";

export default function DashboardPage() {
  const { coins } = useMarket();
  const pricedCoins = coins.filter((coin) => coin.current_price !== null).length;
  const { t } = useI18n();

  return (
    <DashboardLayout
      description="dashboard_description"
      eyebrow="dashboard_eyebrow"
      title="dashboard_title"
    >
      <section aria-label={t("market_summary")} className={styles.overviewGrid}>
        <article className={`${styles.summaryCard} ${styles.summaryHighlight}`}>
          <span className={styles.summaryLabel}>{t("tracked_assets")}</span>
          <strong>{coins.length}</strong>
          <small>{t("local_coins")}</small>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>{t("prices_available")}</span>
          <strong>
            {pricedCoins}
            <small> / {coins.length || "—"}</small>
          </strong>
          <small>{t("snapshot_saved")}</small>
        </article>
        <article className={styles.summaryCard}>
          <span className={styles.summaryLabel}>{t("market_signal")}</span>
          <strong className={styles.positiveValue}>●</strong>
          <small>{t("analysis_ready")}</small>
        </article>
      </section>

      <div className={styles.dashboardGrid}>
        <PortfolioPanel />
        <CoinsPanel />
        <FavoritesPanel />
        <PriceHistoryPanel />
        <PriceComparisonPanel />
      </div>
    </DashboardLayout>
  );
}

import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { useFavorites } from "../features/favorites/FavoritesContext";
import { useMarket } from "../features/market/MarketContext";
import { usePortfolio } from "../features/portfolio/PortfolioContext";
import { useI18n } from "../i18n/I18nContext";
import PulseShell from "./PulseShell";
import { displayName, formatCurrency, formatNumber, initials } from "./pulseUtils";
import styles from "./PulseViews.module.css";

export default function PulseHome() {
  const { user } = useAuth();
  const { coins, status } = useMarket();
  const { favorites } = useFavorites();
  const { portfolio } = usePortfolio();
  const { t } = useI18n();
  const favoriteCoins = favorites
    .map((favorite) => coins.find((coin) => coin.id === favorite.coin_id))
    .filter(Boolean)
    .slice(0, 3);
  const pricedCoins = coins.filter((coin) => coin.current_price !== null).length;

  return (
    <PulseShell title={t("home_title")}>
      <div className={styles.stack}>
        <section className={styles.hero}>
          <div>
            <p className={styles.eyebrow}>{t("home_eyebrow")}</p>
            <h2>{t("hello", { name: displayName(user) })}</h2>
            <p>{t("home_intro")}</p>
          </div>
          <Link className={styles.heroAction} to="/market">
            {t("view_market")}
          </Link>
        </section>

        <section className={styles.metrics} aria-label={t("home_eyebrow")}>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>{t("portfolio_value")}</span>
            <strong className={styles.metricValue}>
              {formatCurrency(portfolio?.total_current_value)}
            </strong>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>{t("available_coins")}</span>
            <strong className={styles.metricValue}>
              {status === "loading" ? "…" : formatNumber(coins.length, 0)}
            </strong>
          </div>
          <div className={styles.metric}>
            <span className={styles.metricLabel}>{t("favorites")}</span>
            <strong className={styles.metricValue}>
              {formatNumber(favorites.length, 0)}
            </strong>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t("get_started")}</h2>
          </div>
          <div className={styles.quickLinks}>
            <Link className={styles.quickLink} to="/market">
              {t("explore_coins")}
            </Link>
            <Link className={styles.quickLink} to="/portfolio">
              {t("load_portfolio")}
            </Link>
            <Link className={styles.quickLink} to="/favorites">
              {t("favorites")}
            </Link>
          </div>
        </section>

        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t("recent_favorites")}</h2>
            <Link to="/favorites">{t("view_all")}</Link>
          </div>
          {favoriteCoins.length ? (
            <div className={styles.coinList}>
              {favoriteCoins.map((coin) => (
                <Link
                  className={styles.coinRow}
                  key={coin.id}
                  to={`/market/${coin.id}`}
                >
                  <span className={styles.coinIdentity}>
                    <span className={styles.coinIcon}>{initials(coin.symbol)}</span>
                    <span className={styles.coinName}>
                      <strong>{coin.name}</strong>
                      <span>{coin.symbol.toUpperCase()}</span>
                    </span>
                  </span>
                  <span className={styles.coinPrice}>
                    {formatCurrency(coin.current_price)}
                  </span>
                  <span className={styles.rowLink} aria-hidden="true">
                    {t("open")}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>{t("favorite_empty")}</div>
          )}
        </section>

        <p className={styles.resultHint}>
          {t("updated_coins", { count: pricedCoins })}
        </p>
      </div>
    </PulseShell>
  );
}

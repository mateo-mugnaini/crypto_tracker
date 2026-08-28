import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMarket } from "../features/market/MarketContext";
import { usePortfolio } from "../features/portfolio/PortfolioContext";
import { useToast } from "../components/ui/ToastProvider";
import { useI18n } from "../i18n/I18nContext";
import PulseShell from "./PulseShell";
import { formatCurrency, formatNumber } from "./pulseUtils";
import styles from "./PulseViews.module.css";

export default function PulsePortfolio() {
  const { coins } = useMarket();
  const { portfolio, error, isLoading, isSaving, saveHolding, removeHolding } =
    usePortfolio();
  const { showToast } = useToast();
  const [searchParams] = useSearchParams();
  const [coinId, setCoinId] = useState(searchParams.get("coin") || "");
  const [quantity, setQuantity] = useState("");
  const [averageBuyPrice, setAverageBuyPrice] = useState("");
  const { t } = useI18n();

  useEffect(() => {
    const requestedCoin = searchParams.get("coin");
    if (requestedCoin) setCoinId(requestedCoin);
  }, [searchParams]);

  async function handleSubmit(event) {
    event.preventDefault();
    const selectedCoin = coins.find((coin) => coin.id === coinId);
    if (!selectedCoin) return;
    const saved = await saveHolding({
      coin_id: selectedCoin.id,
      quantity: Number(quantity),
      average_buy_price: Number(averageBuyPrice),
    });
    if (saved) {
      setQuantity("");
      setAverageBuyPrice("");
      showToast(t("position_saved"), "success");
    }
  }

  async function handleRemove(holding) {
    const removed = await removeHolding(holding.coin_id);
    if (removed)
      showToast(
        t("position_removed", { symbol: holding.symbol.toUpperCase() }),
        "success",
      );
  }

  return (
    <PulseShell description={t("portfolio_description")} title={t("portfolio_title")}>
      <div className={styles.stack}>
        <section
          className={styles.portfolioSummary}
          aria-label={t("portfolio_summary")}
        >
          <div className={styles.portfolioCard}>
            <span>{t("current_value")}</span>
            <strong>{formatCurrency(portfolio?.total_current_value)}</strong>
          </div>
          <div className={styles.portfolioCard}>
            <span>{t("invested")}</span>
            <strong>{formatCurrency(portfolio?.total_invested)}</strong>
          </div>
          <div className={styles.portfolioCard}>
            <span>{t("result")}</span>
            <strong
              className={
                (portfolio?.total_profit_loss || 0) >= 0
                  ? styles.positive
                  : styles.negative
              }
            >
              {formatCurrency(portfolio?.total_profit_loss)}
            </strong>
          </div>
        </section>

        <section className={styles.formPanel}>
          <h2>{t("new_position")}</h2>
          <p>{t("position_help")}</p>
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="portfolio-coin">{t("coin")}</label>
              <select
                id="portfolio-coin"
                onChange={(event) => setCoinId(event.target.value)}
                required
                value={coinId}
              >
                <option value="">{t("choose")}</option>
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name} ({coin.symbol.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="portfolio-quantity">{t("units")}</label>
              <input
                id="portfolio-quantity"
                min="0"
                onChange={(event) => setQuantity(event.target.value)}
                required
                step="any"
                type="number"
                value={quantity}
              />
            </div>
            <div className={styles.field}>
              <label htmlFor="portfolio-price">{t("average_price")}</label>
              <input
                id="portfolio-price"
                min="0"
                onChange={(event) => setAverageBuyPrice(event.target.value)}
                required
                step="any"
                type="number"
                value={averageBuyPrice}
              />
            </div>
            <button className={styles.primaryButton} disabled={isSaving} type="submit">
              {isSaving ? t("saving") : t("save")}
            </button>
          </form>
        </section>

        {error && <div className={styles.notice}>{error}</div>}
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t("my_positions")}</h2>
            <Link to="/history">{t("history_link")}</Link>
          </div>
          {isLoading && !portfolio ? (
            <div className={styles.empty}>{t("loading_portfolio")}</div>
          ) : portfolio?.holdings?.length ? (
            <div className={styles.holdingList}>
              {portfolio.holdings.map((holding) => (
                <div className={styles.holdingRow} key={holding.coin_id}>
                  <div>
                    <strong>
                      {holding.name} <span>({holding.symbol.toUpperCase()})</span>
                    </strong>
                    <span>
                      {formatNumber(holding.quantity)} unidades · promedio{" "}
                      {formatCurrency(holding.average_buy_price)}
                    </span>
                  </div>
                  <span className={styles.holdingValue}>
                    {formatCurrency(holding.current_value)}
                  </span>
                  <span
                    className={`${styles.holdingValue} ${(holding.profit_loss || 0) >= 0 ? styles.positive : styles.negative}`}
                  >
                    {formatCurrency(holding.profit_loss)}
                  </span>
                  <button
                    aria-label={`${t("delete_position")}: ${holding.name}`}
                    className={styles.iconButton}
                    onClick={() => void handleRemove(holding)}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>
              Todavía no cargaste posiciones. Podés empezar con el formulario de arriba.
            </div>
          )}
        </section>
      </div>
    </PulseShell>
  );
}

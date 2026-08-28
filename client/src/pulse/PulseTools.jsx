import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAlerts } from "../features/alerts/AlertsContext";
import { useFavorites } from "../features/favorites/FavoritesContext";
import { useMarket } from "../features/market/MarketContext";
import { useToast } from "../components/ui/ToastProvider";
import { useI18n } from "../i18n/I18nContext";
import PulseShell from "./PulseShell";
import { formatCurrency, formatDate, formatNumber, initials } from "./pulseUtils";
import styles from "./PulseViews.module.css";

export function PulseFavoritesPage() {
  const { coins } = useMarket();
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const { t } = useI18n();
  const favoriteCoins = favorites
    .map((favorite) => coins.find((coin) => coin.id === favorite.coin_id))
    .filter(Boolean);
  return (
    <PulseShell description={t("favorites_description")} title={t("favorites_title")}>
      {isLoading ? (
        <div className={styles.empty}>{t("loading_favorites")}</div>
      ) : favoriteCoins.length ? (
        <div className={styles.coinList}>
          {favoriteCoins.map((coin) => (
            <div className={styles.coinRow} key={coin.id}>
              <Link className={styles.coinIdentity} to={`/market/${coin.id}`}>
                <span className={styles.coinIcon}>{initials(coin.symbol)}</span>
                <span className={styles.coinName}>
                  <strong>{coin.name}</strong>
                  <span>{coin.symbol.toUpperCase()}</span>
                </span>
              </Link>
              <span className={styles.coinPrice}>
                {formatCurrency(coin.current_price)}
              </span>
              <button
                className={styles.iconButton}
                aria-label={`Quitar ${coin.name} de favoritos`}
                onClick={() => void removeFavorite(coin.id)}
                type="button"
              >
                ★
              </button>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>
          Todavía no guardaste favoritos. Explorá el{" "}
          <Link className={styles.textLink} to="/market">
            {t("nav_market")}
          </Link>{" "}
          para agregar alguno.
        </div>
      )}
    </PulseShell>
  );
}

export function PulseHistoryPage() {
  const { coins } = useMarket();
  const [searchParams, setSearchParams] = useSearchParams();
  const [coinId, setCoinId] = useState(searchParams.get("coin") || coins[0]?.id || "");
  const [history, setHistory] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [variation, setVariation] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { t } = useI18n();

  useEffect(() => {
    if (!coinId && coins[0]) setCoinId(coins[0].id);
  }, [coinId, coins]);

  useEffect(() => {
    if (!coinId) return undefined;
    const controller = new AbortController();
    setLoading(true);
    setError("");
    Promise.all([
      api.getPriceHistory(
        coinId,
        { limit: 10, offset: 0, sortBy: "recorded_at", sortOrder: "desc" },
        { signal: controller.signal },
      ),
      api.getPriceStatistics(coinId, { signal: controller.signal }),
      api.getPriceVariation(coinId, {}, { signal: controller.signal }),
    ])
      .then(([historyResponse, statisticsResponse, variationResponse]) => {
        setHistory(historyResponse);
        setStatistics(statisticsResponse);
        setVariation(variationResponse);
      })
      .catch((caughtError) => {
        if (!controller.signal.aborted)
          setError(caughtError.message || "No se pudo cargar el historial.");
      })
      .finally(() => {
        if (!controller.signal.aborted) setLoading(false);
      });
    return () => controller.abort();
  }, [coinId]);

  function selectCoin(event) {
    const nextCoin = event.target.value;
    setCoinId(nextCoin);
    setSearchParams({ coin: nextCoin });
  }

  const selectedCoin = coins.find((coin) => coin.id === coinId);
  return (
    <PulseShell description={t("history_description")} title={t("history_title")}>
      <div className={styles.stack}>
        <div className={styles.searchRow}>
          <div className={styles.field}>
            <label htmlFor="history-coin">{t("coin")}</label>
            <select id="history-coin" onChange={selectCoin} value={coinId}>
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        {error && <div className={styles.notice}>{error}</div>}
        {loading ? (
          <div className={styles.empty}>{t("loading_history")}</div>
        ) : (
          <>
            <section className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span>{t("coin")}</span>
                <strong>{selectedCoin?.name || coinId}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>{t("average")}</span>
                <strong>{formatCurrency(statistics?.average_price)}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>{t("variation")}</span>
                <strong
                  className={
                    variation?.trend === "down" ? styles.negative : styles.positive
                  }
                >
                  {variation?.percentage_change === null ||
                  variation?.percentage_change === undefined
                    ? "—"
                    : `${formatNumber(variation.percentage_change, 2)}%`}
                </strong>
              </div>
            </section>
            {history.length ? (
              <div className={styles.tableWrap}>
                <table className={styles.table}>
                  <thead>
                    <tr>
                      <th>{t("date")}</th>
                      <th>{t("price")}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((item) => (
                      <tr key={item.id || item.recorded_at}>
                        <td>{formatDate(item.recorded_at)}</td>
                        <td>{formatCurrency(item.price)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className={styles.empty}>{t("no_records")}</div>
            )}
          </>
        )}
      </div>
    </PulseShell>
  );
}

export function PulseComparePage() {
  const { coins } = useMarket();
  const [firstId, setFirstId] = useState(coins[0]?.id || "");
  const [secondId, setSecondId] = useState(coins[1]?.id || coins[0]?.id || "");
  const first = coins.find((coin) => coin.id === firstId);
  const second = coins.find((coin) => coin.id === secondId);
  const { t } = useI18n();
  const rows = useMemo(
    () => [
      [
        "Precio actual",
        formatCurrency(first?.current_price),
        formatCurrency(second?.current_price),
      ],
      [
        "Símbolo",
        first?.symbol?.toUpperCase() || "—",
        second?.symbol?.toUpperCase() || "—",
      ],
      [
        "Ranking",
        first?.market_cap_rank ? `#${first.market_cap_rank}` : "—",
        second?.market_cap_rank ? `#${second.market_cap_rank}` : "—",
      ],
    ],
    [first, second],
  );
  return (
    <PulseShell description={t("compare_description")} title={t("compare_title")}>
      <div className={styles.stack}>
        <div className={styles.searchRow}>
          <div className={styles.field}>
            <label htmlFor="compare-first">{t("first_coin")}</label>
            <select
              id="compare-first"
              onChange={(event) => setFirstId(event.target.value)}
              value={firstId}
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name}
                </option>
              ))}
            </select>
          </div>
          <div className={styles.field}>
            <label htmlFor="compare-second">{t("second_coin")}</label>
            <select
              id="compare-second"
              onChange={(event) => setSecondId(event.target.value)}
              value={secondId}
            >
              {coins.map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>{t("data")}</th>
                <th>{first?.name || "—"}</th>
                <th>{second?.name || "—"}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(([label, firstValue, secondValue]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td>{firstValue}</td>
                  <td>{secondValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </PulseShell>
  );
}

export function PulseAlertsPage() {
  const { coins } = useMarket();
  const {
    alerts,
    notifications,
    unreadCount,
    createAlert,
    toggleAlert,
    removeAlert,
    markAllNotificationsRead,
  } = useAlerts();
  const { showToast } = useToast();
  const [coinId, setCoinId] = useState("");
  const [condition, setCondition] = useState("above");
  const [targetPrice, setTargetPrice] = useState("");
  const [saving, setSaving] = useState(false);
  const { t } = useI18n();
  async function handleSubmit(event) {
    event.preventDefault();
    setSaving(true);
    try {
      await createAlert({
        coin_id: coinId,
        condition,
        target_price: Number(targetPrice),
      });
      setCoinId("");
      setTargetPrice("");
      showToast("Alerta creada.", "success");
    } catch (caughtError) {
      showToast(caughtError.message || "No se pudo crear la alerta.", "error");
    } finally {
      setSaving(false);
    }
  }
  return (
    <PulseShell description={t("alerts_description")} title={t("alerts_title")}>
      <div className={styles.stack}>
        <section className={styles.formPanel}>
          <h2>{t("new_alert")}</h2>
          <p>{t("alert_help")}</p>
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="alert-coin">{t("coin")}</label>
              <select
                id="alert-coin"
                onChange={(event) => setCoinId(event.target.value)}
                required
                value={coinId}
              >
                <option value="">{t("choose")}</option>
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="alert-condition">{t("condition")}</label>
              <select
                id="alert-condition"
                onChange={(event) => setCondition(event.target.value)}
                value={condition}
              >
                <option value="above">{t("above")}</option>
                <option value="below">{t("below")}</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="alert-price">{t("target_price")}</label>
              <input
                id="alert-price"
                min="0"
                onChange={(event) => setTargetPrice(event.target.value)}
                required
                step="any"
                type="number"
                value={targetPrice}
              />
            </div>
            <button className={styles.primaryButton} disabled={saving} type="submit">
              {saving ? t("creating") : t("create_alert")}
            </button>
          </form>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>{t("my_alerts")}</h2>
          </div>
          {alerts.length ? (
            <div className={styles.coinList}>
              {alerts.map((alert) => (
                <div className={styles.coinRow} key={alert.id}>
                  <div className={styles.coinName}>
                    <strong>
                      {alert.name} ({alert.symbol.toUpperCase()})
                    </strong>
                    <span>
                      {alert.condition === "above" ? "Sobre" : "Bajo"}{" "}
                      {formatCurrency(alert.target_price)} ·{" "}
                      {alert.is_active ? "Activa" : "Pausada"}
                    </span>
                  </div>
                  <span className={styles.coinActions}>
                    <button
                      className={styles.secondaryButton}
                      onClick={() => void toggleAlert(alert)}
                      type="button"
                    >
                      {alert.is_active ? "Pausar" : "Activar"}
                    </button>
                    <button
                      aria-label={`Eliminar alerta de ${alert.name}`}
                      className={styles.iconButton}
                      onClick={() => void removeAlert(alert.id)}
                      type="button"
                    >
                      ×
                    </button>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className={styles.empty}>{t("no_alerts")}</div>
          )}
        </section>
        {notifications.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>
                {t("notifications")} {unreadCount ? `(${unreadCount})` : ""}
              </h2>
              {unreadCount > 0 && (
                <button
                  className={styles.secondaryButton}
                  onClick={() => void markAllNotificationsRead()}
                  type="button"
                >
                  {t("mark_read")}
                </button>
              )}
            </div>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <tbody>
                  {notifications.slice(0, 5).map((notification) => (
                    <tr key={notification.id}>
                      <td>
                        {notification.title}
                        <br />
                        <span>{notification.message}</span>
                      </td>
                      <td>{formatDate(notification.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </PulseShell>
  );
}

export function PulseToolsPage() {
  const { t } = useI18n();
  return (
    <PulseShell description={t("tools_description")} title={t("tools_title")}>
      <div className={styles.toolList}>
        <Link className={styles.toolItem} to="/favorites">
          <span>
            <strong>{t("favorites_title")}</strong>
            <span>{t("tools_favorites")}</span>
          </span>
          <span className={styles.toolArrow}>→</span>
        </Link>
        <Link className={styles.toolItem} to="/history">
          <span>
            <strong>{t("history_title")}</strong>
            <span>{t("tools_history")}</span>
          </span>
          <span className={styles.toolArrow}>→</span>
        </Link>
        <Link className={styles.toolItem} to="/compare">
          <span>
            <strong>{t("compare_title")}</strong>
            <span>{t("tools_compare")}</span>
          </span>
          <span className={styles.toolArrow}>→</span>
        </Link>
        <Link className={styles.toolItem} to="/alerts">
          <span>
            <strong>{t("alerts_title")}</strong>
            <span>{t("tools_alerts")}</span>
          </span>
          <span className={styles.toolArrow}>→</span>
        </Link>
      </div>
    </PulseShell>
  );
}

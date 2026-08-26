import { useEffect, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { useAlerts } from "../features/alerts/AlertsContext";
import { useFavorites } from "../features/favorites/FavoritesContext";
import { useMarket } from "../features/market/MarketContext";
import { useToast } from "../components/ui/ToastProvider";
import PulseShell from "./PulseShell";
import { formatCurrency, formatDate, formatNumber, initials } from "./pulseUtils";
import styles from "./PulseViews.module.css";

export function PulseFavoritesPage() {
  const { coins } = useMarket();
  const { favorites, isLoading, removeFavorite } = useFavorites();
  const favoriteCoins = favorites
    .map((favorite) => coins.find((coin) => coin.id === favorite.coin_id))
    .filter(Boolean);
  return (
    <PulseShell description="Las monedas que querés tener a mano." title="Favoritos">
      {isLoading ? (
        <div className={styles.empty}>Cargando favoritos…</div>
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
            mercado
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
    <PulseShell
      description="Una lectura breve de los precios registrados."
      title="Historial"
    >
      <div className={styles.stack}>
        <div className={styles.searchRow}>
          <div className={styles.field}>
            <label htmlFor="history-coin">Moneda</label>
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
          <div className={styles.empty}>Cargando historial…</div>
        ) : (
          <>
            <section className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span>Moneda</span>
                <strong>{selectedCoin?.name || coinId}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Promedio registrado</span>
                <strong>{formatCurrency(statistics?.average_price)}</strong>
              </div>
              <div className={styles.infoItem}>
                <span>Variación</span>
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
                      <th>Fecha</th>
                      <th>Precio</th>
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
              <div className={styles.empty}>No hay registros para esta moneda.</div>
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
    <PulseShell
      description="Poné dos monedas lado a lado, sin gráficos ni ruido."
      title="Comparar"
    >
      <div className={styles.stack}>
        <div className={styles.searchRow}>
          <div className={styles.field}>
            <label htmlFor="compare-first">Primera moneda</label>
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
            <label htmlFor="compare-second">Segunda moneda</label>
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
                <th>Dato</th>
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
    <PulseShell
      description="Recibí un aviso cuando una moneda cruce el precio que elijas."
      title="Alertas"
    >
      <div className={styles.stack}>
        <section className={styles.formPanel}>
          <h2>Nueva alerta</h2>
          <p>La alerta queda guardada en tu cuenta.</p>
          <form className={styles.formGrid} onSubmit={handleSubmit}>
            <div className={styles.field}>
              <label htmlFor="alert-coin">Moneda</label>
              <select
                id="alert-coin"
                onChange={(event) => setCoinId(event.target.value)}
                required
                value={coinId}
              >
                <option value="">Elegir…</option>
                {coins.map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="alert-condition">Cuando esté</label>
              <select
                id="alert-condition"
                onChange={(event) => setCondition(event.target.value)}
                value={condition}
              >
                <option value="above">Por encima de</option>
                <option value="below">Por debajo de</option>
              </select>
            </div>
            <div className={styles.field}>
              <label htmlFor="alert-price">Precio USD</label>
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
              {saving ? "Guardando…" : "Crear alerta"}
            </button>
          </form>
        </section>
        <section className={styles.section}>
          <div className={styles.sectionHeader}>
            <h2>Mis alertas</h2>
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
            <div className={styles.empty}>No tenés alertas creadas.</div>
          )}
        </section>
        {notifications.length > 0 && (
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <h2>Notificaciones {unreadCount ? `(${unreadCount})` : ""}</h2>
              {unreadCount > 0 && (
                <button
                  className={styles.secondaryButton}
                  onClick={() => void markAllNotificationsRead()}
                  type="button"
                >
                  Marcar leídas
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
  return (
    <PulseShell
      description="Funciones útiles cuando necesitás ir un poco más allá."
      title="Más herramientas"
    >
      <div className={styles.toolList}>
        <Link className={styles.toolItem} to="/favorites">
          <span>
            <strong>Favoritos</strong>
            <span>Guardá monedas para volver rápido.</span>
          </span>
          <span className={styles.toolArrow}>→</span>
        </Link>
        <Link className={styles.toolItem} to="/history">
          <span>
            <strong>Historial</strong>
            <span>Revisá precios registrados.</span>
          </span>
          <span className={styles.toolArrow}>→</span>
        </Link>
        <Link className={styles.toolItem} to="/compare">
          <span>
            <strong>Comparar</strong>
            <span>Mirá dos monedas juntas.</span>
          </span>
          <span className={styles.toolArrow}>→</span>
        </Link>
        <Link className={styles.toolItem} to="/alerts">
          <span>
            <strong>Alertas</strong>
            <span>Recibí avisos de precio.</span>
          </span>
          <span className={styles.toolArrow}>→</span>
        </Link>
      </div>
    </PulseShell>
  );
}

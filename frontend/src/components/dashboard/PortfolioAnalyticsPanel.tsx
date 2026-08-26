import { useEffect, useMemo, useState } from "react";

import { ApiError, api, isRequestCancelled } from "../../api/client";
import type { PortfolioAnalytics } from "../../api/types";
import { useAuth } from "../../auth/AuthContext";
import { useMarket } from "../../features/market/MarketContext";
import styles from "./PortfolioAnalyticsPanel.module.css";

const WIDTH = 760;
const HEIGHT = 280;
const PAD = { top: 24, right: 24, bottom: 42, left: 72 };
const money = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

function formatMoney(value: number | null) {
  return value === null ? "—" : money.format(value);
}

function formatPercent(value: number | null) {
  return value === null ? "—" : `${value >= 0 ? "+" : ""}${value.toFixed(2)}%`;
}

function csvCell(value: string | number | null) {
  const text = value === null ? "" : String(value);
  return `"${text.replaceAll('"', '""')}"`;
}

export default function PortfolioAnalyticsPanel() {
  const { token } = useAuth();
  const { coins } = useMarket();
  const [days, setDays] = useState(30);
  const [benchmark, setBenchmark] = useState("");
  const [analytics, setAnalytics] = useState<PortfolioAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadAnalytics = async () => {
    if (!token) return;
    setIsLoading(true);
    setError(null);
    try {
      setAnalytics(
        await api.getPortfolioAnalytics(days, token, benchmark || undefined),
      );
    } catch (caughtError) {
      if (!isRequestCancelled(caughtError)) {
        setError(
          caughtError instanceof ApiError
            ? caughtError.message
            : "No se pudo cargar la analítica.",
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void loadAnalytics();
    // La carga es manual después de cambiar período para evitar peticiones por cada snapshot live.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  const chart = useMemo(() => {
    const points = analytics?.points || [];
    if (!points.length) return null;
    const values = points.map((point) => point.value);
    const maximum = Math.max(...values, ...points.map((point) => point.invested), 1);
    const minimum = Math.min(...values, ...points.map((point) => point.invested), 0);
    const range = maximum - minimum || 1;
    const width = WIDTH - PAD.left - PAD.right;
    const height = HEIGHT - PAD.top - PAD.bottom;
    const pointAt = (value: number, index: number) =>
      `${PAD.left + (index / Math.max(points.length - 1, 1)) * width},${PAD.top + height - ((value - minimum) / range) * height}`;
    return {
      valuePoints: points.map((point, index) => pointAt(point.value, index)).join(" "),
      investedPoints: points
        .map((point, index) => pointAt(point.invested, index))
        .join(" "),
      maximum,
      minimum,
    };
  }, [analytics]);

  const downloadCsv = () => {
    if (!analytics) return;
    const rows = [
      ["timestamp", "portfolio_value_usd", "invested_usd"],
      ...analytics.points.map((point) => [
        point.timestamp,
        point.value,
        point.invested,
      ]),
    ];
    const blob = new Blob([rows.map((row) => row.map(csvCell).join(",")).join("\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `crypto-tracker-cartera-${analytics.period_days}d.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <section className={styles.panel}>
      <div className={styles.header}>
        <div>
          <span className={styles.eyebrow}>Personal analytics</span>
          <h2>Cómo evoluciona tu cartera</h2>
          <p>
            Las cifras usan tus operaciones y los snapshots guardados; no son una
            recomendación financiera.
          </p>
        </div>
        <div className={styles.controls}>
          <label>
            Período
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
            >
              <option value={7}>7 días</option>
              <option value={30}>30 días</option>
              <option value={90}>90 días</option>
            </select>
          </label>
          <label>
            Comparar con
            <select
              value={benchmark}
              onChange={(event) => setBenchmark(event.target.value)}
            >
              <option value="">Sin benchmark</option>
              {coins
                .filter((coin) => coin.id === "bitcoin" || coin.id === "ethereum")
                .map((coin) => (
                  <option key={coin.id} value={coin.id}>
                    {coin.name}
                  </option>
                ))}
            </select>
          </label>
          <button onClick={() => void loadAnalytics()} type="button">
            {isLoading ? "Cargando…" : "Actualizar"}
          </button>
        </div>
      </div>

      {error && <p className={styles.error}>{error}</p>}
      {analytics && (
        <>
          <div className={styles.metrics}>
            <div>
              <span>Variación del valor</span>
              <strong>{formatPercent(analytics.total_return_percentage)}</strong>
            </div>
            <div>
              <span>Drawdown máximo</span>
              <strong>{formatPercent(analytics.max_drawdown_percentage)}</strong>
            </div>
            <div>
              <span>Volatilidad descriptiva</span>
              <strong>{formatPercent(analytics.volatility_percentage)}</strong>
            </div>
            <div>
              <span>Snapshots</span>
              <strong>{analytics.points.length}</strong>
            </div>
          </div>

          {chart ? (
            <div className={styles.chartBlock}>
              <div className={styles.chartLegend}>
                <span>
                  <i className={styles.valueLegend} />
                  Valor de cartera
                </span>
                <span>
                  <i className={styles.investedLegend} />
                  Costo invertido
                </span>
                {analytics.benchmark_coin_id && (
                  <span>Benchmark: {analytics.benchmark_coin_id}</span>
                )}
              </div>
              <svg
                aria-label="Evolución del valor de la cartera"
                className={styles.chart}
                role="img"
                viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
              >
                <line
                  className={styles.axis}
                  x1={PAD.left}
                  x2={PAD.left}
                  y1={PAD.top}
                  y2={HEIGHT - PAD.bottom}
                />
                <line
                  className={styles.axis}
                  x1={PAD.left}
                  x2={WIDTH - PAD.right}
                  y1={HEIGHT - PAD.bottom}
                  y2={HEIGHT - PAD.bottom}
                />
                <text className={styles.axisLabel} x={PAD.left - 8} y={PAD.top + 4}>
                  {formatMoney(chart.maximum)}
                </text>
                <text
                  className={styles.axisLabel}
                  x={PAD.left - 8}
                  y={HEIGHT - PAD.bottom}
                >
                  {formatMoney(chart.minimum)}
                </text>
                <polyline
                  className={styles.valueLine}
                  fill="none"
                  points={chart.valuePoints}
                />
                <polyline
                  className={styles.investedLine}
                  fill="none"
                  points={chart.investedPoints}
                />
              </svg>
            </div>
          ) : (
            <p className={styles.empty}>
              Todavía no hay snapshots suficientes para dibujar la evolución.
            </p>
          )}

          <div className={styles.tableHeader}>
            <h3>Detalle por activo</h3>
            <button onClick={downloadCsv} type="button">
              Descargar CSV
            </button>
          </div>
          {analytics.assets.length === 0 ? (
            <p className={styles.empty}>
              Registrá al menos una operación para ver el análisis.
            </p>
          ) : (
            <div className={styles.tableWrapper}>
              <table>
                <caption className={styles.visuallyHidden}>
                  Rendimiento actual de cada activo de la cartera
                </caption>
                <thead>
                  <tr>
                    <th>Activo</th>
                    <th>Invertido</th>
                    <th>Valor actual</th>
                    <th>Resultado</th>
                    <th>Distribución</th>
                  </tr>
                </thead>
                <tbody>
                  {analytics.assets.map((asset) => (
                    <tr key={asset.coin_id}>
                      <th scope="row">
                        {asset.name} <small>{asset.symbol.toUpperCase()}</small>
                      </th>
                      <td>{formatMoney(asset.invested)}</td>
                      <td>{formatMoney(asset.current_value)}</td>
                      <td
                        className={
                          asset.profit_loss !== null && asset.profit_loss >= 0
                            ? styles.positive
                            : styles.negative
                        }
                      >
                        {formatMoney(asset.profit_loss)}{" "}
                        <small>{formatPercent(asset.profit_loss_percentage)}</small>
                      </td>
                      <td>{formatPercent(asset.allocation_percentage)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </section>
  );
}

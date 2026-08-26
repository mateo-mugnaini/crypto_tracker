import { useEffect, useState } from "react";

import { ApiError, api, isRequestCancelled } from "../../api/client";
import type { PriceHistoryRecord } from "../../api/types";
import { useMarket } from "../../features/market/MarketContext";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Field from "../ui/Field";
import ComparisonChart, { type ComparisonSeries } from "./ComparisonChart";
import styles from "./PriceComparisonPanel.module.css";

const SERIES_COLORS = ["#19C6D3", "#7CE38B"];
const HISTORY_LIMIT = 60;

function getErrorMessage(caughtError: unknown) {
  return caughtError instanceof ApiError
    ? caughtError.message
    : "No se pudo cargar la comparación.";
}

function getPercentageChange(records: PriceHistoryRecord[]) {
  if (records.length < 2 || records[0].price === 0) return null;

  const ordered = [...records].sort(
    (left, right) =>
      new Date(left.recorded_at).getTime() - new Date(right.recorded_at).getTime(),
  );
  const initial = ordered[0].price;
  const final = ordered[ordered.length - 1].price;

  return ((final - initial) / initial) * 100;
}

export default function PriceComparisonPanel() {
  const {
    coins,
    error: marketError,
    lastUpdated,
    loadCoins,
    status: marketStatus,
  } = useMarket();
  const [firstCoinId, setFirstCoinId] = useState("");
  const [secondCoinId, setSecondCoinId] = useState("");
  const [series, setSeries] = useState<ComparisonSeries[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isCoinsLoading = marketStatus === "idle" || marketStatus === "loading";

  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);

  useEffect(() => {
    setFirstCoinId((current) => current || coins[0]?.id || "");
    setSecondCoinId(
      (current) => current || coins.find((coin) => coin.id !== coins[0]?.id)?.id || "",
    );
  }, [coins]);

  useEffect(() => {
    if (!firstCoinId || !secondCoinId || firstCoinId === secondCoinId) {
      setSeries([]);
      return;
    }

    let cancelled = false;
    const controller = new AbortController();
    setIsLoading(true);
    setError(null);

    Promise.all([
      api.getPriceHistory(
        firstCoinId,
        {
          limit: HISTORY_LIMIT,
          sortBy: "recorded_at",
          sortOrder: "asc",
        },
        { signal: controller.signal },
      ),
      api.getPriceHistory(
        secondCoinId,
        {
          limit: HISTORY_LIMIT,
          sortBy: "recorded_at",
          sortOrder: "asc",
        },
        { signal: controller.signal },
      ),
    ])
      .then(([firstHistory, secondHistory]) => {
        if (cancelled) return;

        const firstCoin = coins.find((coin) => coin.id === firstCoinId);
        const secondCoin = coins.find((coin) => coin.id === secondCoinId);

        setSeries([
          {
            color: SERIES_COLORS[0],
            label: firstCoin?.symbol.toUpperCase() || firstCoinId,
            records: firstHistory,
          },
          {
            color: SERIES_COLORS[1],
            label: secondCoin?.symbol.toUpperCase() || secondCoinId,
            records: secondHistory,
          },
        ]);
      })
      .catch((caughtError) => {
        controller.abort();
        if (!cancelled && !isRequestCancelled(caughtError)) {
          setError(getErrorMessage(caughtError));
          setSeries([]);
        }
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [coins, firstCoinId, lastUpdated, secondCoinId]);

  function handleFirstCoinChange(value: string) {
    setFirstCoinId(value);
    if (value === secondCoinId) {
      setSecondCoinId(coins.find((coin) => coin.id !== value)?.id || "");
    }
  }

  const firstChange = getPercentageChange(series[0]?.records || []);
  const secondChange = getPercentageChange(series[1]?.records || []);

  return (
    <details className={styles.panel} data-dashboard-accordion="true" id="compare" open>
      <summary className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>Comparativa</span>
          <h2>Dos monedas, una tendencia</h2>
        </div>
        <Badge>Últimos {HISTORY_LIMIT} registros</Badge>
      </summary>

      {(marketError || error) && (
        <div className={styles.errorState}>
          <Alert tone="error">{marketError || error}</Alert>
          {marketError && (
            <Button onClick={() => void loadCoins(true)} variant="secondary">
              Reintentar
            </Button>
          )}
        </div>
      )}

      <div className={styles.selectGrid}>
        <Field id="comparison-first-coin" label="Primera moneda">
          <select
            disabled={isCoinsLoading || coins.length < 2}
            id="comparison-first-coin"
            onChange={(event) => handleFirstCoinChange(event.target.value)}
            value={firstCoinId}
          >
            {coins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </Field>
        <Field id="comparison-second-coin" label="Segunda moneda">
          <select
            disabled={isCoinsLoading || coins.length < 2}
            id="comparison-second-coin"
            onChange={(event) => setSecondCoinId(event.target.value)}
            value={secondCoinId}
          >
            {coins
              .filter((coin) => coin.id !== firstCoinId)
              .map((coin) => (
                <option key={coin.id} value={coin.id}>
                  {coin.name} ({coin.symbol.toUpperCase()})
                </option>
              ))}
          </select>
        </Field>
      </div>

      {isLoading && <p className={styles.muted}>Cargando comparación…</p>}
      {!isLoading && coins.length < 2 && (
        <p className={styles.muted}>
          Necesitás al menos dos monedas sincronizadas para comparar.
        </p>
      )}

      {series.length === 2 && (
        <div className={styles.changeGrid}>
          <div>
            <span>{series[0].label}</span>
            <strong
              className={
                firstChange !== null && firstChange >= 0 ? styles.up : styles.down
              }
            >
              {firstChange === null
                ? "—"
                : `${firstChange >= 0 ? "+" : ""}${firstChange.toFixed(2)}%`}
            </strong>
          </div>
          <div>
            <span>{series[1].label}</span>
            <strong
              className={
                secondChange !== null && secondChange >= 0 ? styles.up : styles.down
              }
            >
              {secondChange === null
                ? "—"
                : `${secondChange >= 0 ? "+" : ""}${secondChange.toFixed(2)}%`}
            </strong>
          </div>
        </div>
      )}

      <ComparisonChart series={series} />
    </details>
  );
}

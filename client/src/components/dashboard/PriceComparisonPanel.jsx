import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ApiError, api, isRequestCancelled } from "../../api/client";
import { useMarket } from "../../features/market/MarketContext";
import Alert from "../ui/Alert";
import Badge from "../ui/Badge";
import Button from "../ui/Button";
import Field from "../ui/Field";
import ComparisonChart from "./ComparisonChart";
import styles from "./PriceComparisonPanel.module.css";
const SERIES_COLORS = ["#19C6D3", "#7CE38B"];
const HISTORY_LIMIT = 60;
function getErrorMessage(caughtError) {
  return caughtError instanceof ApiError
    ? caughtError.message
    : "No se pudo cargar la comparación.";
}
function getPercentageChange(records) {
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
  const [series, setSeries] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
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
  function handleFirstCoinChange(value) {
    setFirstCoinId(value);
    if (value === secondCoinId) {
      setSecondCoinId(coins.find((coin) => coin.id !== value)?.id || "");
    }
  }
  const firstChange = getPercentageChange(series[0]?.records || []);
  const secondChange = getPercentageChange(series[1]?.records || []);
  return _jsxs("details", {
    "aria-busy": isLoading || isCoinsLoading,
    className: styles.panel,
    "data-dashboard-accordion": "true",
    id: "compare",
    open: true,
    children: [
      _jsxs("summary", {
        className: styles.sectionHeading,
        children: [
          _jsxs("div", {
            children: [
              _jsx("span", { className: styles.eyebrow, children: "Comparativa" }),
              _jsx("h2", { children: "Dos monedas, una tendencia" }),
            ],
          }),
          _jsxs(Badge, { children: ["\u00DAltimos ", HISTORY_LIMIT, " registros"] }),
        ],
      }),
      (marketError || error) &&
        _jsxs("div", {
          className: styles.errorState,
          children: [
            _jsx(Alert, { tone: "error", children: marketError || error }),
            marketError &&
              _jsx(Button, {
                onClick: () => void loadCoins(true),
                variant: "secondary",
                children: "Reintentar",
              }),
          ],
        }),
      _jsxs("div", {
        className: styles.selectGrid,
        children: [
          _jsx(Field, {
            id: "comparison-first-coin",
            label: "Primera moneda",
            children: _jsx("select", {
              disabled: isCoinsLoading || coins.length < 2,
              id: "comparison-first-coin",
              onChange: (event) => handleFirstCoinChange(event.target.value),
              value: firstCoinId,
              children: coins.map((coin) =>
                _jsxs(
                  "option",
                  {
                    value: coin.id,
                    children: [coin.name, " (", coin.symbol.toUpperCase(), ")"],
                  },
                  coin.id,
                ),
              ),
            }),
          }),
          _jsx(Field, {
            id: "comparison-second-coin",
            label: "Segunda moneda",
            children: _jsx("select", {
              disabled: isCoinsLoading || coins.length < 2,
              id: "comparison-second-coin",
              onChange: (event) => setSecondCoinId(event.target.value),
              value: secondCoinId,
              children: coins
                .filter((coin) => coin.id !== firstCoinId)
                .map((coin) =>
                  _jsxs(
                    "option",
                    {
                      value: coin.id,
                      children: [coin.name, " (", coin.symbol.toUpperCase(), ")"],
                    },
                    coin.id,
                  ),
                ),
            }),
          }),
        ],
      }),
      isLoading &&
        _jsx("p", {
          className: styles.muted,
          children: "Cargando comparaci\u00F3n\u2026",
        }),
      !isLoading &&
        coins.length < 2 &&
        _jsx("p", {
          className: styles.muted,
          children: "Necesit\u00E1s al menos dos monedas sincronizadas para comparar.",
        }),
      series.length === 2 &&
        _jsxs("div", {
          className: styles.changeGrid,
          children: [
            _jsxs("div", {
              children: [
                _jsx("span", { children: series[0].label }),
                _jsx("strong", {
                  className:
                    firstChange !== null && firstChange >= 0 ? styles.up : styles.down,
                  children:
                    firstChange === null
                      ? "—"
                      : `${firstChange >= 0 ? "+" : ""}${firstChange.toFixed(2)}%`,
                }),
              ],
            }),
            _jsxs("div", {
              children: [
                _jsx("span", { children: series[1].label }),
                _jsx("strong", {
                  className:
                    secondChange !== null && secondChange >= 0
                      ? styles.up
                      : styles.down,
                  children:
                    secondChange === null
                      ? "—"
                      : `${secondChange >= 0 ? "+" : ""}${secondChange.toFixed(2)}%`,
                }),
              ],
            }),
          ],
        }),
      _jsx(ComparisonChart, { series: series }),
    ],
  });
}

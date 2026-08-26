import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from "react";
import { ApiError, api, isRequestCancelled } from "../../api/client";
import { useMarket } from "../../features/market/MarketContext";
import PriceHistoryChart from "./PriceHistoryChart";
import styles from "./PriceHistoryPanel.module.css";
const PAGE_SIZE = 10;
const initialFilters = {
  startDate: "",
  endDate: "",
  minPrice: "",
  maxPrice: "",
  sortBy: "recorded_at",
  sortOrder: "desc",
};
const moneyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});
function formatPrice(price) {
  return price === null ? "—" : moneyFormatter.format(price);
}
function formatRecordedAt(value) {
  return new Date(value).toLocaleString("es-AR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}
function getErrorMessage(caughtError) {
  return caughtError instanceof ApiError
    ? caughtError.message
    : "No se pudo cargar el historial de precios.";
}
export default function PriceHistoryPanel({ initialCoinId = "" }) {
  const {
    coins,
    error: coinError,
    lastUpdated,
    loadCoins,
    status: marketStatus,
  } = useMarket();
  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [records, setRecords] = useState([]);
  const [statistics, setStatistics] = useState(null);
  const [variation, setVariation] = useState(null);
  const [filters, setFilters] = useState(initialFilters);
  const [draftFilters, setDraftFilters] = useState(initialFilters);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(null);
  const isCoinsLoading = marketStatus === "idle" || marketStatus === "loading";
  useEffect(() => {
    void loadCoins();
  }, [loadCoins]);
  useEffect(() => {
    setSelectedCoinId((current) => current || initialCoinId || coins[0]?.id || "");
  }, [coins, initialCoinId]);
  useEffect(() => {
    if (!selectedCoinId) {
      return;
    }
    let cancelled = false;
    const controller = new AbortController();
    setIsHistoryLoading(true);
    setHistoryError(null);
    Promise.all([
      api.getPriceHistory(
        selectedCoinId,
        {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
          minPrice: filters.minPrice || undefined,
          maxPrice: filters.maxPrice || undefined,
          limit: PAGE_SIZE + 1,
          offset: page * PAGE_SIZE,
          sortBy: filters.sortBy,
          sortOrder: filters.sortOrder,
        },
        { signal: controller.signal },
      ),
      api.getPriceStatistics(selectedCoinId, { signal: controller.signal }),
      api.getPriceVariation(
        selectedCoinId,
        {
          startDate: filters.startDate || undefined,
          endDate: filters.endDate || undefined,
        },
        { signal: controller.signal },
      ),
    ])
      .then(([historyResponse, statisticsResponse, variationResponse]) => {
        if (cancelled) return;
        setRecords(historyResponse.slice(0, PAGE_SIZE));
        setHasNextPage(historyResponse.length > PAGE_SIZE);
        setStatistics(statisticsResponse);
        setVariation(variationResponse);
      })
      .catch((caughtError) => {
        controller.abort();
        if (!cancelled && !isRequestCancelled(caughtError)) {
          setHistoryError(getErrorMessage(caughtError));
          setRecords([]);
          setHasNextPage(false);
        }
      })
      .finally(() => {
        if (!cancelled) setIsHistoryLoading(false);
      });
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [filters, lastUpdated, page, selectedCoinId]);
  function updateDraftFilter(key, value) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }
  function handleFilterSubmit(event) {
    event.preventDefault();
    setFilters(draftFilters);
    setPage(0);
  }
  function handleCoinChange(value) {
    setSelectedCoinId(value);
    setPage(0);
  }
  const trendLabel =
    variation?.trend === "up"
      ? "Al alza"
      : variation?.trend === "down"
        ? "A la baja"
        : variation?.trend === "unchanged"
          ? "Sin cambios"
          : "—";
  return _jsxs("details", {
    className: styles.panel,
    "data-dashboard-accordion": "true",
    id: "history",
    open: true,
    children: [
      _jsxs("summary", {
        className: styles.sectionHeading,
        children: [
          _jsxs("div", {
            children: [
              _jsx("span", { className: styles.eyebrow, children: "An\u00E1lisis" }),
              _jsx("h2", { children: "Historial de precios" }),
            ],
          }),
          _jsxs("span", {
            className: styles.pill,
            children: ["P\u00E1gina ", page + 1],
          }),
        ],
      }),
      coinError &&
        _jsxs("div", {
          className: styles.errorState,
          children: [
            _jsx("p", { className: styles.errorMessage, children: coinError }),
            _jsx("button", {
              onClick: () => void loadCoins(true),
              type: "button",
              children: "Reintentar",
            }),
          ],
        }),
      _jsxs("div", {
        className: styles.toolbar,
        children: [
          _jsxs("label", {
            children: [
              "Moneda",
              _jsx("select", {
                disabled: isCoinsLoading || coins.length === 0,
                onChange: (event) => handleCoinChange(event.target.value),
                value: selectedCoinId,
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
            ],
          }),
          _jsxs("form", {
            className: styles.filterForm,
            onSubmit: handleFilterSubmit,
            children: [
              _jsxs("label", {
                children: [
                  "Desde",
                  _jsx("input", {
                    onChange: (event) =>
                      updateDraftFilter("startDate", event.target.value),
                    type: "date",
                    value: draftFilters.startDate,
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Hasta",
                  _jsx("input", {
                    onChange: (event) =>
                      updateDraftFilter("endDate", event.target.value),
                    type: "date",
                    value: draftFilters.endDate,
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Precio m\u00EDnimo",
                  _jsx("input", {
                    min: "0",
                    onChange: (event) =>
                      updateDraftFilter("minPrice", event.target.value),
                    step: "any",
                    type: "number",
                    value: draftFilters.minPrice,
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Precio m\u00E1ximo",
                  _jsx("input", {
                    min: "0",
                    onChange: (event) =>
                      updateDraftFilter("maxPrice", event.target.value),
                    step: "any",
                    type: "number",
                    value: draftFilters.maxPrice,
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Ordenar por",
                  _jsxs("select", {
                    onChange: (event) =>
                      updateDraftFilter("sortBy", event.target.value),
                    value: draftFilters.sortBy,
                    children: [
                      _jsx("option", { value: "recorded_at", children: "Fecha" }),
                      _jsx("option", { value: "price", children: "Precio" }),
                    ],
                  }),
                ],
              }),
              _jsxs("label", {
                children: [
                  "Direcci\u00F3n",
                  _jsxs("select", {
                    onChange: (event) =>
                      updateDraftFilter("sortOrder", event.target.value),
                    value: draftFilters.sortOrder,
                    children: [
                      _jsx("option", { value: "desc", children: "Descendente" }),
                      _jsx("option", { value: "asc", children: "Ascendente" }),
                    ],
                  }),
                ],
              }),
              _jsx("button", { type: "submit", children: "Aplicar filtros" }),
            ],
          }),
        ],
      }),
      isHistoryLoading &&
        _jsx("p", { className: styles.muted, children: "Cargando historial\u2026" }),
      historyError &&
        _jsx("p", { className: styles.errorMessage, children: historyError }),
      _jsxs("div", {
        className: styles.statGrid,
        children: [
          _jsxs("div", {
            children: [
              _jsx("span", { children: "Registros" }),
              _jsx("strong", { children: statistics?.count ?? "—" }),
            ],
          }),
          _jsxs("div", {
            children: [
              _jsx("span", { children: "M\u00EDnimo" }),
              _jsx("strong", { children: formatPrice(statistics?.min_price ?? null) }),
            ],
          }),
          _jsxs("div", {
            children: [
              _jsx("span", { children: "M\u00E1ximo" }),
              _jsx("strong", { children: formatPrice(statistics?.max_price ?? null) }),
            ],
          }),
          _jsxs("div", {
            children: [
              _jsx("span", { children: "Variaci\u00F3n" }),
              _jsx("strong", {
                className: variation?.trend ? styles[variation.trend] : "",
                children:
                  variation?.percentage_change === null ||
                  variation?.percentage_change === undefined
                    ? trendLabel
                    : `${variation.percentage_change.toFixed(2)}%`,
              }),
            ],
          }),
        ],
      }),
      records.length === 0 &&
        !isHistoryLoading &&
        !historyError &&
        _jsx("p", {
          className: styles.muted,
          children: "No hay registros para estos filtros.",
        }),
      records.length > 0 &&
        _jsx("div", {
          className: styles.tableWrapper,
          children: _jsxs("table", {
            children: [
              _jsx("thead", {
                children: _jsxs("tr", {
                  children: [
                    _jsx("th", { children: "Fecha" }),
                    _jsx("th", { children: "Precio" }),
                  ],
                }),
              }),
              _jsx("tbody", {
                children: records.map((record) =>
                  _jsxs(
                    "tr",
                    {
                      children: [
                        _jsx("td", { children: formatRecordedAt(record.recorded_at) }),
                        _jsx("td", { children: formatPrice(record.price) }),
                      ],
                    },
                    `${record.id ?? record.recorded_at}-${record.price}`,
                  ),
                ),
              }),
            ],
          }),
        }),
      _jsx(PriceHistoryChart, { records: records }),
      _jsxs("div", {
        className: styles.pagination,
        children: [
          _jsx("button", {
            disabled: page === 0 || isHistoryLoading,
            onClick: () => setPage((current) => Math.max(0, current - 1)),
            type: "button",
            children: "Anterior",
          }),
          _jsxs("span", { children: ["P\u00E1gina ", page + 1] }),
          _jsx("button", {
            disabled: !hasNextPage || isHistoryLoading,
            onClick: () => setPage((current) => current + 1),
            type: "button",
            children: "Siguiente",
          }),
        ],
      }),
    ],
  });
}

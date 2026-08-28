import { useEffect, useState, type FormEvent } from "react";

import { ApiError, api, isRequestCancelled } from "../../api/client";
import type {
  PriceHistoryRecord,
  PriceHistoryStatistics,
  PriceHistoryVariation,
} from "../../api/types";
import { useMarket } from "../../features/market/MarketContext";
import { useI18n } from "../../i18n/I18nContext";
import PriceHistoryChart from "./PriceHistoryChart";
import styles from "./PriceHistoryPanel.module.css";

const PAGE_SIZE = 10;

interface Filters {
  startDate: string;
  endDate: string;
  minPrice: string;
  maxPrice: string;
  sortBy: "recorded_at" | "price";
  sortOrder: "asc" | "desc";
}

const initialFilters: Filters = {
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

function formatPrice(price: number | null) {
  return price === null ? "—" : moneyFormatter.format(price);
}

function formatRecordedAt(value: string, locale: string) {
  return new Date(value).toLocaleString(locale, {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function getErrorMessage(caughtError: unknown) {
  return caughtError instanceof ApiError
    ? caughtError.message
    : "No se pudo cargar el historial de precios.";
}

export default function PriceHistoryPanel({
  initialCoinId = "",
}: {
  initialCoinId?: string;
}) {
  const {
    coins,
    error: coinError,
    lastUpdated,
    loadCoins,
    status: marketStatus,
  } = useMarket();
  const { locale, t } = useI18n();
  const dateLocale = locale === "it" ? "it-IT" : locale === "en" ? "en-US" : "es-AR";
  const [selectedCoinId, setSelectedCoinId] = useState("");
  const [records, setRecords] = useState<PriceHistoryRecord[]>([]);
  const [statistics, setStatistics] = useState<PriceHistoryStatistics | null>(null);
  const [variation, setVariation] = useState<PriceHistoryVariation | null>(null);
  const [filters, setFilters] = useState<Filters>(initialFilters);
  const [draftFilters, setDraftFilters] = useState<Filters>(initialFilters);
  const [page, setPage] = useState(0);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
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

  function updateDraftFilter<Key extends keyof Filters>(key: Key, value: Filters[Key]) {
    setDraftFilters((current) => ({ ...current, [key]: value }));
  }

  function handleFilterSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFilters(draftFilters);
    setPage(0);
  }

  function handleCoinChange(value: string) {
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

  return (
    <details className={styles.panel} data-dashboard-accordion="true" id="history" open>
      <summary className={styles.sectionHeading}>
        <div>
          <span className={styles.eyebrow}>{t("history_eyebrow")}</span>
          <h2>{t("price_history")}</h2>
        </div>
        <span className={styles.pill}>Página {page + 1}</span>
      </summary>

      {coinError && (
        <div className={styles.errorState}>
          <p className={styles.errorMessage}>{coinError}</p>
          <button onClick={() => void loadCoins(true)} type="button">
            Reintentar
          </button>
        </div>
      )}

      <div className={styles.toolbar}>
        <label>
          {t("coin")}
          <select
            disabled={isCoinsLoading || coins.length === 0}
            onChange={(event) => handleCoinChange(event.target.value)}
            value={selectedCoinId}
          >
            {coins.map((coin) => (
              <option key={coin.id} value={coin.id}>
                {coin.name} ({coin.symbol.toUpperCase()})
              </option>
            ))}
          </select>
        </label>

        <form className={styles.filterForm} onSubmit={handleFilterSubmit}>
          <label>
            {t("from")}
            <input
              onChange={(event) => updateDraftFilter("startDate", event.target.value)}
              type="date"
              value={draftFilters.startDate}
            />
          </label>
          <label>
            {t("to")}
            <input
              onChange={(event) => updateDraftFilter("endDate", event.target.value)}
              type="date"
              value={draftFilters.endDate}
            />
          </label>
          <label>
            {t("min_price")}
            <input
              min="0"
              onChange={(event) => updateDraftFilter("minPrice", event.target.value)}
              step="any"
              type="number"
              value={draftFilters.minPrice}
            />
          </label>
          <label>
            {t("max_price")}
            <input
              min="0"
              onChange={(event) => updateDraftFilter("maxPrice", event.target.value)}
              step="any"
              type="number"
              value={draftFilters.maxPrice}
            />
          </label>
          <label>
            {t("sort_by")}
            <select
              onChange={(event) =>
                updateDraftFilter("sortBy", event.target.value as Filters["sortBy"])
              }
              value={draftFilters.sortBy}
            >
              <option value="recorded_at">Fecha</option>
              <option value="price">Precio</option>
            </select>
          </label>
          <label>
            {t("direction")}
            <select
              onChange={(event) =>
                updateDraftFilter(
                  "sortOrder",
                  event.target.value as Filters["sortOrder"],
                )
              }
              value={draftFilters.sortOrder}
            >
              <option value="desc">Descendente</option>
              <option value="asc">Ascendente</option>
            </select>
          </label>
          <button type="submit">{t("apply_filters")}</button>
        </form>
      </div>

      {isHistoryLoading && <p className={styles.muted}>Cargando historial…</p>}
      {historyError && <p className={styles.errorMessage}>{historyError}</p>}

      <div className={styles.statGrid}>
        <div>
          <span>{t("records")}</span>
          <strong>{statistics?.count ?? "—"}</strong>
        </div>
        <div>
          <span>{t("min")}</span>
          <strong>{formatPrice(statistics?.min_price ?? null)}</strong>
        </div>
        <div>
          <span>{t("max")}</span>
          <strong>{formatPrice(statistics?.max_price ?? null)}</strong>
        </div>
        <div>
          <span>{t("variation")}</span>
          <strong className={variation?.trend ? styles[variation.trend] : ""}>
            {variation?.percentage_change === null ||
            variation?.percentage_change === undefined
              ? trendLabel
              : `${variation.percentage_change.toFixed(2)}%`}
          </strong>
        </div>
      </div>

      {records.length === 0 && !isHistoryLoading && !historyError && (
        <p className={styles.muted}>No hay registros para estos filtros.</p>
      )}

      {records.length > 0 && (
        <div className={styles.tableWrapper}>
          <table>
            <thead>
              <tr>
                <th>{t("date")}</th>
                <th>{t("price")}</th>
              </tr>
            </thead>
            <tbody>
              {records.map((record) => (
                <tr key={`${record.id ?? record.recorded_at}-${record.price}`}>
                  <td>{formatRecordedAt(record.recorded_at, dateLocale)}</td>
                  <td>{formatPrice(record.price)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <PriceHistoryChart records={records} />

      <div className={styles.pagination}>
        <button
          disabled={page === 0 || isHistoryLoading}
          onClick={() => setPage((current) => Math.max(0, current - 1))}
          type="button"
        >
          {t("previous")}
        </button>
        <span>
          {t("page")} {page + 1}
        </span>
        <button
          disabled={!hasNextPage || isHistoryLoading}
          onClick={() => setPage((current) => current + 1)}
          type="button"
        >
          {t("next")}
        </button>
      </div>
    </details>
  );
}

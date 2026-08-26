import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";

import { ApiError, api, isRequestCancelled } from "../../api/client";
import type { RequestOptions } from "../../api/client";
import type { Coin } from "../../api/types";

const MARKET_CACHE_TTL_MS = 30_000;

let marketCache: { coins: Coin[]; timestamp: number } | null = null;

type MarketStatus = "idle" | "loading" | "success" | "error";

interface MarketContextValue {
  coins: Coin[];
  autoRefreshIntervalMs: number;
  error: string | null;
  isAutoRefreshEnabled: boolean;
  lastUpdated: Date | null;
  status: MarketStatus;
  loadCoins(force?: boolean, options?: RequestOptions): Promise<boolean>;
  refresh(options?: RequestOptions): Promise<boolean>;
}

const MarketContext = createContext<MarketContextValue | undefined>(undefined);

function getMarketError(caughtError: unknown) {
  return caughtError instanceof ApiError
    ? caughtError.message
    : "No se pudieron cargar las monedas.";
}

export function invalidateMarketCache() {
  marketCache = null;
}

export function MarketProvider({ children }: { children: ReactNode }) {
  const [coins, setCoins] = useState<Coin[]>(marketCache?.coins || []);
  const [status, setStatus] = useState<MarketStatus>(marketCache ? "success" : "idle");
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(
    marketCache ? new Date(marketCache.timestamp) : null,
  );
  const requestRef = useRef<Promise<boolean> | null>(null);
  const autoRefreshIntervalMs = Number(
    import.meta.env.VITE_MARKET_REFRESH_INTERVAL_MS || 0,
  );
  const isAutoRefreshEnabled =
    Number.isFinite(autoRefreshIntervalMs) && autoRefreshIntervalMs > 0;

  const loadCoins = useCallback(async (force = false, options: RequestOptions = {}) => {
    if (force) {
      invalidateMarketCache();
    }

    const now = Date.now();

    if (!force && marketCache && now - marketCache.timestamp < MARKET_CACHE_TTL_MS) {
      setCoins(marketCache.coins);
      setStatus("success");
      setLastUpdated((current) =>
        current?.getTime() === marketCache?.timestamp
          ? current
          : new Date(marketCache!.timestamp),
      );
      return true;
    }

    if (requestRef.current) {
      return requestRef.current;
    }

    setStatus("loading");
    setError(null);

    const request = api
      .getCoins(options)
      .then((response) => {
        const timestamp = Date.now();
        marketCache = { coins: response.data, timestamp };
        setCoins(response.data);
        setStatus("success");
        setLastUpdated(new Date(timestamp));
        return true;
      })
      .catch((caughtError) => {
        if (!isRequestCancelled(caughtError)) {
          setStatus("error");
          setError(getMarketError(caughtError));
        }
        return false;
      })
      .finally(() => {
        requestRef.current = null;
      });

    requestRef.current = request;
    return request;
  }, []);

  const refresh = useCallback(
    (options: RequestOptions = {}) => loadCoins(true, options),
    [loadCoins],
  );

  useEffect(() => {
    if (!isAutoRefreshEnabled) {
      return;
    }

    const baseIntervalMs = Math.max(autoRefreshIntervalMs, 1_000);
    const maxBackoffMs = baseIntervalMs * 8;
    let timeoutId: number | null = null;
    let failureCount = 0;
    let cancelled = false;

    const schedule = (delayMs: number) => {
      if (cancelled || document.visibilityState === "hidden") {
        return;
      }

      timeoutId = window.setTimeout(async () => {
        timeoutId = null;
        if (cancelled) return;

        const succeeded = await refresh();
        failureCount = succeeded ? 0 : Math.min(failureCount + 1, 3);
        const nextDelay = succeeded
          ? baseIntervalMs
          : Math.min(baseIntervalMs * 2 ** failureCount, maxBackoffMs);

        schedule(nextDelay);
      }, delayMs);
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") {
        if (timeoutId !== null) {
          window.clearTimeout(timeoutId);
          timeoutId = null;
        }
        return;
      }

      if (timeoutId === null) {
        schedule(0);
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    schedule(baseIntervalMs);

    return () => {
      cancelled = true;
      if (timeoutId !== null) window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [autoRefreshIntervalMs, isAutoRefreshEnabled, refresh]);

  const value = useMemo(
    () => ({
      autoRefreshIntervalMs,
      coins,
      error,
      isAutoRefreshEnabled,
      lastUpdated,
      status,
      loadCoins,
      refresh,
    }),
    [
      autoRefreshIntervalMs,
      coins,
      error,
      isAutoRefreshEnabled,
      lastUpdated,
      loadCoins,
      refresh,
      status,
    ],
  );

  return <MarketContext.Provider value={value}>{children}</MarketContext.Provider>;
}

export function useMarket() {
  const context = useContext(MarketContext);

  if (!context) {
    throw new Error("useMarket debe utilizarse dentro de MarketProvider.");
  }

  return context;
}

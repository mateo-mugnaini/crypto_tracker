import { jsx as _jsx } from "react/jsx-runtime";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { ApiError, api, isRequestCancelled } from "../../api/client";
import { useOptionalAuth } from "../../auth/AuthContext";
import { runtimeConfig } from "../../config/runtime";
const MARKET_CACHE_TTL_MS = 30_000;
let marketCache = null;
let lastMarketTimestamp = 0;
function nextMarketTimestamp() {
  lastMarketTimestamp = Math.max(Date.now(), lastMarketTimestamp + 1);
  return lastMarketTimestamp;
}
const MarketContext = createContext(undefined);
function getMarketError(caughtError) {
  return caughtError instanceof ApiError
    ? caughtError.message
    : "No se pudieron cargar las monedas.";
}
function isSnapshot(value) {
  if (!value || typeof value !== "object") return false;
  const candidate = value;
  return (
    typeof candidate.coin_id === "string" &&
    typeof candidate.price === "number" &&
    Number.isFinite(candidate.price) &&
    typeof candidate.recorded_at === "string"
  );
}
async function consumeEventStream(response, onEvent) {
  if (!response.body) throw new Error("El navegador no soporta streams de mercado.");
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  let eventName = "message";
  let data = "";
  const dispatch = () => {
    if (data) {
      try {
        onEvent(eventName, JSON.parse(data));
      } catch {
        // Ignore incomplete or malformed events; the next snapshot can recover state.
      }
    }
    eventName = "message";
    data = "";
  };
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";
      for (const line of lines) {
        if (!line.trim()) {
          dispatch();
        } else if (line.startsWith("event:")) {
          eventName = line.slice(6).trim();
        } else if (line.startsWith("data:")) {
          data += line.slice(5).trim();
        }
      }
    }
    dispatch();
  } finally {
    reader.releaseLock();
  }
}
export function invalidateMarketCache() {
  marketCache = null;
}
export function MarketProvider({ children }) {
  const auth = useOptionalAuth();
  const [coins, setCoins] = useState(marketCache?.coins || []);
  const [status, setStatus] = useState(marketCache ? "success" : "idle");
  const [error, setError] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(
    marketCache ? new Date(marketCache.timestamp) : null,
  );
  const [liveStatus, setLiveStatus] = useState("disabled");
  const requestRef = useRef(null);
  const autoRefreshIntervalMs = runtimeConfig.marketRefreshIntervalMs;
  const isAutoRefreshEnabled = autoRefreshIntervalMs > 0;
  const liveEnabled = runtimeConfig.marketLiveEnabled;
  const loadCoins = useCallback(async (force = false, options = {}) => {
    if (force) {
      invalidateMarketCache();
      setLastUpdated(new Date(nextMarketTimestamp()));
    }
    const now = Date.now();
    if (!force && marketCache && now - marketCache.timestamp < MARKET_CACHE_TTL_MS) {
      setCoins(marketCache.coins);
      setStatus("success");
      setLastUpdated((current) =>
        current?.getTime() === marketCache?.timestamp
          ? current
          : new Date(marketCache.timestamp),
      );
      return true;
    }
    if (requestRef.current && !force) {
      return requestRef.current;
    }
    setStatus("loading");
    setError(null);
    const request = api
      .getCoins(options)
      .then((response) => {
        const timestamp = nextMarketTimestamp();
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
        if (requestRef.current === request) requestRef.current = null;
      });
    requestRef.current = request;
    return request;
  }, []);
  const refresh = useCallback((options = {}) => loadCoins(true, options), [loadCoins]);
  useEffect(() => {
    if (!liveEnabled || auth?.status !== "authenticated" || !auth.token) {
      setLiveStatus("disabled");
      return;
    }
    const controller = new AbortController();
    let cancelled = false;
    let reconnectTimer = null;
    let reconnectAttempt = 0;
    const applyEvent = (eventName, payload) => {
      if (eventName === "market_snapshot" && payload && typeof payload === "object") {
        const snapshotCoins = payload.coins;
        if (
          Array.isArray(snapshotCoins) &&
          snapshotCoins.every((coin) => isSnapshotCoin(coin))
        ) {
          const nextCoins = snapshotCoins;
          const timestamp = nextMarketTimestamp();
          marketCache = { coins: nextCoins, timestamp };
          setCoins(nextCoins);
          setStatus("success");
          setLastUpdated(new Date(timestamp));
        }
      }
      if (eventName === "price_snapshot" && isSnapshot(payload)) {
        const timestamp = nextMarketTimestamp();
        setCoins((current) => {
          const nextCoins = current.map((coin) =>
            coin.id === payload.coin_id
              ? { ...coin, current_price: payload.price }
              : coin,
          );
          marketCache = { coins: nextCoins, timestamp };
          return nextCoins;
        });
        setStatus("success");
        setLastUpdated(new Date(timestamp));
      }
    };
    const scheduleReconnect = () => {
      if (cancelled) return;
      const delay = Math.min(1_000 * 2 ** reconnectAttempt, 30_000);
      reconnectAttempt = Math.min(reconnectAttempt + 1, 5);
      reconnectTimer = window.setTimeout(() => void connect(), delay);
    };
    const connect = async () => {
      if (cancelled) return;
      setLiveStatus(reconnectAttempt ? "fallback" : "connecting");
      try {
        const response = await api.openMarketStream(auth.token, controller.signal);
        if (cancelled) return;
        reconnectAttempt = 0;
        setLiveStatus("connected");
        await consumeEventStream(response, applyEvent);
        scheduleReconnect();
      } catch (caughtError) {
        if (cancelled || isRequestCancelled(caughtError)) return;
        setLiveStatus("fallback");
        scheduleReconnect();
      }
    };
    void connect();
    return () => {
      cancelled = true;
      controller.abort();
      if (reconnectTimer !== null) window.clearTimeout(reconnectTimer);
    };
  }, [auth?.status, auth?.token, liveEnabled]);
  useEffect(() => {
    const shouldPoll = isAutoRefreshEnabled || liveStatus === "fallback";
    if (!shouldPoll) {
      return;
    }
    const baseIntervalMs = Math.max(autoRefreshIntervalMs || 30_000, 1_000);
    const maxBackoffMs = baseIntervalMs * 8;
    let timeoutId = null;
    let failureCount = 0;
    let cancelled = false;
    const schedule = (delayMs) => {
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
  }, [autoRefreshIntervalMs, isAutoRefreshEnabled, liveStatus, refresh]);
  const value = useMemo(
    () => ({
      autoRefreshIntervalMs,
      coins,
      error,
      isAutoRefreshEnabled,
      liveStatus,
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
      liveStatus,
      lastUpdated,
      loadCoins,
      refresh,
      status,
    ],
  );
  return _jsx(MarketContext.Provider, { value: value, children: children });
}
function isSnapshotCoin(value) {
  if (!value || typeof value !== "object") return false;
  const candidate = value;
  return (
    typeof candidate.id === "string" &&
    typeof candidate.symbol === "string" &&
    typeof candidate.name === "string" &&
    (candidate.market_cap_rank === null ||
      typeof candidate.market_cap_rank === "number") &&
    (candidate.current_price === null || typeof candidate.current_price === "number")
  );
}
export function useMarket() {
  const context = useContext(MarketContext);
  if (!context) {
    throw new Error("useMarket debe utilizarse dentro de MarketProvider.");
  }
  return context;
}

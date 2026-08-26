import { runtimeConfig } from "../config/runtime";
const API_BASE_URL = runtimeConfig.apiBaseUrl;
const API_TIMEOUT_MS = runtimeConfig.apiTimeoutMs;
let unauthorizedHandler = null;
export function setUnauthorizedHandler(handler) {
  unauthorizedHandler = handler;
  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}
export class ApiError extends Error {
  status;
  code;
  requestId;
  fields;
  kind;
  constructor(status, code, message, requestId, fields = [], kind = "api") {
    super(message);
    this.status = status;
    this.code = code;
    this.requestId = requestId;
    this.fields = fields;
    this.kind = kind;
    this.name = "ApiError";
  }
}
export function isRequestCancelled(caughtError) {
  return (
    caughtError instanceof ApiError &&
    (caughtError.kind === "aborted" || caughtError.kind === "timeout")
  );
}
function isRecord(value) {
  return typeof value === "object" && value !== null;
}
function isString(value) {
  return typeof value === "string";
}
function isNumberOrNull(value) {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}
function isUser(value) {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    isString(value.username) &&
    isString(value.email) &&
    isString(value.created_at)
  );
}
function isTokenResponse(value) {
  return (
    isRecord(value) && isString(value.access_token) && value.token_type === "bearer"
  );
}
function isCoin(value) {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.symbol) &&
    isString(value.name) &&
    isNumberOrNull(value.market_cap_rank) &&
    isNumberOrNull(value.current_price)
  );
}
function isCoinListResponse(value) {
  return (
    isRecord(value) &&
    typeof value.success === "boolean" &&
    isString(value.message) &&
    Array.isArray(value.data) &&
    value.data.every(isCoin)
  );
}
function isCoinResponse(value) {
  return (
    isRecord(value) &&
    typeof value.success === "boolean" &&
    isString(value.message) &&
    isCoin(value.data)
  );
}
function isFavoriteDetails(value) {
  return (
    isRecord(value) &&
    isString(value.coin_id) &&
    isString(value.symbol) &&
    isString(value.name) &&
    isNumberOrNull(value.market_cap_rank)
  );
}
function isFavoriteDetailsListResponse(value) {
  return (
    isRecord(value) &&
    typeof value.success === "boolean" &&
    Array.isArray(value.data) &&
    value.data.every(isFavoriteDetails)
  );
}
function isFavorite(value) {
  return (
    isRecord(value) && typeof value.user_id === "number" && isString(value.coin_id)
  );
}
function isFavoriteListResponse(value) {
  return (
    isRecord(value) &&
    typeof value.success === "boolean" &&
    Array.isArray(value.data) &&
    value.data.every(isFavorite)
  );
}
function isFavoriteActionResponse(value) {
  return (
    isRecord(value) && typeof value.success === "boolean" && isString(value.message)
  );
}
function isPriceHistoryRecord(value) {
  return (
    isRecord(value) &&
    isNumberOrNull(value.id) &&
    isString(value.coin_id) &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    isString(value.recorded_at)
  );
}
function isPriceHistoryStatistics(value) {
  return (
    isRecord(value) &&
    isString(value.coin_id) &&
    typeof value.count === "number" &&
    isNumberOrNull(value.min_price) &&
    isNumberOrNull(value.max_price) &&
    isNumberOrNull(value.average_price)
  );
}
function isPriceHistoryVariation(value) {
  return (
    isRecord(value) &&
    isString(value.coin_id) &&
    isNumberOrNull(value.initial_price) &&
    isNumberOrNull(value.final_price) &&
    isNumberOrNull(value.absolute_change) &&
    isNumberOrNull(value.percentage_change) &&
    (value.trend === null ||
      value.trend === "up" ||
      value.trend === "down" ||
      value.trend === "unchanged")
  );
}
function isPortfolioHolding(value) {
  return (
    isRecord(value) &&
    isString(value.coin_id) &&
    isString(value.symbol) &&
    isString(value.name) &&
    typeof value.quantity === "number" &&
    typeof value.average_buy_price === "number" &&
    typeof value.invested_value === "number" &&
    isNumberOrNull(value.current_price) &&
    isNumberOrNull(value.current_value) &&
    isNumberOrNull(value.profit_loss) &&
    isNumberOrNull(value.profit_loss_percentage) &&
    isNumberOrNull(value.allocation_percentage)
  );
}
function isPortfolioResponse(value) {
  return (
    isRecord(value) &&
    typeof value.total_invested === "number" &&
    isNumberOrNull(value.total_current_value) &&
    isNumberOrNull(value.total_profit_loss) &&
    isNumberOrNull(value.total_profit_loss_percentage) &&
    Array.isArray(value.holdings) &&
    value.holdings.every(isPortfolioHolding)
  );
}
function isPortfolioActionResponse(value) {
  return (
    isRecord(value) && typeof value.success === "boolean" && isString(value.message)
  );
}
function isPortfolioOperation(value) {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    isString(value.coin_id) &&
    isString(value.symbol) &&
    isString(value.name) &&
    (value.operation_type === "buy" || value.operation_type === "sell") &&
    typeof value.quantity === "number" &&
    typeof value.price_usd === "number" &&
    typeof value.fee_usd === "number" &&
    isString(value.executed_at) &&
    (value.note === null || isString(value.note))
  );
}
function isPortfolioOperationsResponse(value) {
  return (
    isRecord(value) &&
    typeof value.total === "number" &&
    Array.isArray(value.data) &&
    value.data.every(isPortfolioOperation)
  );
}
function isPortfolioOperationsSummary(value) {
  return (
    isRecord(value) &&
    typeof value.total_invested === "number" &&
    isNumberOrNull(value.total_current_value) &&
    typeof value.realized_profit_loss === "number" &&
    isNumberOrNull(value.unrealized_profit_loss) &&
    isNumberOrNull(value.total_profit_loss)
  );
}
function isPortfolioAnalytics(value) {
  if (!isRecord(value)) return false;
  const assets = value.assets;
  const points = value.points;
  return (
    typeof value.period_days === "number" &&
    isString(value.period_start) &&
    isString(value.period_end) &&
    Array.isArray(points) &&
    points.every(
      (point) =>
        isRecord(point) &&
        isString(point.timestamp) &&
        typeof point.value === "number" &&
        typeof point.invested === "number",
    ) &&
    Array.isArray(assets) &&
    assets.every(
      (asset) =>
        isRecord(asset) &&
        isString(asset.coin_id) &&
        isString(asset.symbol) &&
        isString(asset.name) &&
        typeof asset.quantity === "number" &&
        typeof asset.invested === "number" &&
        isNumberOrNull(asset.current_price) &&
        isNumberOrNull(asset.current_value) &&
        isNumberOrNull(asset.profit_loss) &&
        isNumberOrNull(asset.profit_loss_percentage) &&
        isNumberOrNull(asset.allocation_percentage),
    ) &&
    isNumberOrNull(value.total_return_percentage) &&
    isNumberOrNull(value.max_drawdown_percentage) &&
    isNumberOrNull(value.volatility_percentage) &&
    (value.benchmark_coin_id === null || isString(value.benchmark_coin_id)) &&
    Array.isArray(value.benchmark)
  );
}
function isPriceAlert(value) {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    isString(value.coin_id) &&
    isString(value.symbol) &&
    isString(value.name) &&
    (value.condition === "above" || value.condition === "below") &&
    typeof value.target_price === "number" &&
    typeof value.is_active === "boolean" &&
    isNumberOrNull(value.current_price) &&
    (value.last_triggered_at === null || isString(value.last_triggered_at)) &&
    isString(value.created_at) &&
    isString(value.updated_at)
  );
}
function isPriceAlertListResponse(value) {
  return (
    isRecord(value) &&
    typeof value.total === "number" &&
    Array.isArray(value.data) &&
    value.data.every(isPriceAlert)
  );
}
function isNotificationListResponse(value) {
  return (
    isRecord(value) &&
    typeof value.total === "number" &&
    typeof value.unread === "number" &&
    Array.isArray(value.data) &&
    value.data.every(
      (item) =>
        isRecord(item) &&
        typeof item.id === "number" &&
        (item.alert_id === null || typeof item.alert_id === "number") &&
        (item.coin_id === null || isString(item.coin_id)) &&
        (item.symbol === null || isString(item.symbol)) &&
        (item.name === null || isString(item.name)) &&
        isString(item.title) &&
        isString(item.message) &&
        isNumberOrNull(item.current_price) &&
        typeof item.is_read === "boolean" &&
        isString(item.created_at),
    )
  );
}
function getErrorDetails(payload) {
  if (Array.isArray(payload.detail)) {
    return {
      code: "validation_error",
      message: "Revisá los datos ingresados.",
      fields: payload.detail,
    };
  }
  if (
    isRecord(payload.detail) &&
    isString(payload.detail.code) &&
    isString(payload.detail.message)
  ) {
    return {
      code: payload.detail.code,
      message: payload.detail.message,
      fields: [],
    };
  }
  return {
    code: "unexpected_api_error",
    message: "No se pudo completar la operación.",
    fields: [],
  };
}
function getTimeoutMs(options) {
  return options.timeoutMs !== undefined &&
    Number.isFinite(options.timeoutMs) &&
    options.timeoutMs > 0
    ? options.timeoutMs
    : API_TIMEOUT_MS;
}
async function request(path, options = {}, token, requestOptions = {}, validate) {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");
  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }
  const controller = new AbortController();
  let timedOut = false;
  const timeoutId = window.setTimeout(() => {
    timedOut = true;
    controller.abort();
  }, getTimeoutMs(requestOptions));
  const externalSignal = requestOptions.signal;
  const abortRequest = () => controller.abort();
  if (externalSignal) {
    if (externalSignal.aborted) {
      abortRequest();
    } else {
      externalSignal.addEventListener("abort", abortRequest, { once: true });
    }
  }
  let response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
      signal: controller.signal,
    });
  } catch {
    if (controller.signal.aborted) {
      throw new ApiError(
        0,
        timedOut ? "request_timeout" : "request_aborted",
        timedOut
          ? "La solicitud tardó demasiado. Intenta nuevamente."
          : "La solicitud fue cancelada.",
        null,
        [],
        timedOut ? "timeout" : "aborted",
      );
    }
    throw new ApiError(
      0,
      "network_error",
      "No se pudo conectar con la API.",
      null,
      [],
      "network",
    );
  } finally {
    window.clearTimeout(timeoutId);
    externalSignal?.removeEventListener("abort", abortRequest);
  }
  if (response.status === 204) {
    return null;
  }
  const requestId = response.headers.get("X-Request-ID");
  const payload = await response.json().catch(() => null);
  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.();
    }
    const details = getErrorDetails(payload || {});
    throw new ApiError(
      response.status,
      details.code,
      details.message,
      requestId,
      details.fields,
      "api",
    );
  }
  if (validate && !validate(payload)) {
    throw new ApiError(
      response.status,
      "invalid_response",
      "La API devolvió una respuesta inválida.",
      requestId,
      [],
      "contract",
    );
  }
  return payload;
}
export const api = {
  register(username, email, password, options = {}) {
    return request(
      "/users/register",
      {
        method: "POST",
        body: JSON.stringify({ username, email, password }),
      },
      undefined,
      options,
      isUser,
    );
  },
  login(email, password, options = {}) {
    return request(
      "/users/login",
      {
        method: "POST",
        body: JSON.stringify({ email, password }),
      },
      undefined,
      options,
      isTokenResponse,
    );
  },
  getCurrentUser(token, options = {}) {
    return request("/users/me", {}, token, options, isUser);
  },
  getCoins(options = {}) {
    return request("/coins", {}, undefined, options, isCoinListResponse);
  },
  async openMarketStream(token, signal) {
    let response;
    try {
      response = await fetch(`${API_BASE_URL}/market/stream`, {
        headers: { Accept: "text/event-stream", Authorization: `Bearer ${token}` },
        signal,
      });
    } catch {
      if (signal?.aborted) {
        throw new ApiError(
          0,
          "stream_aborted",
          "El canal live fue cerrado.",
          null,
          [],
          "aborted",
        );
      }
      throw new ApiError(
        0,
        "stream_unavailable",
        "No se pudo abrir el canal live.",
        null,
        [],
        "network",
      );
    }
    if (!response.ok) {
      if (response.status === 401) unauthorizedHandler?.();
      throw new ApiError(
        response.status,
        "stream_unavailable",
        "El canal live no está disponible.",
        response.headers.get("X-Request-ID"),
      );
    }
    return response;
  },
  getCoin(coinId, options = {}) {
    return request(
      `/coins/${encodeURIComponent(coinId)}`,
      {},
      undefined,
      options,
      isCoinResponse,
    );
  },
  updateCurrentPrice(coinId, options = {}) {
    return request(
      `/coins/${encodeURIComponent(coinId)}/price`,
      { method: "POST" },
      undefined,
      options,
      isPriceHistoryRecord,
    );
  },
  getFavoriteDetails(userId, token, options = {}) {
    const query = new URLSearchParams({ user_id: String(userId) });
    return request(
      `/favorites/details?${query.toString()}`,
      {},
      token,
      options,
      isFavoriteDetailsListResponse,
    );
  },
  getFavorites(userId, token, options = {}) {
    const query = new URLSearchParams({ user_id: String(userId) });
    return request(
      `/favorites?${query.toString()}`,
      {},
      token,
      options,
      isFavoriteListResponse,
    );
  },
  addFavorite(userId, coinId, token, options = {}) {
    return request(
      "/favorites",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId, coin_id: coinId }),
      },
      token,
      options,
      isFavoriteActionResponse,
    );
  },
  removeFavorite(userId, coinId, token, options = {}) {
    const query = new URLSearchParams({ user_id: String(userId) });
    return request(
      `/favorites/${encodeURIComponent(coinId)}?${query.toString()}`,
      { method: "DELETE" },
      token,
      options,
    );
  },
  getPortfolio(token, options = {}) {
    return request("/portfolio", {}, token, options, isPortfolioResponse);
  },
  savePortfolioHolding(input, token, options = {}) {
    return request(
      "/portfolio/holdings",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      token,
      options,
      isPortfolioResponse,
    );
  },
  removePortfolioHolding(coinId, token, options = {}) {
    return request(
      `/portfolio/holdings/${encodeURIComponent(coinId)}`,
      { method: "DELETE" },
      token,
      options,
      isPortfolioActionResponse,
    );
  },
  getPortfolioOperations(token, options = {}) {
    return request(
      "/portfolio/operations",
      {},
      token,
      options,
      isPortfolioOperationsResponse,
    );
  },
  getPortfolioOperationsSummary(token, options = {}) {
    return request(
      "/portfolio/operations/summary",
      {},
      token,
      options,
      isPortfolioOperationsSummary,
    );
  },
  getPortfolioAnalytics(days, token, benchmarkCoinId, options = {}) {
    const query = new URLSearchParams({ days: String(days) });
    if (benchmarkCoinId) query.set("benchmark_coin_id", benchmarkCoinId);
    return request(
      `/portfolio/analytics?${query.toString()}`,
      {},
      token,
      options,
      isPortfolioAnalytics,
    );
  },
  createPortfolioOperation(input, token, options = {}) {
    return request(
      "/portfolio/operations",
      { method: "POST", body: JSON.stringify(input) },
      token,
      options,
      isPortfolioOperation,
    );
  },
  updatePortfolioOperation(operationId, input, token, options = {}) {
    return request(
      `/portfolio/operations/${operationId}`,
      { method: "PUT", body: JSON.stringify(input) },
      token,
      options,
      isPortfolioOperation,
    );
  },
  removePortfolioOperation(operationId, token, options = {}) {
    return request(
      `/portfolio/operations/${operationId}`,
      { method: "DELETE" },
      token,
      options,
      isPortfolioActionResponse,
    );
  },
  getAlerts(token, options = {}) {
    return request("/alerts", {}, token, options, isPriceAlertListResponse);
  },
  createAlert(input, token, options = {}) {
    return request(
      "/alerts",
      { method: "POST", body: JSON.stringify(input) },
      token,
      options,
      isPriceAlert,
    );
  },
  updateAlert(alertId, input, token, options = {}) {
    return request(
      `/alerts/${alertId}`,
      { method: "PATCH", body: JSON.stringify(input) },
      token,
      options,
      isPriceAlert,
    );
  },
  removeAlert(alertId, token, options = {}) {
    return request(
      `/alerts/${alertId}`,
      { method: "DELETE" },
      token,
      options,
      isPortfolioActionResponse,
    );
  },
  getNotifications(token, options = {}) {
    return request("/notifications", {}, token, options, isNotificationListResponse);
  },
  markNotificationRead(notificationId, token, options = {}) {
    return request(
      `/notifications/${notificationId}/read`,
      { method: "POST" },
      token,
      options,
      isPortfolioActionResponse,
    );
  },
  markAllNotificationsRead(token, options = {}) {
    return request(
      "/notifications/read-all",
      { method: "POST" },
      token,
      options,
      isPortfolioActionResponse,
    );
  },
  getPriceHistory(coinId, filters = {}, options = {}) {
    const query = new URLSearchParams();
    if (filters.startDate) query.set("start_date", filters.startDate);
    if (filters.endDate) query.set("end_date", filters.endDate);
    if (filters.minPrice) query.set("min_price", filters.minPrice);
    if (filters.maxPrice) query.set("max_price", filters.maxPrice);
    if (filters.limit !== undefined) query.set("limit", String(filters.limit));
    if (filters.offset !== undefined) query.set("offset", String(filters.offset));
    if (filters.sortBy) query.set("sort_by", filters.sortBy);
    if (filters.sortOrder) query.set("sort_order", filters.sortOrder);
    const queryString = query.toString();
    const path = `/coins/${encodeURIComponent(coinId)}/price-history${queryString ? `?${queryString}` : ""}`;
    return request(
      path,
      {},
      undefined,
      options,
      (payload) => Array.isArray(payload) && payload.every(isPriceHistoryRecord),
    );
  },
  getPriceStatistics(coinId, options = {}) {
    return request(
      `/coins/${encodeURIComponent(coinId)}/price-history/statistics`,
      {},
      undefined,
      options,
      isPriceHistoryStatistics,
    );
  },
  getPriceVariation(coinId, filters = {}, options = {}) {
    const query = new URLSearchParams();
    if (filters.startDate) query.set("start_date", filters.startDate);
    if (filters.endDate) query.set("end_date", filters.endDate);
    const queryString = query.toString();
    const path = `/coins/${encodeURIComponent(coinId)}/price-history/variation${queryString ? `?${queryString}` : ""}`;
    return request(path, {}, undefined, options, isPriceHistoryVariation);
  },
};
export { API_BASE_URL };

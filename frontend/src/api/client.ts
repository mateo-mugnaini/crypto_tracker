import type {
  ApiErrorPayload,
  Coin,
  CoinListResponse,
  FavoriteActionResponse,
  FavoriteDetails,
  FavoriteDetailsListResponse,
  FavoriteListResponse,
  PriceHistoryRecord,
  PriceHistoryStatistics,
  PriceHistoryVariation,
  PortfolioActionResponse,
  PortfolioHolding,
  PortfolioHoldingInput,
  PortfolioResponse,
  TokenResponse,
  User,
} from "./types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");
const DEFAULT_TIMEOUT_MS = 10_000;
const configuredTimeout = Number(
  import.meta.env.VITE_API_TIMEOUT_MS || DEFAULT_TIMEOUT_MS,
);
const API_TIMEOUT_MS =
  Number.isFinite(configuredTimeout) && configuredTimeout > 0
    ? configuredTimeout
    : DEFAULT_TIMEOUT_MS;

let unauthorizedHandler: (() => void) | null = null;

export type ApiErrorKind = "network" | "timeout" | "aborted" | "api" | "contract";

export interface RequestOptions {
  signal?: AbortSignal;
  timeoutMs?: number;
}

export function setUnauthorizedHandler(handler: () => void) {
  unauthorizedHandler = handler;

  return () => {
    if (unauthorizedHandler === handler) {
      unauthorizedHandler = null;
    }
  };
}

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    public readonly code: string,
    message: string,
    public readonly requestId: string | null,
    public readonly fields: unknown[] = [],
    public readonly kind: ApiErrorKind = "api",
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export function isRequestCancelled(caughtError: unknown) {
  return (
    caughtError instanceof ApiError &&
    (caughtError.kind === "aborted" || caughtError.kind === "timeout")
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isString(value: unknown): value is string {
  return typeof value === "string";
}

function isNumberOrNull(value: unknown): value is number | null {
  return value === null || (typeof value === "number" && Number.isFinite(value));
}

function isUser(value: unknown): value is User {
  return (
    isRecord(value) &&
    typeof value.id === "number" &&
    isString(value.username) &&
    isString(value.email) &&
    isString(value.created_at)
  );
}

function isTokenResponse(value: unknown): value is TokenResponse {
  return (
    isRecord(value) && isString(value.access_token) && value.token_type === "bearer"
  );
}

function isCoin(value: unknown): value is Coin {
  return (
    isRecord(value) &&
    isString(value.id) &&
    isString(value.symbol) &&
    isString(value.name) &&
    isNumberOrNull(value.market_cap_rank) &&
    isNumberOrNull(value.current_price)
  );
}

function isCoinListResponse(value: unknown): value is CoinListResponse {
  return (
    isRecord(value) &&
    typeof value.success === "boolean" &&
    isString(value.message) &&
    Array.isArray(value.data) &&
    value.data.every(isCoin)
  );
}

function isFavoriteDetails(value: unknown): value is FavoriteDetails {
  return (
    isRecord(value) &&
    isString(value.coin_id) &&
    isString(value.symbol) &&
    isString(value.name) &&
    isNumberOrNull(value.market_cap_rank)
  );
}

function isFavoriteDetailsListResponse(
  value: unknown,
): value is FavoriteDetailsListResponse {
  return (
    isRecord(value) &&
    typeof value.success === "boolean" &&
    Array.isArray(value.data) &&
    value.data.every(isFavoriteDetails)
  );
}

function isFavorite(value: unknown) {
  return (
    isRecord(value) && typeof value.user_id === "number" && isString(value.coin_id)
  );
}

function isFavoriteListResponse(value: unknown): value is FavoriteListResponse {
  return (
    isRecord(value) &&
    typeof value.success === "boolean" &&
    Array.isArray(value.data) &&
    value.data.every(isFavorite)
  );
}

function isFavoriteActionResponse(value: unknown): value is FavoriteActionResponse {
  return (
    isRecord(value) && typeof value.success === "boolean" && isString(value.message)
  );
}

function isPriceHistoryRecord(value: unknown): value is PriceHistoryRecord {
  return (
    isRecord(value) &&
    isNumberOrNull(value.id) &&
    isString(value.coin_id) &&
    typeof value.price === "number" &&
    Number.isFinite(value.price) &&
    isString(value.recorded_at)
  );
}

function isPriceHistoryStatistics(value: unknown): value is PriceHistoryStatistics {
  return (
    isRecord(value) &&
    isString(value.coin_id) &&
    typeof value.count === "number" &&
    isNumberOrNull(value.min_price) &&
    isNumberOrNull(value.max_price) &&
    isNumberOrNull(value.average_price)
  );
}

function isPriceHistoryVariation(value: unknown): value is PriceHistoryVariation {
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

function isPortfolioHolding(value: unknown): value is PortfolioHolding {
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

function isPortfolioResponse(value: unknown): value is PortfolioResponse {
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

function isPortfolioActionResponse(value: unknown): value is PortfolioActionResponse {
  return (
    isRecord(value) && typeof value.success === "boolean" && isString(value.message)
  );
}

function getErrorDetails(payload: ApiErrorPayload): {
  code: string;
  message: string;
  fields: unknown[];
} {
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

function getTimeoutMs(options: RequestOptions) {
  return options.timeoutMs !== undefined &&
    Number.isFinite(options.timeoutMs) &&
    options.timeoutMs > 0
    ? options.timeoutMs
    : API_TIMEOUT_MS;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
  requestOptions: RequestOptions = {},
  validate?: (payload: unknown) => payload is T,
): Promise<T> {
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

  let response: Response;

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
    return null as T;
  }

  const requestId = response.headers.get("X-Request-ID");
  const payload = (await response.json().catch(() => null)) as
    T | ApiErrorPayload | null;

  if (!response.ok) {
    if (response.status === 401) {
      unauthorizedHandler?.();
    }

    const details = getErrorDetails((payload || {}) as ApiErrorPayload);
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

  return payload as T;
}

export const api = {
  register(
    username: string,
    email: string,
    password: string,
    options: RequestOptions = {},
  ) {
    return request<User>(
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

  login(email: string, password: string, options: RequestOptions = {}) {
    return request<TokenResponse>(
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

  getCurrentUser(token: string, options: RequestOptions = {}) {
    return request<User>("/users/me", {}, token, options, isUser);
  },

  getCoins(options: RequestOptions = {}) {
    return request<CoinListResponse>(
      "/coins",
      {},
      undefined,
      options,
      isCoinListResponse,
    );
  },

  updateCurrentPrice(coinId: string, options: RequestOptions = {}) {
    return request<PriceHistoryRecord>(
      `/coins/${encodeURIComponent(coinId)}/price`,
      { method: "POST" },
      undefined,
      options,
      isPriceHistoryRecord,
    );
  },

  getFavoriteDetails(userId: number, token: string, options: RequestOptions = {}) {
    const query = new URLSearchParams({ user_id: String(userId) });
    return request<FavoriteDetailsListResponse>(
      `/favorites/details?${query.toString()}`,
      {},
      token,
      options,
      isFavoriteDetailsListResponse,
    );
  },

  getFavorites(userId: number, token: string, options: RequestOptions = {}) {
    const query = new URLSearchParams({ user_id: String(userId) });
    return request<FavoriteListResponse>(
      `/favorites?${query.toString()}`,
      {},
      token,
      options,
      isFavoriteListResponse,
    );
  },

  addFavorite(
    userId: number,
    coinId: string,
    token: string,
    options: RequestOptions = {},
  ) {
    return request<FavoriteActionResponse>(
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

  removeFavorite(
    userId: number,
    coinId: string,
    token: string,
    options: RequestOptions = {},
  ) {
    const query = new URLSearchParams({ user_id: String(userId) });
    return request<null>(
      `/favorites/${encodeURIComponent(coinId)}?${query.toString()}`,
      { method: "DELETE" },
      token,
      options,
    );
  },

  getPortfolio(token: string, options: RequestOptions = {}) {
    return request<PortfolioResponse>(
      "/portfolio",
      {},
      token,
      options,
      isPortfolioResponse,
    );
  },

  savePortfolioHolding(
    input: PortfolioHoldingInput,
    token: string,
    options: RequestOptions = {},
  ) {
    return request<PortfolioResponse>(
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

  removePortfolioHolding(coinId: string, token: string, options: RequestOptions = {}) {
    return request<PortfolioActionResponse>(
      `/portfolio/holdings/${encodeURIComponent(coinId)}`,
      { method: "DELETE" },
      token,
      options,
      isPortfolioActionResponse,
    );
  },

  getPriceHistory(
    coinId: string,
    filters: {
      startDate?: string;
      endDate?: string;
      minPrice?: string;
      maxPrice?: string;
      limit?: number;
      offset?: number;
      sortBy?: "recorded_at" | "price";
      sortOrder?: "asc" | "desc";
    } = {},
    options: RequestOptions = {},
  ) {
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

    return request<PriceHistoryRecord[]>(
      path,
      {},
      undefined,
      options,
      (payload): payload is PriceHistoryRecord[] =>
        Array.isArray(payload) && payload.every(isPriceHistoryRecord),
    );
  },

  getPriceStatistics(coinId: string, options: RequestOptions = {}) {
    return request<PriceHistoryStatistics>(
      `/coins/${encodeURIComponent(coinId)}/price-history/statistics`,
      {},
      undefined,
      options,
      isPriceHistoryStatistics,
    );
  },

  getPriceVariation(
    coinId: string,
    filters: { startDate?: string; endDate?: string } = {},
    options: RequestOptions = {},
  ) {
    const query = new URLSearchParams();
    if (filters.startDate) query.set("start_date", filters.startDate);
    if (filters.endDate) query.set("end_date", filters.endDate);

    const queryString = query.toString();
    const path = `/coins/${encodeURIComponent(coinId)}/price-history/variation${queryString ? `?${queryString}` : ""}`;

    return request<PriceHistoryVariation>(
      path,
      {},
      undefined,
      options,
      isPriceHistoryVariation,
    );
  },
};

export { API_BASE_URL };

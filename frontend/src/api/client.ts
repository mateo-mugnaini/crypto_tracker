import type {
  ApiErrorPayload,
  CoinListResponse,
  FavoriteActionResponse,
  FavoriteDetailsListResponse,
  FavoriteListResponse,
  PriceHistoryRecord,
  PriceHistoryStatistics,
  PriceHistoryVariation,
  PortfolioActionResponse,
  PortfolioHoldingInput,
  PortfolioResponse,
  TokenResponse,
  User,
} from "./types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

let unauthorizedHandler: (() => void) | null = null;

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
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function getErrorDetails(
  payload: ApiErrorPayload,
): { code: string; message: string; fields: unknown[] } {
  if (Array.isArray(payload.detail)) {
    return {
      code: "validation_error",
      message: "Revisá los datos ingresados.",
      fields: payload.detail,
    };
  }

  if (payload.detail && "code" in payload.detail) {
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

async function request<T>(
  path: string,
  options: RequestInit = {},
  token?: string | null,
): Promise<T> {
  const headers = new Headers(options.headers);
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers,
    });
  } catch {
    throw new ApiError(
      0,
      "network_error",
      "No se pudo conectar con la API.",
      null,
    );
  }

  if (response.status === 204) {
    return null as T;
  }

  const requestId = response.headers.get("X-Request-ID");
  const payload = (await response.json().catch(() => null)) as
    | T
    | ApiErrorPayload
    | null;

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
    );
  }

  return payload as T;
}

export const api = {
  register(username: string, email: string, password: string) {
    return request<User>("/users/register", {
      method: "POST",
      body: JSON.stringify({ username, email, password }),
    });
  },

  login(email: string, password: string) {
    return request<TokenResponse>("/users/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
  },

  getCurrentUser(token: string) {
    return request<User>("/users/me", {}, token);
  },

  getCoins() {
    return request<CoinListResponse>("/coins");
  },

  updateCurrentPrice(coinId: string) {
    return request<PriceHistoryRecord>(
      `/coins/${encodeURIComponent(coinId)}/price`,
      { method: "POST" },
    );
  },

  getFavoriteDetails(userId: number, token: string) {
    const query = new URLSearchParams({ user_id: String(userId) });
    return request<FavoriteDetailsListResponse>(
      `/favorites/details?${query.toString()}`,
      {},
      token,
    );
  },

  getFavorites(userId: number, token: string) {
    const query = new URLSearchParams({ user_id: String(userId) });
    return request<FavoriteListResponse>(
      `/favorites?${query.toString()}`,
      {},
      token,
    );
  },

  addFavorite(userId: number, coinId: string, token: string) {
    return request<FavoriteActionResponse>(
      "/favorites",
      {
        method: "POST",
        body: JSON.stringify({ user_id: userId, coin_id: coinId }),
      },
      token,
    );
  },

  removeFavorite(userId: number, coinId: string, token: string) {
    const query = new URLSearchParams({ user_id: String(userId) });
    return request<null>(
      `/favorites/${encodeURIComponent(coinId)}?${query.toString()}`,
      { method: "DELETE" },
      token,
    );
  },

  getPortfolio(token: string) {
    return request<PortfolioResponse>("/portfolio", {}, token);
  },

  savePortfolioHolding(input: PortfolioHoldingInput, token: string) {
    return request<PortfolioResponse>(
      "/portfolio/holdings",
      {
        method: "POST",
        body: JSON.stringify(input),
      },
      token,
    );
  },

  removePortfolioHolding(coinId: string, token: string) {
    return request<PortfolioActionResponse>(
      `/portfolio/holdings/${encodeURIComponent(coinId)}`,
      { method: "DELETE" },
      token,
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

    return request<PriceHistoryRecord[]>(path);
  },

  getPriceStatistics(coinId: string) {
    return request<PriceHistoryStatistics>(
      `/coins/${encodeURIComponent(coinId)}/price-history/statistics`,
    );
  },

  getPriceVariation(
    coinId: string,
    filters: { startDate?: string; endDate?: string } = {},
  ) {
    const query = new URLSearchParams();
    if (filters.startDate) query.set("start_date", filters.startDate);
    if (filters.endDate) query.set("end_date", filters.endDate);

    const queryString = query.toString();
    const path = `/coins/${encodeURIComponent(coinId)}/price-history/variation${queryString ? `?${queryString}` : ""}`;

    return request<PriceHistoryVariation>(path);
  },
};

export { API_BASE_URL };

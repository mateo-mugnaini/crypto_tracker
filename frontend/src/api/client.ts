import type {
  ApiErrorPayload,
  CoinListResponse,
  TokenResponse,
  User,
} from "./types";

const API_BASE_URL = (
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"
).replace(/\/$/, "");

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
};

export { API_BASE_URL };

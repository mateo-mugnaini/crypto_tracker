import { afterEach, describe, expect, it, vi } from "vitest";

import { ApiError, api, setUnauthorizedHandler } from "./client";

function mockResponse(body: unknown, status = 200, headers?: HeadersInit) {
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(JSON.stringify(body), {
        headers: { "Content-Type": "application/json", ...headers },
        status,
      }),
    ),
  );
}

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("api client", () => {
  it("envía el body JSON y devuelve la respuesta de login", async () => {
    mockResponse({ access_token: "token-123", token_type: "bearer" });

    await expect(api.login("mateo@example.com", "password123")).resolves.toEqual({
      access_token: "token-123",
      token_type: "bearer",
    });

    expect(fetch).toHaveBeenCalledWith(
      "http://127.0.0.1:8000/users/login",
      expect.objectContaining({
        body: JSON.stringify({ email: "mateo@example.com", password: "password123" }),
        method: "POST",
      }),
    );
  });

  it("agrega el bearer token y conserva el request id de una respuesta fallida", async () => {
    mockResponse(
      { detail: { code: "invalid_token", message: "Token inválido." } },
      401,
      { "X-Request-ID": "request-123" },
    );
    const onUnauthorized = vi.fn();
    const cleanup = setUnauthorizedHandler(onUnauthorized);

    try {
      await expect(api.getCurrentUser("expired-token")).rejects.toMatchObject({
        code: "invalid_token",
        requestId: "request-123",
        status: 401,
      });
      expect(onUnauthorized).toHaveBeenCalledOnce();
      const requestOptions = vi.mocked(fetch).mock.calls[0][1];
      expect(new Headers(requestOptions?.headers).get("Authorization")).toBe(
        "Bearer expired-token",
      );
    } finally {
      cleanup();
    }
  });

  it("normaliza un error de red como ApiError", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("offline")));

    const error = await api.getCoins().catch((caughtError) => caughtError);

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ code: "network_error", status: 0 });
  });

  it("expone los campos de validación del backend", async () => {
    mockResponse(
      {
        detail: [
          { loc: ["body", "email"], msg: "Email inválido.", type: "value_error" },
        ],
      },
      422,
    );

    await expect(api.register("mateo", "invalid", "password123")).rejects.toMatchObject(
      {
        code: "validation_error",
        fields: [{ loc: ["body", "email"] }],
        status: 422,
      },
    );
  });

  it("clasifica una respuesta exitosa que no cumple el contrato", async () => {
    mockResponse({ success: true, data: [] });

    await expect(api.getCoins()).rejects.toMatchObject({
      code: "invalid_response",
      kind: "contract",
      status: 200,
    });
  });

  it("cancela una solicitud cuando se aborta su signal", async () => {
    const controller = new AbortController();
    vi.stubGlobal(
      "fetch",
      vi.fn((_url: string, options: RequestInit) => {
        if (options.signal?.aborted) {
          return Promise.reject(new DOMException("Aborted", "AbortError"));
        }

        return new Promise((_, reject) => {
          options.signal?.addEventListener("abort", () => {
            reject(new DOMException("Aborted", "AbortError"));
          });
        });
      }),
    );
    controller.abort();

    await expect(api.getCoins({ signal: controller.signal })).rejects.toMatchObject({
      code: "request_aborted",
      kind: "aborted",
    });
  });

  it("clasifica como timeout una solicitud que supera su límite", async () => {
    vi.useFakeTimers();
    vi.stubGlobal(
      "fetch",
      vi.fn(
        (_url: string, options: RequestInit) =>
          new Promise((_, reject) => {
            options.signal?.addEventListener("abort", () => {
              reject(new DOMException("Aborted", "AbortError"));
            });
          }),
      ),
    );

    try {
      const request = api.getCoins({ timeoutMs: 25 });
      const rejection = expect(request).rejects.toMatchObject({
        code: "request_timeout",
        kind: "timeout",
      });
      await vi.advanceTimersByTimeAsync(25);

      await rejection;
    } finally {
      vi.useRealTimers();
    }
  });
});

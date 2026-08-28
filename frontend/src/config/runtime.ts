const LOCAL_API_URL = "http://127.0.0.1:8000";
const DEFAULT_API_TIMEOUT_MS = 10_000;

function getApiBaseUrl() {
  const configuredUrl = import.meta.env.VITE_API_BASE_URL?.trim();
  const isLocalBuild = import.meta.env.DEV || import.meta.env.MODE === "test";
  const apiBaseUrl = configuredUrl || (isLocalBuild ? LOCAL_API_URL : "");

  if (!apiBaseUrl) {
    throw new Error(
      "Falta VITE_API_BASE_URL. Configura la URL de la API antes de desplegar el frontend.",
    );
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(apiBaseUrl);
  } catch {
    throw new Error("VITE_API_BASE_URL debe ser una URL absoluta válida.");
  }

  if (parsedUrl.protocol !== "http:" && parsedUrl.protocol !== "https:") {
    throw new Error("VITE_API_BASE_URL solo puede utilizar http o https.");
  }
  if (!isLocalBuild && parsedUrl.protocol !== "https:") {
    throw new Error("VITE_API_BASE_URL debe utilizar HTTPS fuera de desarrollo.");
  }

  return apiBaseUrl.replace(/\/$/, "");
}

function getPositiveNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getNonNegativeNumber(value: string | undefined, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : fallback;
}

export const runtimeConfig = Object.freeze({
  apiBaseUrl: getApiBaseUrl(),
  apiTimeoutMs: getPositiveNumber(
    import.meta.env.VITE_API_TIMEOUT_MS,
    DEFAULT_API_TIMEOUT_MS,
  ),
  marketRefreshIntervalMs: getNonNegativeNumber(
    import.meta.env.VITE_MARKET_REFRESH_INTERVAL_MS,
    0,
  ),
  marketLiveEnabled: import.meta.env.VITE_MARKET_LIVE_ENABLED !== "false",
});

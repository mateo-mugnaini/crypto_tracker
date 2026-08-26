const apiBaseUrl = (process.env.VITE_API_BASE_URL || "http://127.0.0.1:8000").replace(
  /\/$/,
  "",
);
const endpoint = `${apiBaseUrl}/health/live`;
const controller = new AbortController();
const timeout = setTimeout(() => controller.abort(), 5_000);

try {
  const response = await fetch(endpoint, {
    headers: { Accept: "application/json" },
    signal: controller.signal,
  });

  if (!response.ok) {
    console.error(`Health check falló: HTTP ${response.status}`);
    process.exitCode = 1;
  } else {
    console.log(`Health check correcto: ${endpoint}`);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : "error desconocido";
  console.error(`Health check no disponible: ${message}`);
  process.exitCode = 1;
} finally {
  clearTimeout(timeout);
}

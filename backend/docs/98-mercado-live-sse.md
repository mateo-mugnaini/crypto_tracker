# Módulo 22: mercado live por SSE

La API expone `GET /market/stream`, protegido con Bearer token. El stream envía:

- `market_snapshot`: estado inicial de todas las monedas locales.
- `price_snapshot`: actualización incremental de una moneda después de cada ciclo del scheduler.
- comentarios keep-alive cada 15 segundos para mantener abierta la conexión.

El frontend consume el stream mediante `fetch` para poder enviar el token en el encabezado `Authorization`; no se expone el token en la URL como ocurriría con un `EventSource` nativo.

## Configuración

En `frontend/.env`:

```env
VITE_MARKET_LIVE_ENABLED=true
```

En `backend/.env` se debe activar el scheduler para que existan nuevos snapshots:

```env
PRICE_UPDATE_ENABLED=true
PRICE_UPDATE_INTERVAL_SECONDS=300
```

Si el stream falla, el frontend muestra `Fallback por polling` y usa `VITE_MARKET_REFRESH_INTERVAL_MS` o, si está en cero, un intervalo seguro de 30 segundos. La reconexión usa backoff exponencial hasta 30 segundos.

## Límite de alcance

El hub actual es en memoria y funciona dentro de un único proceso Uvicorn. Para varias réplicas habrá que sustituirlo por Redis Pub/Sub u otro broker compartido.

# Frontend 09 — Actualización manual de precios

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Backend consumido:** `POST /coins/{coin_id}/price`

## Objetivo

Permitir que el usuario solicite manualmente el precio actual de una moneda y
que el nuevo registro quede reflejado en las vistas del dashboard.

## Incluido

- Método `api.updateCurrentPrice(coinId)`.
- Botón `Precio` en cada tarjeta de `CoinsPanel`.
- Estado de actualización individual por moneda.
- Mensaje de error si CoinGecko o el backend no responden.
- Confirmación visual cuando el registro fue creado.
- Refresco posterior del mercado, historial y comparación.

## Flujo

```text
CoinsPanel
  ↓ POST /coins/{coin_id}/price
Backend → CoinGecko /simple/price
  ↓
price_history
  ↓
MarketContext.refresh()
  ↓
Historial y comparación actualizados
```

El endpoint devuelve el registro creado con `price` y `recorded_at`. El
frontend no modifica el precio localmente ni simula la respuesta.

## Alcance

Esta etapa es exclusivamente manual. No introduce polling, tareas de fondo ni
scheduler; la actualización automática corresponde al roadmap del backend.

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- Polling opcional para releer datos del dashboard.
- Integración con scheduler cuando exista en el backend.

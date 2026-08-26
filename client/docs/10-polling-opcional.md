# Frontend 10 — Polling opcional del mercado

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Configuración:** `VITE_MARKET_REFRESH_INTERVAL_MS`

## Objetivo

Preparar el dashboard para releer periódicamente el estado del backend, sin
activar por defecto una tarea que pueda generar tráfico innecesario.

## Configuración

```dotenv
VITE_MARKET_REFRESH_INTERVAL_MS=0
```

- `0`: polling desactivado, valor recomendado durante desarrollo normal.
- `30000`: refresco cada 30 segundos.
- `60000`: refresco cada 60 segundos.

El valor se interpreta en milisegundos y se configura en el `.env` local del
frontend. Después de modificarlo hay que reiniciar Vite.

## Alcance

El polling ejecuta `MarketContext.refresh()`, que vuelve a consultar `GET
/coins` y provoca la actualización de historial y comparación. No ejecuta
`POST /coins/{coin_id}/price`, no consulta CoinGecko directamente y no crea
nuevos registros de precios por sí mismo.

Para que aparezcan nuevos precios automáticamente, el backend debe tener
implementado el scheduler previsto en su roadmap.

## Feedback visual

Cuando el intervalo es mayor que cero, el dashboard muestra el indicador
`Auto lectura Ns`. El botón manual `Refrescar` continúa disponible.

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- Integrar el polling con datos creados por el scheduler del backend.

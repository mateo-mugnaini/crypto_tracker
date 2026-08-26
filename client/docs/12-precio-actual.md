# Frontend 12 — Precio actual en el dashboard

> **Estado:** IMPLEMENTADO Y VERIFICADO LOCALMENTE

## Objetivo

Mostrar en cada tarjeta de moneda el último precio persistido por el backend,
sin realizar una consulta individual por moneda.

## Contrato consumido

`GET /coins` devuelve el campo opcional `current_price`:

```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "market_cap_rank": 1,
  "current_price": 65000.25
}
```

Cuando todavía no existe historial para una moneda, el frontend muestra
`Sin datos`.

## Flujo

```text
Scheduler o actualización manual
          ↓
price_history
          ↓
GET /coins
          ↓
MarketContext
          ↓
CoinsPanel
```

El cache y el polling existentes siguen funcionando. Cuando el polling obtiene
una respuesta nueva, el dashboard puede reflejar el último precio sin generar
una petición por cada moneda.

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

La siguiente validación será levantar MySQL, backend y frontend juntos para
comprobar el flujo real con el scheduler habilitado.

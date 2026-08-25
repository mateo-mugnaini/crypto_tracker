# Frontend 05 — Historial de precios, filtros y paginación

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Backend consumido:** `/coins/{coin_id}/price-history`

## Objetivo

Mostrar la evolución registrada de una moneda usando los endpoints existentes
del backend, con filtros y navegación paginada desde el dashboard.

## Incluido

- `PriceHistoryPanel` dentro de `components/dashboard/`.
- Selector de moneda basado en `GET /coins`.
- Historial desde `GET /coins/{coin_id}/price-history`.
- Filtros por fecha inicial, fecha final, precio mínimo y precio máximo.
- Orden por fecha o precio, ascendente o descendente.
- Paginación con diez registros visibles por página.
- Estadísticas de cantidad, mínimo y máximo.
- Indicador de variación y tendencia.
- Estados de carga, vacío y error.

## Contrato utilizado

```text
GET /coins/{coin_id}/price-history
  ?start_date=YYYY-MM-DD
  &end_date=YYYY-MM-DD
  &min_price=0
  &max_price=100000
  &limit=11
  &offset=0
  &sort_by=recorded_at
  &sort_order=desc
```

El frontend solicita un registro adicional (`limit=11`) para saber si existe
una página siguiente, pero solo muestra diez filas.

También consulta:

- `GET /coins/{coin_id}/price-history/statistics`;
- `GET /coins/{coin_id}/price-history/variation`.

## Estructura

```text
src/
├── api/
│   ├── client.ts
│   └── types.ts
├── components/dashboard/
│   ├── PriceHistoryPanel.tsx
│   └── PriceHistoryPanel.module.css
└── pages/dashboard/
    └── DashboardPage.tsx
```

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- Gráfico de evolución temporal.
- Comparación visual entre monedas.

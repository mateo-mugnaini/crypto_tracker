# Frontend 08 — Cache compartido y refresco del dashboard

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Alcance:** datos de mercado y estados de dashboard

## Objetivo

Evitar que cada panel consulte por separado la lista de monedas y ofrecer una
forma explícita de refrescar los datos visibles sin adelantar todavía el
scheduler automático de precios del backend.

## Incluido

- `MarketContext` compartido por los paneles del dashboard.
- Una única request concurrente para `GET /coins`.
- Cache en memoria con TTL de 30 segundos.
- Refresco manual desde `Topbar`.
- Hora de última actualización visible.
- Estados `idle`, `loading`, `success` y `error`.
- Botones de reintento en errores de carga de mercado.
- Recarga de historial y comparación cuando cambia la actualización del
  mercado.

## Política de cache

```text
Panel solicita monedas
  ↓
Cache vigente (< 30 s) → reutilizar datos
  ↓
Cache vencida → una request compartida
  ↓
Refrescar → ignorar cache y consultar API
```

El cache es únicamente de sesión en memoria: no persiste monedas ni precios en
el navegador y no reemplaza la base de datos del backend.

## Alcance

El botón `Refrescar` vuelve a consultar los datos persistidos por el backend.
No ejecuta `POST /coins/{coin_id}/price` ni actualiza precios en CoinGecko. Esa
responsabilidad pertenece a la etapa posterior de integración del endpoint
manual, y la actualización automática permanece planificada para el backend.

## Estructura

```text
src/
├── features/market/
│   └── MarketContext.tsx
├── components/dashboard/
│   ├── CoinsPanel.tsx
│   ├── PriceHistoryPanel.tsx
│   ├── PriceComparisonPanel.tsx
│   └── Topbar.tsx
└── App.tsx
```

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- Automatización de precios cuando el scheduler del backend esté implementado.
- Polling o eventos en tiempo real si el producto lo requiere.

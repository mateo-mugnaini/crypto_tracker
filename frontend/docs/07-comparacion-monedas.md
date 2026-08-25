# Frontend 07 — Comparación normalizada entre monedas

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Backend consumido:** `/coins/{coin_id}/price-history`

## Objetivo

Comparar la evolución de dos monedas sin confundir precio absoluto con
rendimiento relativo.

## Incluido

- Selección de dos monedas sincronizadas.
- Consulta de hasta 60 observaciones por moneda.
- Normalización de cada serie a `0%` en su primer registro.
- Gráfico SVG con dos líneas y leyenda.
- Variación final porcentual de cada moneda.
- Manejo de una o ninguna serie disponible.
- Componentes y estilos aislados en `components/dashboard/`.

## Normalización

Para cada serie se calcula:

```text
variación % = ((precio_actual - precio_inicial) / precio_inicial) × 100
```

Así, una moneda que pasa de 100 a 110 y otra que pasa de 50.000 a 55.000
aparecen ambas con una variación de `+10%`.

## Estructura

```text
src/components/dashboard/
├── PriceComparisonPanel.tsx
├── PriceComparisonPanel.module.css
├── ComparisonChart.tsx
└── ComparisonChart.module.css
```

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- Integración del endpoint manual de actualización de precios.
- Confirmación visual de registros nuevos.

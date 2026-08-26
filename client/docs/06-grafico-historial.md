# Frontend 06 — Gráfico SVG del historial

> **Estado:** VERIFICADO LOCALMENTE
> **Proyecto:** Crypto Tracker
> **Componente:** `PriceHistoryChart`

## Objetivo

Representar visualmente los registros que ya devuelve el historial, sin agregar
una dependencia externa de gráficos en esta etapa.

## Incluido

- Gráfico de línea SVG responsive.
- Orden temporal ascendente para dibujar la serie.
- Escala vertical calculada a partir del mínimo y máximo visibles.
- Etiquetas de precio y fechas inicial/final.
- Puntos interactivos con detalle de fecha y precio mediante `title`.
- Estado vacío cuando los filtros no devuelven registros.
- Estilos aislados en `PriceHistoryChart.module.css`.

El gráfico representa la página actualmente cargada y respeta la moneda y los
filtros seleccionados en `PriceHistoryPanel`.

## Estructura

```text
src/components/dashboard/
├── PriceHistoryPanel.tsx
├── PriceHistoryPanel.module.css
├── PriceHistoryChart.tsx
└── PriceHistoryChart.module.css
```

## Decisión técnica

Se utilizó SVG nativo porque el gráfico actual solo necesita una serie lineal,
escalado básico y tooltips simples. Esto evita introducir una dependencia antes
de definir las necesidades de comparación y zoom.

## Verificación

```powershell
npm run build
```

Resultado: TypeScript y Vite compilan correctamente.

## Próximo módulo

- Estados avanzados de carga y refresco.
- Optimización de consultas y cache del dashboard.

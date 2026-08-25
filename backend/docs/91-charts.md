# Módulo 91 — Charts

> **Estado:** CONTRATO DE SERIES DOCUMENTADO; UI PENDIENTE
> **Proyecto:** Crypto Tracker
> **Capa:** Datos analíticos / Presentación
> **Módulo anterior:** 90 — Paginación, filtros y UI
> **Siguiente módulo:** 92 — Integración final

## 1. Objetivo

Definir cómo transformar las respuestas analíticas del backend en indicadores y
series para gráficos. El backend no conoce la librería visual: entrega datos
tipados y ordenados; la UI decidirá si usa SVG, Canvas, una librería de charts o
componentes propios.

## 2. Endpoints analíticos

| Uso | Endpoint | Respuesta |
| --- | --- | --- |
| KPIs del periodo | `GET /coins/{coin_id}/price-history/statistics` | Objeto de estadísticas |
| Cambio y tendencia | `GET /coins/{coin_id}/price-history/variation` | Objeto de variación |
| Serie agrupada | `GET /coins/{coin_id}/price-history/aggregations?period=day` | Lista de puntos |

Las tres rutas aceptan `start_date` y `end_date` cuando corresponde. Las fechas
se envían como `YYYY-MM-DD`.

## 3. Estadísticas para tarjetas KPI

Request:

```text
/coins/bitcoin/price-history/statistics
```

Response:

```json
{
  "coin_id": "bitcoin",
  "count": 120,
  "min_price": 60000.0,
  "max_price": 68000.0,
  "average_price": 64125.5
}
```

Mapeo sugerido:

```text
count         → cantidad de observaciones
min_price     → mínimo del periodo
max_price     → máximo del periodo
average_price → promedio del periodo
```

Cuando la moneda no tiene historial, `count` es `0` y los tres precios pueden
ser `null`. La UI debe mostrar "Sin datos" en lugar de convertir `null` a cero.

## 4. Variación para tendencia

Request:

```text
/coins/bitcoin/price-history/variation?start_date=2026-08-01&end_date=2026-08-31
```

Response:

```json
{
  "coin_id": "bitcoin",
  "initial_price": 60000.0,
  "final_price": 65000.0,
  "absolute_change": 5000.0,
  "percentage_change": 8.3333333333,
  "trend": "up"
}
```

Valores posibles de `trend`:

```text
up         → absolute_change > 0
down       → absolute_change < 0
unchanged  → absolute_change == 0
null       → no hay datos suficientes
```

`percentage_change` puede ser `null` cuando el precio inicial es cero. El
frontend debe comprobar nullabilidad antes de formatear porcentajes.

## 5. Agregaciones para series

Request:

```text
/coins/bitcoin/price-history/aggregations?period=day&start_date=2026-08-01&end_date=2026-08-31
```

Response:

```json
[
  {
    "period": "2026-08-01",
    "average_price": 62000.0,
    "min_price": 61500.0,
    "max_price": 63000.0,
    "count": 24
  },
  {
    "period": "2026-08-02",
    "average_price": 63500.0,
    "min_price": 62800.0,
    "max_price": 64200.0,
    "count": 24
  }
]
```

Periodos permitidos:

| `period` | Agrupación | Uso sugerido |
| --- | --- | --- |
| `hour` | Hora | Rango corto o intradía |
| `day` | Día | Vista principal |
| `week` | Semana iniciada el lunes | Tendencia larga |

El backend ordena los puntos ascendentemente por periodo. No hay relleno de
periodos sin observaciones: una fecha ausente significa que no hubo una fila
agrupable, no necesariamente precio cero.

## 6. Transformación a una librería de charts

El contrato backend puede convertirse a una serie genérica:

```javascript
const points = aggregations.map((row) => ({
  x: row.period,
  y: row.average_price,
  min: row.min_price,
  max: row.max_price,
  count: row.count,
}));
```

Configuraciones típicas:

```text
Eje X → period
Eje Y → average_price
Tooltip → average_price, min_price, max_price, count
Área opcional → min_price a max_price
```

Si una librería no acepta `null`, el cliente debe filtrar o representar el
punto como vacío; no debe reemplazarlo silenciosamente por `0`.

## 7. Elección del endpoint

```text
Pocos registros y detalle exacto
    → /price-history con limit/offset

Vista resumida de tendencia
    → /price-history/aggregations

Tarjetas de resumen
    → /statistics + /variation
```

Para una gráfica de periodo largo se debe preferir agregación. Descargar miles
de observaciones crudas para agruparlas en el navegador duplica trabajo y
aumenta el payload.

## 8. Estados de una gráfica

Cada visualización debe manejar explícitamente:

```text
idle       → todavía no se pidió el periodo
loading    → request en curso
ready      → hay puntos o KPIs
empty      → request válida sin datos
error      → request fallida
```

`empty` y `error` no son equivalentes. Una moneda sin historial puede mostrar
un estado vacío con una acción para cambiar fechas o sincronizar datos.

Si se cargan KPIs y serie en paralelo, la UI puede renderizar cada bloque cuando
esté listo, pero debe conservar un estado de error independiente por request.

## 9. Fechas, moneda y formato

- Las fechas de filtro son `YYYY-MM-DD`.
- `recorded_at` y `period` llegan como strings serializados.
- El precio actual se consulta en USD en la sincronización CoinGecko.
- El backend no redondea para presentación; la UI debe decidir decimales.
- Los porcentajes deben formatearse como porcentaje, no como fracción.
- No debe asumirse timezone UTC para `recorded_at` hasta fijar una política
  global, porque el campo no trae offset.

## 10. Accesibilidad y UX

Un gráfico no debe ser la única forma de leer un dato. La UI debe ofrecer:

- tarjetas o tabla con valores principales;
- labels de ejes y unidades;
- tooltip accesible o alternativa tabular;
- texto para estados vacío, error y carga;
- colores que no sean la única señal de `up`/`down`;
- formato legible para precios y porcentajes.

## 11. Errores y reintentos

- `422`: fechas o periodo inválido;
- error de red: API inaccesible;
- `200` con `[]`: serie sin observaciones;
- `502`: indisponibilidad de CoinGecko en operaciones que dependan de él.

Las lecturas pueden reintentarse con backoff limitado. La guía general está en
[`docs/89-errores-frontend.md`](89-errores-frontend.md).

## 12. Limitaciones actuales

- No existe streaming ni WebSocket.
- No hay actualización automática de precios.
- No se rellenan huecos temporales.
- No hay total o metadata de paginación para la serie cruda.
- `frontend/` no tiene stack ni implementación visual.

## 13. Checklist

- [x] Estadísticas documentadas.
- [x] Variación y tendencias documentadas.
- [x] Agregaciones por hora, día y semana documentadas.
- [x] Transformación a puntos de gráfico documentada.
- [x] Nullabilidad y ausencia de datos documentadas.
- [x] Estados de carga, vacío y error definidos.
- [x] Consideraciones de timezone y moneda registradas.
- [ ] Elegir librería o implementar charts en frontend.
- [ ] Crear tests de transformación de series.
- [ ] Definir actualización automática o tiempo real.

## 14. Verificación

Los modelos de respuesta y las capas de estadísticas, variación y agregación
están cubiertos por pruebas existentes. Verificación completa:

```powershell
python -m pytest -q
python -m unittest discover -s app/tests -p "*_test.py"
```

## 15. Estado final

M91 deja preparado el contrato analítico para construir gráficos sin mover la
lógica de agregación al navegador. La visualización real queda pendiente de
crear el frontend y seleccionar su tecnología.

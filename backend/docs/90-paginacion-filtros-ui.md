# Módulo 90 — Paginación, filtros y UI

> **Estado:** CONTRATO DE CONSULTA DOCUMENTADO; UI PENDIENTE
> **Proyecto:** Crypto Tracker
> **Capa:** Consulta HTTP / Presentación
> **Módulo anterior:** 89 — Errores en frontend
> **Siguiente módulo:** 91 — Charts

## 1. Objetivo

Definir cómo una UI debe consultar el historial de precios usando paginación,
filtros y ordenamiento seguro. El backend ya implementa estas reglas; el
frontend todavía no tiene código ni framework.

La ruta principal es:

```http
GET /coins/{coin_id}/price-history
```

## 2. Parámetros disponibles

| Parámetro | Tipo | Default | Regla |
| --- | --- | ---: | --- |
| `start_date` | `YYYY-MM-DD` | vacío | Fecha inicial inclusiva |
| `end_date` | `YYYY-MM-DD` | vacío | Fecha final inclusiva |
| `min_price` | número | vacío | Mayor o igual a cero |
| `max_price` | número | vacío | Mayor o igual a cero |
| `limit` | entero | `20` | Entre `1` y `100` |
| `offset` | entero | `0` | Mayor o igual a cero |
| `sort_by` | enum | `recorded_at` | `recorded_at` o `price` |
| `sort_order` | enum | `asc` | `asc` o `desc` |

Ejemplo:

```text
/coins/bitcoin/price-history?start_date=2026-08-01&end_date=2026-08-31&min_price=60000&limit=20&offset=0&sort_by=recorded_at&sort_order=desc
```

El cliente debe construir la query con `URLSearchParams` o el equivalente del
framework, omitiendo filtros vacíos. No debe concatenar strings manualmente.

## 3. Respuesta

La respuesta actual es una lista directa, no un envelope:

```json
[
  {
    "id": 101,
    "coin_id": "bitcoin",
    "price": 65000.25,
    "recorded_at": "2026-08-25T12:00:00"
  }
]
```

Los campos son:

- `id`: identificador de la observación;
- `coin_id`: ID de CoinGecko;
- `price`: precio numérico;
- `recorded_at`: fecha y hora de la observación.

Si no hay resultados, el backend devuelve `[]` con status `200`.

## 4. Paginación actual

La API usa `limit/offset`:

```text
Página 1 → limit=20&offset=0
Página 2 → limit=20&offset=20
Página 3 → limit=20&offset=40
```

Como la respuesta no incluye `total`, `has_next` ni `next_offset`, el frontend
puede inferir una página siguiente cuando:

```javascript
const hasNextPage = rows.length === limit;
```

Esta inferencia es práctica, pero no garantiza que exista otra fila cuando la
última página tiene exactamente `limit` elementos. La UI debe soportar que la
siguiente petición devuelva `[]`.

La paginación futura podría evolucionar a:

```json
{
  "items": [],
  "limit": 20,
  "offset": 0,
  "total": 0,
  "has_next": false
}
```

Ese cambio sería un cambio de contrato y debe hacerse con una decisión explícita
de compatibilidad.

## 5. Estado de filtros en la UI

El estado recomendado debe separar filtros de paginación:

```text
filters:
  start_date
  end_date
  min_price
  max_price
  sort_by
  sort_order

pagination:
  limit
  offset

data:
  rows
  loading
  error
```

Cuando cambia cualquier filtro:

1. validar el formulario localmente;
2. volver a `offset=0`;
3. cancelar o ignorar la request anterior si existe;
4. consultar la primera página;
5. reemplazar las filas anteriores.

Cuando cambia de página, se conserva el filtro y solo se actualiza `offset`.

## 6. Filtros de fecha

El backend recibe fechas sin hora. Internamente interpreta:

```text
start_date → comienzo del día
end_date   → final del día
```

La UI debe enviar `YYYY-MM-DD` y no una fecha ISO con hora para estos campos.
Las fechas `start_date > end_date` generan `422`.

`recorded_at` llega como datetime sin offset explícito. Hasta definir una
política de timezone global, el frontend debe evitar asumir que la cadena es
UTC y debe mostrarla según la convención acordada por el producto.

## 7. Filtros de precio

`min_price` y `max_price` aceptan números no negativos. Si ambos están presentes,
`min_price` no puede ser mayor que `max_price`.

La UI debería usar inputs numéricos y mostrar el error cerca del campo. No debe
enviar el símbolo de moneda ni separadores locales dentro del valor:

```text
Correcto: 65000.50
Incorrecto: $65.000,50
```

La moneda de referencia actual es USD porque CoinGecko se consulta con
`vs_currency="usd"`.

## 8. Ordenamiento

El backend solo permite:

```text
sort_by=recorded_at | price
sort_order=asc | desc
```

Los valores se normalizan a minúsculas. Cualquier otro campo genera `422`; esto
evita que valores de la UI lleguen como SQL arbitrario.

Para filas con el mismo valor de ordenamiento, el repository aplica `id ASC`
como desempate. Esto mantiene un orden estable entre páginas.

## 9. Consultas relacionadas

La UI puede cargar información agregada para una moneda:

| Necesidad | Endpoint |
| --- | --- |
| Resumen | `GET /coins/{coin_id}/price-history/statistics` |
| Cambio inicial/final | `GET /coins/{coin_id}/price-history/variation` |
| Serie agrupada | `GET /coins/{coin_id}/price-history/aggregations?period=day` |

Las agregaciones aceptan `period=hour`, `day` o `week` y comparten los filtros
de fecha. El módulo 91 definirá su uso para gráficos.

## 10. Debounce y cancelación

Los filtros de texto o precio pueden usar debounce para no consultar en cada
tecla. Los botones de paginación no necesitan debounce.

La UI debe evitar que una respuesta vieja sobrescriba una más reciente. Puede
usar `AbortController`, un identificador incremental de request o la solución
equivalente del framework.

No se recomienda cachear indefinidamente el historial: los precios pueden
cambiar y la decisión de cache del backend fue deliberadamente conservadora.

## 11. Errores esperados

- `422`: filtros inválidos o rango inconsistente;
- `502`: CoinGecko no disponible en operaciones de actualización;
- error de red: API inaccesible;
- `200` con `[]`: filtro válido sin resultados.

La UI debe distinguir "sin resultados" de "falló la consulta". El primero no es
un error técnico y no debe mostrar una pantalla de error genérica.

## 12. Checklist

- [x] Parámetros y límites documentados.
- [x] Paginación `limit/offset` documentada.
- [x] Filtros de fecha y precio documentados.
- [x] Ordenamiento whitelist documentado.
- [x] Respuesta vacía diferenciada de error.
- [x] Desempate estable por `id` documentado.
- [x] Limitación por ausencia de `total` registrada.
- [ ] Implementar tabla o lista en frontend.
- [ ] Persistir filtros en URL del frontend.
- [ ] Agregar cancelación/debounce al cliente real.
- [ ] Elegir contrato paginado con metadata si el producto lo necesita.

## 13. Verificación

Las validaciones del contrato están cubiertas por pruebas API, unitarias e
integración de repository/servicio. La suite actual continúa ejecutándose con:

```powershell
python -m pytest -q
python -m unittest discover -s app/tests -p "*_test.py"
```

## 14. Estado final

M90 deja listo el contrato de consulta para que una futura UI implemente
filtros, paginación y tablas sin duplicar reglas del backend. La implementación
visual queda pendiente porque `frontend/` aún no tiene stack ni archivos.

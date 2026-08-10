# Modulo 44 - Paginacion de Price History

### Objetivo

Hasta ahora nuestro endpoint permite consultar el historial completo:

```shell
GET - /coins/{coin_id}/price-history
```

y aplicamos filtros:

- start_date
- end_date
- min_price
- max_price

El problema es que, a medida que crezca la cantidad de registros, devolver abosulutamente todo el historial puede ser costoso.

Por ejemplo, una criptomoneda podria tener:

- 10 registros.
- 100 registros.
- 10.000 registros
- 1.000.000 registros

Mo queremos que una peticion puede devolver indiscriminadamente millones de filas.

Ahora vamos a implementar la `PAGINACIÓN`

```shell
GET /coins/bitcoin/price-history?page=1&page_size=10
```

Conceptualmente:

```text
Todos los registros
       │
       ▼
┌─────────────────────────────┐
│ Page 1                      │
│ registros 1 - 10            │
├─────────────────────────────┤
│ Page 2                      │
│ registros 11 - 20           │
├─────────────────────────────┤
│ Page 3                      │
│ registros 21 - 30           │
└─────────────────────────────┘
```

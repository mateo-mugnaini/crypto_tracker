# Módulo 94 — Precio actual en el contrato de monedas

> **Estado:** IMPLEMENTADO Y VERIFICADO LOCALMENTE

## Objetivo

Exponer en las respuestas de monedas el último precio persistido por el
scheduler o por la actualización manual, para que el dashboard pueda mostrarlo
sin realizar una petición individual por moneda.

## Contrato

`GET /coins` y `GET /coins/{coin_id}` ahora incluyen:

```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "market_cap_rank": 1,
  "current_price": 65000.25
}
```

Si la moneda no tiene registros en `price_history`, `current_price` vale
`null`.

## Implementación

El repository obtiene el último registro ordenando por:

1. `recorded_at DESC`;
2. `id DESC` como desempate estable.

La consulta utiliza la relación existente entre `coins` y `price_history` y no
agrega una columna duplicada en `coins`. El índice recomendado es
`(coin_id, recorded_at, id)`.

El frontend muestra el valor en cada tarjeta del mercado y conserva el texto
`Sin datos` hasta que exista el primer precio.

## Verificación

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/api/test_api_endpoints.py app/tests/unit/test_coin_repository.py -q
```

El siguiente paso es verificar el flujo completo con MySQL, scheduler habilitado
y frontend levantado.

# Modulo 51 - Validacion avanzada y reglas cruzadas

## 1. Objetivo

En este modulo movimos la validacion un nivel mas arriba: no solo validamos campos sueltos, sino tambien relaciones entre campos y normalizacion de entrada.

## 2. Que aprendimos

- `Field()` permite declarar restricciones concretas.
- `field_validator()` sirve para normalizar valores antes de validarlos.
- `model_validator()` permite validar relaciones entre varios campos.
- `extra="forbid"` protege contra datos inesperados en el body.
- La validacion de HTTP y la validacion de negocio no son lo mismo.

## 3. Problema real que resolvimos

Antes del modulo 51, varias validaciones vivian en `Service` con parametros sueltos de la API.

Eso funcionaba, pero era menos expresivo y mas dificil de reutilizar. Ahora:

- `FavoriteCreateRequest` controla mejor la forma del body;
- `PriceHistoryQueryParams` valida rangos, ordenamiento y paginacion;
- `PriceHistoryDateRangeQueryParams` valida fechas cruzadas;
- `PriceHistoryAggregationQueryParams` valida el periodo de agregacion.

## 4. Arquitectura y flujo

La capa HTTP recibe los parametros y delega la validacion estructural a modelos Pydantic.

Flujo resumido:

1. FastAPI recibe la peticion.
2. Pydantic valida y normaliza la entrada.
3. El endpoint reenvia el resultado al controlador.
4. El servicio conserva sus validaciones de negocio como defensa adicional.

## 5. Archivos modificados

- `backend/app/schemas/favorite.py`
- `backend/app/schemas/price_history.py`
- `backend/app/api/app.py`
- `backend/app/tests/favorite_request_model_test.py`
- `backend/app/tests/price_history_query_models_test.py`

## 6. Cambios aplicados

### FavoriteCreateRequest

- `user_id` sigue siendo obligatorio y positivo.
- `coin_id` ahora:
  - recorta espacios;
  - convierte a minusculas;
  - limita longitud;
  - rechaza caracteres fuera del patron de id de CoinGecko;
  - rechaza campos extra.

### PriceHistoryQueryParams

- valida `start_date <= end_date`;
- valida `min_price <= max_price`;
- mantiene `limit` y `offset` dentro de rangos seguros;
- normaliza `sort_by` y `sort_order`;
- evita strings invalidas de ordenamiento.

### PriceHistoryDateRangeQueryParams

- encapsula la regla cruzada de fechas para variation y aggregations.

### PriceHistoryAggregationQueryParams

- valida y normaliza `period` a `hour`, `day` o `week`.

## 7. Decision tecnica

Usamos Pydantic para la validacion estructural y dejamos al service las reglas que siguen siendo relevantes aunque la API cambie o sea llamada desde otro sitio.

Eso evita que la logica de negocio dependa solo de la capa HTTP.

## 8. Integracion con FastAPI

Los endpoints de price history ahora consumen modelos de query:

- `GET /coins/{coin_id}/price-history`
- `GET /coins/{coin_id}/price-history/variation`
- `GET /coins/{coin_id}/price-history/aggregations`

La validacion de esos modelos se refleja en Swagger/OpenAPI y en el comportamiento de la API.

## 9. Tests creados o actualizados

- `backend/app/tests/favorite_request_model_test.py`
- `backend/app/tests/price_history_query_models_test.py`

Coberturas:

- normalizacion de `coin_id`;
- rechazo de campos extra;
- rango de fechas invalido;
- rango de precios invalido;
- normalizacion de `sort_by`, `sort_order` y `period`;
- propagacion de filtros ya validados hacia los controladores.

## 10. Resultado

La entrada de la API quedo mas expresiva, mas segura y mas facil de explicar.

## 11. Siguiente modulo

**Modulo 52 - Excepciones propias y HTTPException**

Ahi vamos a dar el salto de mensajes sueltos a errores de dominio y respuestas HTTP mas consistentes.

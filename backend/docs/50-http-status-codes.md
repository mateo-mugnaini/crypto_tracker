# Modulo 50 - HTTP Status Codes

## 1. Objetivo

En este modulo cerramos la semantica HTTP de los endpoints que ya teniamos, para que la API no solo devuelva datos correctos sino tambien el codigo de estado correcto.

## 2. Que aprendimos

- `200 OK` para consultas exitosas.
- `201 Created` para una alta real.
- `204 No Content` para una eliminacion exitosa sin cuerpo.
- `404 Not Found` cuando no existe el usuario, la moneda o el favorito.
- `409 Conflict` cuando se intenta crear un favorito duplicado.
- `422 Unprocessable Entity` sigue siendo el comportamiento automatico de FastAPI para validacion de request.

## 3. Problema real que resolvimos

Antes del modulo 50, la API devolvia el contenido correcto pero no siempre expresaba la situacion HTTP correcta.

Eso generaba dos problemas:

- el cliente no podia distinguir bien entre exito, conflicto y recurso ausente;
- la documentacion de OpenAPI no reflejaba de forma clara el comportamiento real.

## 4. Arquitectura y flujo

La responsabilidad de decidir el codigo HTTP vive en la capa `API`.

Flujo resumido:

1. FastAPI recibe la peticion.
2. El endpoint llama al controlador.
3. El controlador delega en el servicio.
4. El servicio decide si la operacion se puede hacer.
5. La API traduce el resultado a un status HTTP.

## 5. Archivos modificados

- `backend/app/api/app.py`
- `backend/app/tests/http_status_codes_test.py`
- `backend/prompt_maestro_v3.md`

## 6. Cambios aplicados

### `POST /favorites`

- devuelve `201 Created` cuando el favorito se crea;
- devuelve `404 Not Found` si no existe el usuario o la moneda;
- devuelve `409 Conflict` si el favorito ya existia.

### `DELETE /favorites/{coin_id}`

- devuelve `204 No Content` cuando la eliminacion fue exitosa;
- devuelve `404 Not Found` si el favorito no existia.

### Consultas GET

Los endpoints de consulta quedaron declarados con `200 OK` de forma explicita:

- `/coins`
- `/coins/{coin_id}`
- `/favorites`
- `/favorites/details`
- `/coins/{coin_id}/price-history`
- `/coins/{coin_id}/price-history/statistics`
- `/coins/{coin_id}/price-history/variation`
- `/coins/{coin_id}/price-history/aggregations`

## 7. Decision tecnica

Como el `FavoriteService` todavia devuelve mensajes y no errores tipados de dominio, la capa HTTP hace un mapeo pequeno desde esos mensajes hacia el status correcto.

Eso es aceptable en este punto porque:

- no rompe la arquitectura por capas;
- mantiene el cambio localizado;
- prepara el camino para el modulo de errores y validacion avanzada.

## 8. Tests creados

- `backend/app/tests/http_status_codes_test.py`

Coberturas:

- status codes declarados en las rutas;
- `201` al crear favoritos;
- `404` cuando faltan entidades;
- `409` cuando hay duplicados;
- `204` al eliminar correctamente;
- `404` al eliminar algo inexistente.

## 9. Resultado

La API ya comunica mejor el resultado de cada operacion. Eso hace mas claro el contrato para frontend, Swagger y pruebas futuras.

## 10. Siguiente modulo

**Modulo 51 - Validacion avanzada y reglas cruzadas**

En ese modulo vamos a dejar de depender solo de mensajes y vamos a subir un nivel en reglas de negocio, validaciones compuestas y manejo mas formal de errores.

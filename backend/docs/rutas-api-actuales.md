# Rutas actuales de Crypto Tracker API

Este documento es el inventario vivo de rutas del backend. Debe actualizarse en cada módulo que cree, modifique o elimine un endpoint.

Base local habitual: `http://127.0.0.1:8000`

## Generales

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/` | Comprueba que la API está en ejecución y devuelve un mensaje simple. |

## Coins

| Método | Ruta | Descripción |
|---|---|---|
| `GET` | `/coins` | Obtiene las monedas persistidas localmente. |
| `POST` | `/coins/sync` | Consulta CoinGecko y sincroniza las monedas configuradas con la base local. |
| `GET` | `/coins/{coin_id}` | Obtiene una moneda local por su identificador de CoinGecko. |
| `POST` | `/coins/{coin_id}` | Sincroniza o actualiza una moneda concreta desde CoinGecko. |

## Favorites

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/favorites` | Agrega una moneda a los favoritos de un usuario. Recibe `user_id` y `coin_id` en el body. |
| `DELETE` | `/favorites/{coin_id}?user_id={user_id}` | Elimina una moneda de los favoritos del usuario indicado. Devuelve `204` si tiene éxito. |
| `GET` | `/favorites?user_id={user_id}` | Obtiene las relaciones de favoritos de un usuario. |
| `GET` | `/favorites/details?user_id={user_id}` | Obtiene los favoritos junto con datos de cada moneda. |

## Users

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/users/register` | Registra un usuario. Recibe username, email y password; persiste solo el hash y no lo devuelve. |

## Price History

| Método | Ruta | Descripción |
|---|---|---|
| `POST` | `/coins/{coin_id}/price` | Solicita la actualización de un precio para una moneda. |
| `GET` | `/coins/{coin_id}/price-history` | Obtiene historial de precios. Admite fechas, rango de precios, paginación y ordenamiento. |
| `GET` | `/coins/{coin_id}/price-history/statistics` | Devuelve cantidad, mínimo, máximo y promedio de precios. |
| `GET` | `/coins/{coin_id}/price-history/variation` | Calcula precio inicial/final, diferencia y porcentaje de variación; acepta rango de fechas. |
| `GET` | `/coins/{coin_id}/price-history/aggregations` | Agrupa el historial por hora, día o semana; acepta rango de fechas. |

## Respuestas de error relevantes

| Status | Situación |
|---:|---|
| `404` | Usuario, moneda o favorito inexistente. |
| `409` | Favorito duplicado o email ya registrado. |
| `422` | Body, path o query params inválidos. |
| `502` | Fallo al comunicarse con CoinGecko. |

## Documentación interactiva

- Swagger UI: `/docs`
- ReDoc: `/redoc`
- Esquema OpenAPI: `/openapi.json`

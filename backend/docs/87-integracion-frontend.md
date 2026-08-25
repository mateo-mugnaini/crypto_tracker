# Módulo 87 — Integración frontend-backend

> **Estado:** CONTRATO PREPARADO; CLIENTE FRONTEND PENDIENTE
> **Proyecto:** Crypto Tracker
> **Capa:** Contrato HTTP / Integración
> **Módulo anterior:** 86 — Preparación para deployment
> **Siguiente módulo:** 88 — Auth frontend

## 1. Hallazgo inicial

La carpeta `frontend/` existe en el repositorio, pero actualmente está vacía:

- no hay `package.json`;
- no hay framework seleccionado;
- no hay cliente HTTP;
- no hay pantallas ni estado de autenticación;
- no hay variables de entorno del frontend.

Por eso este módulo no inventa una implementación React, Next.js, Vite u otra.
Deja preparado el contrato que deberá consumir el cliente cuando se defina su
stack.

## 2. URL base

En desarrollo, el backend se ejecuta normalmente en:

```text
http://127.0.0.1:8000
```

El frontend debe recibir esta URL mediante configuración del entorno, no tenerla
repetida en cada request. Por ejemplo, el concepto equivalente sería:

```text
PUBLIC_API_BASE_URL=http://127.0.0.1:8000
```

El nombre exacto dependerá del framework elegido. En producción debe apuntar al
dominio público o reverse proxy de la API.

## 3. Cliente HTTP mínimo

La integración debe centralizar el comportamiento común: URL base, JSON,
`Authorization`, `X-Request-ID`, errores y respuestas `204`.

Ejemplo portable con `fetch`:

```javascript
const API_BASE_URL = getApiBaseUrlFromEnvironment();

async function apiRequest(path, options = {}) {
  const token = getAccessTokenFromApplicationState();
  const headers = new Headers(options.headers || {});
  headers.set("Accept", "application/json");

  if (options.body !== undefined) {
    headers.set("Content-Type", "application/json");
  }

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 204) {
    return null;
  }

  const payload = await response.json();

  if (!response.ok) {
    throw new ApiError(response.status, payload);
  }

  return payload;
}
```

El código es un contrato conceptual, no un archivo frontend agregado al
repositorio. La implementación final debe adaptar `getApiBaseUrl...`, el estado
de sesión y la clase `ApiError` al stack seleccionado.

## 4. Contrato de autenticación

### Registro

```http
POST /users/register
Content-Type: application/json
```

```json
{
  "username": "mateo",
  "email": "mateo@example.com",
  "password": "una-clave-segura"
}
```

Respuesta `201`:

```json
{
  "id": 1,
  "username": "mateo",
  "email": "mateo@example.com",
  "created_at": "2026-08-25T12:00:00"
}
```

El backend no devuelve `password_hash`.

### Login

```http
POST /users/login
Content-Type: application/json
```

```json
{
  "email": "mateo@example.com",
  "password": "una-clave-segura"
}
```

Respuesta `200`:

```json
{
  "access_token": "<jwt>",
  "token_type": "bearer"
}
```

Las requests protegidas deben enviar:

```http
Authorization: Bearer <access_token>
```

`GET /users/me` permite reconstruir el usuario actual a partir del token. No
existe refresh token ni logout server-side todavía; cerrar sesión consiste en
eliminar el token del estado del cliente. Para reducir exposición ante XSS, la
decisión de persistir el token en `localStorage` debe evaluarse explícitamente;
mantenerlo en memoria es más restrictivo, aunque pierde la sesión al recargar.

## 5. Monedas

Las respuestas de monedas tienen un envelope estable:

```json
{
  "success": true,
  "message": "Monedas obtenidas correctamente.",
  "data": [
    {
      "id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "market_cap_rank": 1
    }
  ]
}
```

| Operación | Endpoint | Resultado |
| --- | --- | --- |
| Listar | `GET /coins` | Envelope con lista de monedas |
| Sincronizar top | `POST /coins/sync` | Envelope con lista sincronizada |
| Obtener una | `GET /coins/{coin_id}` | Envelope con una moneda |
| Actualizar una | `POST /coins/{coin_id}` | Envelope con una moneda |

Los envelopes y sus campos están tipados en OpenAPI mediante
`CoinResponseEnvelope` y `CoinListResponseEnvelope`.

## 6. Favoritos

Todas las operaciones de favoritos requieren Bearer y el `user_id` debe
coincidir con el usuario del token.

Agregar:

```http
POST /favorites
Authorization: Bearer <access_token>
Content-Type: application/json
```

```json
{
  "user_id": 1,
  "coin_id": "bitcoin"
}
```

Listar favoritos simples:

```http
GET /favorites?user_id=1
Authorization: Bearer <access_token>
```

```json
{
  "success": true,
  "data": [
    { "user_id": 1, "coin_id": "bitcoin" }
  ]
}
```

Listar favoritos con información de moneda:

```http
GET /favorites/details?user_id=1
Authorization: Bearer <access_token>
```

```json
{
  "success": true,
  "data": [
    {
      "coin_id": "bitcoin",
      "symbol": "btc",
      "name": "Bitcoin",
      "market_cap_rank": 1
    }
  ]
}
```

Eliminar utiliza `DELETE /favorites/{coin_id}?user_id=1` y devuelve `204` sin
body. El cliente no debe intentar parsear JSON en esa respuesta.

## 7. Historial de precios

Consulta paginada:

```http
GET /coins/bitcoin/price-history?limit=20&offset=0&sort_by=recorded_at&sort_order=desc
```

Cada registro tiene esta forma:

```json
{
  "id": 1,
  "coin_id": "bitcoin",
  "price": 65000.25,
  "recorded_at": "2026-08-25T12:00:00"
}
```

Reglas que el cliente debe respetar:

- `limit`: entre `1` y `100`, por defecto `20`;
- `offset`: mayor o igual a `0`;
- `sort_by`: `recorded_at` o `price`;
- `sort_order`: `asc` o `desc`;
- `period` en agregaciones: `hour`, `day` o `week`;
- las fechas deben enviarse como `YYYY-MM-DD`;
- `start_date` no puede ser posterior a `end_date`.

Las rutas de estadísticas, variaciones y agregaciones están descritas en
`/openapi.json` y en [`docs/rutas-api-actuales.md`](rutas-api-actuales.md).

## 8. Errores para la UI

Errores de dominio:

```json
{
  "detail": {
    "code": "invalid_credentials",
    "message": "Email o password incorrectos."
  }
}
```

Errores de validación `422` usan el formato estándar de FastAPI y contienen una
lista en `detail`. La UI debe distinguir:

| Estado | Acción sugerida |
| ---: | --- |
| `401` | Limpiar sesión o pedir login nuevamente |
| `403` | Mostrar falta de permisos |
| `404` | Mostrar recurso inexistente |
| `409` | Mostrar conflicto de negocio |
| `422` | Marcar campos inválidos |
| `429` | Respetar `Retry-After` y reintentar más tarde |
| `502` | Mostrar indisponibilidad de CoinGecko |

El `X-Request-ID` de cada response debe conservarse en errores de soporte para
correlacionarlo con los logs del backend.

## 9. CORS y desarrollo local

El backend permite por defecto estos orígenes de desarrollo:

```text
http://localhost:5173
http://127.0.0.1:5173
```

Si el frontend utiliza otro puerto, origen o framework, hay que agregarlo en
`CORS_ALLOWED_ORIGINS`. En producción debe configurarse el origen exacto; no se
debe usar `*`.

## 10. Gaps conocidos

- El frontend todavía no tiene stack elegido ni código implementado.
- La ruta `POST /coins/{coin_id}/price` fue completada en M92: consulta
  CoinGecko `/simple/price` y persiste la observación actual.
- No hay refresh token.
- No hay contrato de WebSocket ni actualizaciones en tiempo real.
- La paginación devuelve una lista, pero no un total global; el frontend debe
  trabajar con `limit/offset` hasta que se defina un envelope paginado.

## 11. Decisiones pendientes para desbloquear el frontend

- framework y bundler;
- estrategia de almacenamiento del token;
- URL y variables de entorno del cliente;
- librería HTTP, si no se utiliza `fetch`;
- estrategia de estado y cache;
- diseño de navegación y pantallas;
- manejo visual de los códigos de error;
- generación de tipos desde OpenAPI.

## 12. Verificación del backend

El contrato fue comprobado mediante OpenAPI y la suite existente:

```powershell
python -m pytest -q
python -m unittest discover -s app/tests -p "*_test.py"
```

La tipificación de envelopes no cambia los JSON funcionales; agrega esquemas
explícitos para que un cliente pueda generar tipos desde `/openapi.json`.

Resultado actual:

```text
pytest: 164 passed, 1 warning
unittest: 24 tests OK
```

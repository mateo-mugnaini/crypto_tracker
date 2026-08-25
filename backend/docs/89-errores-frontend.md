# Módulo 89 — Errores en frontend

> **Estado:** CONTRATO DE ERRORES DOCUMENTADO; UI PENDIENTE
> **Proyecto:** Crypto Tracker
> **Capa:** Contrato HTTP / Experiencia de error
> **Módulo anterior:** 88 — Auth frontend
> **Siguiente módulo:** 90 — Paginación, filtros y UI

## 1. Objetivo

Definir cómo el cliente frontend debe interpretar errores del backend sin
acoplar la UI a textos frágiles. La regla principal es:

```text
status HTTP → política técnica
detail.code → comportamiento funcional
detail.message → mensaje visible o fallback
X-Request-ID → diagnóstico y soporte
```

El `code` es el identificador estable para la lógica del cliente. El texto
`message` puede cambiar por correcciones de redacción o traducciones.

## 2. Error de dominio conocido

Los errores controlados por la aplicación tienen este formato:

```json
{
  "detail": {
    "code": "favorite_already_exists",
    "message": "La moneda ya está en favoritos."
  }
}
```

El frontend debería normalizarlo a un objeto interno similar a:

```javascript
{
  status: 409,
  code: "favorite_already_exists",
  message: "La moneda ya está en favoritos.",
  requestId: "..."
}
```

Si el backend entrega un payload inesperado, el cliente debe usar un mensaje
genérico y conservar el status y `X-Request-ID` para diagnóstico.

## 3. Tabla de códigos actuales

| Status | `detail.code` | Situación | Acción del cliente |
| ---: | --- | --- | --- |
| `401` | `authentication_required` | Falta Bearer | Mostrar login |
| `401` | `invalid_access_token` | Token inválido, expirado o usuario inexistente | Limpiar sesión y mostrar login |
| `401` | `invalid_credentials` | Login rechazado | Marcar credenciales sin revelar cuál falló |
| `403` | `forbidden` | Ownership o permiso inválido | Mostrar acceso denegado |
| `404` | `user_not_found` | Usuario inexistente | Mostrar recurso no encontrado |
| `404` | `coin_not_found` | Moneda inexistente | Mostrar moneda no encontrada |
| `404` | `favorite_not_found` | Favorito inexistente | Refrescar lista o informar estado actual |
| `409` | `email_already_exists` | Email registrado | Pedir otro email o iniciar login |
| `409` | `favorite_already_exists` | Favorito duplicado | Marcar como ya favorito |
| `429` | `rate_limit_exceeded` | Límite de login superado | Respetar `Retry-After` |
| `502` | `coingecko_unavailable` | CoinGecko no disponible | Mostrar indisponibilidad temporal |

El backend no debe exponer passwords, hashes, secretos o tokens en los mensajes
de error. El frontend tampoco debe mostrarlos en consola en producción.

## 4. Errores de validación `422`

Los errores de validación provienen de FastAPI/Pydantic y tienen otra forma:

```json
{
  "detail": [
    {
      "type": "string_too_short",
      "loc": ["body", "password"],
      "msg": "String should have at least 8 characters",
      "input": "abc"
    }
  ]
}
```

La UI debe convertir `loc` en un error de campo:

```text
["body", "password"] → password
["query", "limit"]   → filtros.limit
["path", "coin_id"]  → ruta o selección de moneda
```

Los errores que no pueden asignarse a un campo deben mostrarse como error
general del formulario. Nunca se debe asumir que `detail` siempre es un objeto.

## 5. Normalizador conceptual

```javascript
async function parseApiError(response) {
  const requestId = response.headers.get("X-Request-ID");
  let payload = null;

  try {
    payload = await response.json();
  } catch {
    // Respuesta vacía o no JSON.
  }

  if (Array.isArray(payload?.detail)) {
    return {
      status: response.status,
      code: "validation_error",
      fields: payload.detail,
      message: "Revisa los datos ingresados.",
      requestId,
    };
  }

  if (payload?.detail?.code) {
    return {
      status: response.status,
      code: payload.detail.code,
      message: payload.detail.message,
      requestId,
    };
  }

  return {
    status: response.status,
    code: "unexpected_api_error",
    message: "No se pudo completar la operación.",
    requestId,
  };
}
```

El fragmento define el comportamiento, no un archivo concreto del frontend.

## 6. Política de reintentos

No todas las respuestas fallidas deben reintentarse:

| Situación | Reintento automático |
| --- | --- |
| Error de validación `422` | No |
| Credenciales `401` | No |
| Permiso `403` | No |
| Recurso `404` | No |
| Conflicto `409` | No |
| Rate limit `429` | Sí, después de `Retry-After` |
| CoinGecko `502` | Opcional, limitado y con backoff |
| Timeout o error de red | Opcional, limitado y con backoff |
| `5xx` no documentado | Opcional, limitado y con backoff |

Los `POST` que modifican datos no deben reintentarse ciegamente: una segunda
request podría duplicar una operación si el primer request llegó al servidor
pero la respuesta se perdió. La idempotencia debe definirse antes de agregar
reintentos automáticos para mutaciones.

## 7. Error de red y API caída

Un error de red no tiene status HTTP confiable. El cliente debe diferenciarlo de
un `4xx`:

```text
request no salió o no hubo response
    → network_error

response 422
    → validation_error

response 502
    → coingecko_unavailable
```

La UI puede ofrecer reintentar una operación de lectura, pero debe preservar el
estado del formulario y no borrar la sesión por un simple timeout.

## 8. Respuestas `204`

`DELETE /favorites/{coin_id}` devuelve `204 No Content`. Es una respuesta
exitosa sin JSON:

```javascript
if (response.status === 204) {
  return null;
}
```

Intentar ejecutar `response.json()` siempre produciría un error falso del lado
frontend.

## 9. Request ID y soporte

El backend agrega `X-Request-ID` a cada response. El cliente debe:

1. conservarlo en el error normalizado;
2. mostrarlo solo cuando sea útil para soporte;
3. enviarlo en reportes técnicos;
4. no usarlo como token de autenticación.

El request ID permite relacionar la interacción frontend con los logs JSON del
backend sin registrar datos sensibles.

## 10. Checklist de UI

- [x] Error de dominio documentado por código.
- [x] Validación `422` diferenciada de errores de negocio.
- [x] `401`, `403`, `404`, `409`, `429` y `502` tienen política definida.
- [x] `Retry-After` documentado.
- [x] Error de red separado de error HTTP.
- [x] Respuesta `204` documentada.
- [x] `X-Request-ID` reservado para diagnóstico.
- [ ] Implementar normalizador en el frontend real.
- [ ] Diseñar mensajes y traducciones de la UI.
- [ ] Agregar tests del cliente cuando exista el stack frontend.

## 11. Verificación del backend

Los contratos existentes de autenticación, seguridad, status HTTP y endpoints
continúan cubiertos por la suite:

```powershell
python -m pytest -q
python -m unittest discover -s app/tests -p "*_test.py"
```

La implementación del normalizador queda intencionalmente pendiente hasta que
`frontend/` tenga tecnología y estructura reales.

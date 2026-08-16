# Módulo 65 — Tokens y JWT

## Objetivo

Emitir un access token JWT después de un login correcto, sin proteger endpoints todavía.

## Implementación

- Se añadió `PyJWT`.
- `TokenService` firma JWT HS256 con `sub` (ID de usuario), `iat` y `exp`.
- Secret, algoritmo y expiración viven en `.env` mediante `JWT_SECRET_KEY`, `JWT_ALGORITHM` y `JWT_ACCESS_TOKEN_MINUTES`.
- `POST /users/login` ahora devuelve `{ "access_token": "...", "token_type": "bearer" }`.
- Se actualizó `docs/rutas-api-actuales.md`.

El token identifica al usuario, pero no se valida en endpoints aún. Eso pertenece a M66.

## Tests ejecutados

```powershell
python -m pytest app/tests/unit/test_token_service.py app/tests/api/test_api_endpoints.py
```

Resultado: 11 tests aprobados.

## Siguiente módulo

M66 — Usuario actual y dependencias de autenticación.

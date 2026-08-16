# Módulo 64 — Login y verificación de credenciales

## Objetivo

Implementar login sin tokens: validar email y password contra el hash almacenado y devolver datos públicos del usuario.

## Flujo

```text
POST /users/login
  → UserLoginRequest
  → UserController.login
  → UserService.authenticate
  → UserRepository.find_by_email
  → PasswordHasher.verify
  → UserResponse o HTTP 401
```

## Implementación

- `UserLoginRequest` recibe email y password; normaliza el email.
- `UserRepository.find_by_email()` consulta con parámetro SQL.
- `UserService.authenticate()` busca el usuario y verifica `password_hash`.
- `InvalidCredentialsException` representa tanto email inexistente como password incorrecto.
- `POST /users/login` devuelve `UserResponse`, sin hash, o `401` con código `invalid_credentials`.

Usar el mismo mensaje para ambos fallos evita revelar qué emails están registrados.

## Rutas

Se actualizó `docs/rutas-api-actuales.md` con `POST /users/login`.

## Tests ejecutados

```powershell
python -m pytest app/tests/unit/test_user_service.py app/tests/api/test_api_endpoints.py
python -m pytest
```

- Tests específicos: 16 aprobados.
- Suite Pytest: 123 aprobados.

## Estado final

El backend autentica credenciales, pero todavía no emite tokens ni protege endpoints. M65 añadirá JWT.

## Siguiente módulo

Módulo 65 — Tokens y JWT.

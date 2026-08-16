# Módulo 66 — Usuario actual y dependencias de autenticación

## Objetivo

Extraer el usuario actual desde un JWT Bearer y reutilizar esa lógica mediante `Depends`.

## Flujo

```text
Authorization: Bearer <token>
  → get_current_user
  → TokenService.decode_access_token
  → UserRepository.find_by_id
  → usuario actual o HTTP 401
```

## Implementación

- `TokenService.decode_access_token()` valida firma, algoritmo y expiración.
- `get_current_user` usa `HTTPBearer`, extrae `sub`, busca el usuario y devuelve 401 para token ausente, inválido, expirado o de usuario inexistente.
- `GET /users/me` devuelve `UserResponse` sin `password_hash`.
- Se actualizó el inventario vivo de rutas.

## Tests

```powershell
python -m pytest app/tests/api/test_api_endpoints.py
```

Resultado: 12 tests API aprobados.

## Estado final

La identidad autenticada está disponible como dependencia. M67 la aplicará a recursos privados, especialmente favoritos.

## Siguiente módulo

M67 — Protección de endpoints e integración con favoritos.

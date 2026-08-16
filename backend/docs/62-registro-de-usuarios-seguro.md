# Módulo 62 — Registro de usuarios seguro

## Ajuste de roadmap

El registro necesita persistir `password_hash`; aceptar ese hash desde HTTP expondría un detalle interno. Por dependencia de seguridad se adelantó el hashing mínimo previsto para M63: el registro recibe `password`, lo transforma internamente y nunca devuelve el hash.

## Flujo

```text
POST /users/register
  → UserRegisterRequest
  → UserController
  → UserService.register_user
  → PasswordHasher.scrypt
  → UserRepository
  → UserResponse (sin password_hash)
```

## Implementación

- `UserRegisterRequest`: username, email y password; normaliza email y rechaza campos extra.
- `PasswordHasher`: usa `hashlib.scrypt`, salt aleatorio y `hmac.compare_digest` para futura verificación.
- `UserService.register_user`: hashea antes de crear la entidad y reutiliza la regla de email único.
- `UserController` y `POST /users/register`.
- `UserResponse` expone id, username, email y created_at, nunca `password_hash`.
- Email duplicado devuelve HTTP 409 con `email_already_exists`.

## Archivos creados

- `app/security/password_hasher.py`
- `app/schemas/user.py`
- `app/controllers/user_controller.py`
- `app/tests/unit/test_password_hasher.py`

## Verificación

```powershell
python -m pytest app/tests/unit/test_password_hasher.py app/tests/unit/test_user_service.py app/tests/api/test_api_endpoints.py
python -m pytest
```

- 12 tests específicos aprobados.
- 116 tests Pytest aprobados.

## Siguiente módulo

M63 profundizará el hashing, su política y verificación antes de login.

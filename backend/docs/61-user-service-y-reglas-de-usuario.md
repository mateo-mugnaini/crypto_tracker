# Módulo 61 — User Service y reglas de usuario

## Objetivo

Crear la lógica de negocio inicial de usuarios sin introducir todavía HTTP, passwords planos, hashing, login ni JWT.

## Problema resuelto

`UserRepository` sabe ejecutar SQL, pero no debe decidir si un email puede reutilizarse. Esa regla pertenece a `UserService`:

```text
UserService.create_user(user)
    ↓
UserRepository.exists_by_email(email)
    ↓
EmailAlreadyExistsException o save(user)
```

## Implementación

- Se añadió `EmailAlreadyExistsException`, una excepción de dominio.
- `UserRepository.exists_by_email(email)` consulta con parámetro SQL y devuelve booleano.
- `UserRepository.save(user)` ahora asigna `cursor.lastrowid` al usuario y devuelve la entidad persistida.
- `UserService.create_user(user)` evita guardar un email duplicado.
- `Container` construye `user_service` junto al resto de servicios.

La unicidad aplicada es la de `email`, porque es el constraint documentado de la tabla `users`. No se añadió unicidad de username sin respaldo en el esquema actual.

## Responsabilidades por capa

| Capa | Responsabilidad |
|---|---|
| Model | Representar User con `id`, username, email, password_hash y fecha. |
| Repository | Ejecutar SQL y devolver/guardar datos. |
| Service | Decidir si el email permite crear el usuario. |
| API | Aún no existe para User; llegará en M62. |

## Archivos creados

- `app/services/user_service.py`
- `app/tests/unit/test_user_service.py`

## Archivos modificados

- `app/exceptions/domain_exception.py`
- `app/exceptions/__init__.py`
- `app/repositories/user_repository.py`
- `app/container.py`
- `app/tests/unit/test_user_repository.py`

## Tests y resultados

```powershell
python -m pytest app/tests/unit/test_user_model.py app/tests/unit/test_user_repository.py app/tests/unit/test_user_service.py
python -m pytest
python -m unittest discover -s app/tests -p "*_test.py"
```

- Tests específicos de User: 9 aprobados.
- Suite Pytest: 112 aprobados.
- Suite histórica unittest: 24 aprobados.

## Qué no hacemos todavía

- No recibimos un password desde HTTP.
- No hasheamos passwords: M63.
- No creamos endpoints de registro: M62.
- No hacemos login ni tokens: M64–M67.

## Estado final

La creación de usuarios ya tiene una regla de negocio explícita y testeada. El siguiente módulo expondrá el registro mediante contrato HTTP, antes de introducir el mecanismo seguro de hashing.

## Siguiente módulo

Módulo 62 — Registro de usuarios.

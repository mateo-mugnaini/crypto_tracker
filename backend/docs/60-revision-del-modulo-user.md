# Módulo 60 — Revisión del módulo User

## Objetivo

Revisar el estado real del dominio `User` antes de construir registro, hashing, login y JWT. El propósito no es adelantar autenticación, sino confirmar qué componentes existen y dejar explícito qué pertenece a los módulos siguientes.

## Estado previo

El proyecto ya contaba con:

- `app/models/user.py`
- `app/repositories/user_repository.py`
- tabla `users` documentada con `id`, `username`, `email`, `password_hash` y `created_at`;
- `UserRepository` dentro del `Container`;
- `UserRepository.exists()` usado por `FavoriteService` para proteger la relación de favoritos.

No existían todavía:

- `UserService`;
- `UserController`;
- schemas Pydantic de entrada/salida de usuario;
- endpoints de registro o login;
- hashing de passwords;
- JWT o usuario actual.

Esta separación es correcta: cada una de esas responsabilidades aparece en módulos posteriores.

## El modelo User

`User` representa una entidad interna del dominio, no un contrato HTTP:

| Campo | Tipo | Significado | Restricción actual |
|---|---|---|---|
| `id` | `int | None` | Identificador de MySQL. | `None` antes de persistir. |
| `username` | `str` | Nombre público o de acceso del usuario. | Validación futura en service/schema. |
| `email` | `str` | Dirección de correo del usuario. | Unicidad en SQL documentada; formato futuro. |
| `password_hash` | `str` | Password transformado para almacenamiento. | Nunca es un password plano. El algoritmo llega en M63. |
| `created_at` | `datetime` | Momento de creación. | Debe corresponder a una fecha válida. |

Se añadieron type hints al constructor. No añaden validación en runtime, pero hacen explícito el contrato para lectores, IDEs y herramientas estáticas.

## Relación con Favorite

`Favorite` contiene `user_id`, no un objeto `User` completo. La relación se persiste en MySQL mediante una clave foránea desde `favorites.user_id` hacia `users.id`.

El flujo existente es:

```text
FavoriteService
    ↓
UserRepository.exists(user_id)
    ↓
UserNotFoundException si no existe
```

Así se evita crear favoritos huérfanos sin acoplar `FavoriteService` a la tabla SQL.

## UserRepository actual

Responsabilidades disponibles:

- `save(user)`: inserta username, email, password_hash y fecha con parámetros SQL.
- `find_all()`: devuelve filas de usuarios.
- `find_by_id(user_id)`: devuelve una fila o `None`.
- `exists(user_id)`: devuelve un booleano para reglas de negocio.

El repository devuelve filas/diccionarios en lecturas, igual que otros repositories existentes. La transformación de esas filas a contratos de usuario se decidirá cuando aparezcan `UserService` y schemas HTTP.

## Lo que no modificamos

- No añadimos un endpoint de usuarios: corresponde a M62.
- No aceptamos ni almacenamos passwords planos: el hashing corresponde a M63.
- No añadimos login ni credenciales: corresponde a M64.
- No añadimos JWT ni `Depends` de usuario actual: corresponde a M65–M67.
- No alteramos constraints de la base normal ni escribimos usuarios reales.

## Tests creados

- `app/tests/unit/test_user_model.py`
- `app/tests/unit/test_user_repository.py`

Los tests del modelo comprueban una entidad nueva sin ID y su representación de texto. Los tests del repository usan `patch` sobre `get_connection`, por lo que validan SQL parametrizado, retornos y cierre de recursos sin depender de MySQL.

## Ejecución y resultados

```powershell
python -m pytest app/tests/unit/test_user_model.py app/tests/unit/test_user_repository.py
python -m pytest
python -m unittest discover -s app/tests -p "*_test.py"
```

Resultados ejecutados:

- Tests de M60: 6 aprobados.
- Suite completa Pytest: 109 aprobados.
- Suite histórica `unittest`: 24 aprobados.

Se mantiene una advertencia externa de deprecación entre Starlette `TestClient` y `httpx`; no afectó los resultados.

## Estado final

El dominio User tiene una entidad con contrato tipado, persistencia básica revisada y pruebas que documentan su comportamiento actual. La siguiente etapa crea la lógica de negocio de usuarios, sin incluir aún HTTP ni hashing.

## Siguiente módulo

Módulo 61 — User Service y reglas de usuario.

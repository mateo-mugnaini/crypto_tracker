# Módulo 52 — Excepciones propias y handlers globales

## Objetivo

Reemplazar errores comunicados mediante tuplas o mensajes interpretados por texto por excepciones con significado propio. La API las convierte de forma centralizada en respuestas HTTP consistentes.

## Conceptos aprendidos

- Una excepción de dominio expresa una regla del negocio incumplida, por ejemplo, que un usuario, moneda o favorito no existe.
- `raise` detiene el flujo normal y permite que una capa superior trate el problema apropiadamente.
- El service no conoce HTTP, FastAPI, códigos de estado ni `HTTPException`.
- Un exception handler de FastAPI transforma una excepción conocida en una respuesta HTTP.
- Los errores de una dependencia externa son una familia distinta de los errores de dominio.

## Arquitectura y flujo

```text
Route / FastAPI
    ↓
Controller
    ↓
Service ── raise UserNotFoundException
    ↓
FastAPI global exception handler
    ↓
HTTP 404 + respuesta JSON consistente
```

Los controllers dejan que las excepciones conocidas se propaguen: no deben convertirlas en diccionarios de error. FastAPI es la capa que conoce HTTP y realiza la traducción.

## Cambios aplicados

### Jerarquía de excepciones

Se añadió una jerarquía común:

```text
Exception
└── AppException
    ├── DomainException
    │   ├── UserNotFoundException
    │   ├── CoinNotFoundException
    │   ├── FavoriteAlreadyExistsException
    │   └── FavoriteNotFoundException
    └── ExternalServiceException
        └── CoinGeckoException
```

`ApiException` se conserva como compatibilidad con el material existente, pero la familia que representa un fallo externo es `ExternalServiceException`.

### FavoriteService

`add_favorite`, `remove_favorite`, `get_favorites` y `get_favorites_with_coin_data` ahora lanzan excepciones de dominio cuando corresponde. Los casos correctos conservan sus retornos anteriores.

Esto elimina la necesidad de inferir la causa a partir de textos como `"El usuario no existe."`.

### CoinController

El controller ya no captura `CoinGeckoException` para devolver un diccionario de error. Deja propagar la excepción hasta el handler global. También comunica la ausencia de una moneda local con `CoinNotFoundException`.

### Handlers globales

`app/api/app.py` incluye handlers para:

| Excepción | HTTP | Código estable |
|---|---:|---|
| `UserNotFoundException` | 404 | `user_not_found` |
| `CoinNotFoundException` | 404 | `coin_not_found` |
| `FavoriteNotFoundException` | 404 | `favorite_not_found` |
| `FavoriteAlreadyExistsException` | 409 | `favorite_already_exists` |
| `CoinGeckoException` | 502 | `coingecko_unavailable` |

El contrato para esos errores es:

```json
{
  "detail": {
    "code": "favorite_already_exists",
    "message": "La moneda ya está en favoritos."
  }
}
```

Los endpoints de favoritos documentan este contrato con `ErrorResponse` en OpenAPI.

## Archivos creados

- `app/schemas/error.py`
- `app/tests/domain_exception_test.py`

## Archivos modificados

- `app/exceptions/api_exception.py`
- `app/exceptions/domain_exception.py`
- `app/exceptions/__init__.py`
- `app/services/favorite_service.py`
- `app/controllers/coin_controller.py`
- `app/api/app.py`
- `app/schemas/__init__.py`
- `app/tests/http_status_codes_test.py`

## Tests

Se crearon tests para verificar la jerarquía de excepciones, las excepciones lanzadas por `FavoriteService` y las respuestas HTTP 404, 409 y 502 a través de `TestClient`.

Ejecución realizada:

```powershell
python -m unittest app.tests.domain_exception_test app.tests.http_status_codes_test app.tests.service_test
```

Resultado: los tests que no requieren FastAPI se ejecutaron correctamente, pero la ejecución completa quedó bloqueada porque el intérprete activo no tiene instalado `fastapi` (`ModuleNotFoundError`). No se marca como aprobada la prueba de handlers hasta ejecutar el comando dentro del entorno virtual con las dependencias instaladas.

## Cómo verificar

Desde `backend`, activar el entorno virtual del proyecto e instalar dependencias si hiciera falta:

```powershell
python -m pip install -r requirements.txt
python -m unittest app.tests.domain_exception_test app.tests.http_status_codes_test app.tests.service_test
python -m unittest discover -s app/tests -p "*_test.py"
uvicorn app.api.app:app --reload
```

En Swagger (`/docs`), probar:

- `POST /favorites` con un usuario inexistente: HTTP 404.
- `POST /favorites` con un favorito repetido: HTTP 409.
- `DELETE /favorites/{coin_id}` con un favorito ausente: HTTP 404.

## Decisiones técnicas

No se usa `HTTPException` dentro de `FavoriteService`. Hacerlo acoplaría la lógica de negocio a FastAPI y dificultaría reutilizar el service desde un script, un worker o una CLI. Los handlers globales evitan repetir `try/except` en cada endpoint.

## Estado final

La API tiene una base consistente para comunicar errores de dominio y de CoinGecko sin que los services dependan de HTTP.

## Siguiente módulo

Módulo 53 — `Depends`, inyección de dependencias y ciclo de vida en FastAPI.

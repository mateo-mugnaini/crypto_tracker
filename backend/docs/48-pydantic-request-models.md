# Módulo 48 - Pydantic Request Models

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Fase**: FastAPI profesional
> **Fecha**: 2026-08-10

---

## 1. Objetivo

Introducir modelos Pydantic para representar y validar el body de una petición HTTP.

Se aplica el concepto al endpoint:

```http
POST /favorites
```

Body esperado:

```json
{
  "user_id": 1,
  "coin_id": "bitcoin"
}
```

---

## 2. Problema anterior

Antes del módulo, la ruta recibía valores directamente como parámetros de la función:

```python
def add_favorite(user_id: int, coin_id: str):
```

Esto hacía que FastAPI tratara los valores como parámetros de query y no como un contrato explícito de entrada.

Ahora la ruta recibe un objeto validado:

```python
def add_favorite(request: FavoriteCreateRequest = Body(...)):
```

---

## 3. Conceptos aprendidos

- `BaseModel`.
- `Field`.
- Request body.
- Tipos declarados.
- Validación automática.
- Campos obligatorios.
- Constraints básicos.
- `ConfigDict`.
- Separación entre schema HTTP y modelo interno.
- Documentación automática de OpenAPI.

No se introdujeron todavía Response Models. Ese contenido corresponde al M49.

---

## 4. Modelos: Request Model vs modelo interno

### Request Model

```python
class FavoriteCreateRequest(BaseModel):
    user_id: int
    coin_id: str
```

Representa exclusivamente el JSON recibido desde HTTP.

### Modelo interno

```python
class Favorite:

    def __init__(self, user_id, coin_id):
        self.user_id = user_id
        self.coin_id = coin_id
```

Representa la entidad interna utilizada por la aplicación.

El Request Model no reemplaza al modelo de dominio:

```text
JSON HTTP
   ↓
FavoriteCreateRequest
   ↓ transformación
Favorite
   ↓
Controller / Service
```

Esta separación permite que el contrato HTTP evolucione sin obligar a modificar directamente la entidad interna.

---

## 5. Implementación del Request Model

Archivo:

```text
app/schemas/favorite.py
```

```python
from pydantic import BaseModel, ConfigDict, Field


class FavoriteCreateRequest(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    user_id: int = Field(
        gt=0,
        description="Identificador positivo del usuario",
    )
    coin_id: str = Field(
        min_length=1,
        description="Identificador de CoinGecko de la moneda",
    )
```

### `BaseModel`

Pydantic utiliza `BaseModel` para describir la estructura esperada y validar los datos.

### `Field`

`Field` permite añadir restricciones y documentación:

- `gt=0`: el usuario debe tener un identificador positivo.
- `min_length=1`: `coin_id` no puede estar vacío.

### `str_strip_whitespace`

Elimina espacios externos de los strings:

```text
" bitcoin " → "bitcoin"
```

---

## 6. Integración con FastAPI

```python
from fastapi import Body
from app.models.favorite import Favorite
from app.schemas.favorite import FavoriteCreateRequest


@app.post("/favorites")
def add_favorite(
    request: FavoriteCreateRequest = Body(...),
):
    favorite = Favorite(request.user_id, request.coin_id)

    return container.favorite_controller.add_favorite(favorite)
```

La ruta solamente realiza dos tareas HTTP:

1. Recibir el Request Model validado.
2. Transformarlo al modelo interno.

La lógica de usuario existente, moneda existente y duplicados continúa en `FavoriteService`.

---

## 7. Flujo completo

```text
Cliente HTTP
    ↓ JSON
FastAPI
    ↓ validación Pydantic
FavoriteCreateRequest
    ↓ transformación
Favorite
    ↓
FavoriteController
    ↓
FavoriteService
    ↓
Repositories
```

---

## 8. Validaciones automáticas

### Body válido

```json
{
  "user_id": 1,
  "coin_id": "bitcoin"
}
```

### Campo obligatorio ausente

```json
{
  "coin_id": "bitcoin"
}
```

FastAPI responde con `422 Unprocessable Entity`.

### Usuario inválido

```json
{
  "user_id": 0,
  "coin_id": "bitcoin"
}
```

El Request Model rechaza el valor antes de entrar al Controller.

### Coin ID vacío

```json
{
  "user_id": 1,
  "coin_id": ""
}
```

También se rechaza antes de ejecutar lógica de negocio.

---

## 9. Archivos modificados y creados

- `[MODIFY]` `app/api/app.py`: `POST /favorites` ahora recibe body.
- `[NEW]` `app/schemas/__init__.py`.
- `[NEW]` `app/schemas/favorite.py`.
- `[NEW]` `app/tests/favorite_request_model_test.py`.
- `[NEW]` `backend/docs/48-pydantic-request-models.md`.

No se modificaron `Favorite`, `FavoriteService` ni `FavoriteController` porque no necesitaban conocer el contrato HTTP.

---

## 10. Tests

Se verificó:

- body válido;
- eliminación de espacios externos;
- usuario no positivo;
- `coin_id` vacío;
- campos obligatorios;
- importación correcta del schema;
- generación del `requestBody` en OpenAPI.

Comandos ejecutados desde `backend/`:

```powershell
.venv\Scripts\python.exe -m app.tests.favorite_request_model_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
.venv\Scripts\python.exe -m compileall -q app
```

Resultado verificado:

```text
Favorite Request Model tests: PASSED
Suite global: 10 tests OK
compileall: OK
```

El archivo del Request Model se ejecutó directamente como test manual estructurado. Todavía no se utilizó `TestClient`, porque los API Tests corresponden al M57.

---

## 11. Prueba mediante Swagger

Iniciar:

```powershell
cd backend
.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
```

Abrir:

```text
http://127.0.0.1:8000/docs
```

Usar:

```http
POST /favorites
```

Body válido:

```json
{
  "user_id": 1,
  "coin_id": "bitcoin"
}
```

Casos inválidos:

```json
{}
```

```json
{
  "user_id": 0,
  "coin_id": "bitcoin"
}
```

```json
{
  "user_id": 1,
  "coin_id": ""
}
```

Los casos inválidos deben rechazarse con `422` antes de llegar al Service.

---

## 12. Decisiones técnicas

- Se eligió `POST /favorites` porque naturalmente recibe un body.
- Se creó un schema específico de entrada.
- El modelo interno `Favorite` se mantiene separado.
- Se aplicaron restricciones básicas, no validaciones cruzadas avanzadas.
- La validación de existencia de usuario y moneda continúa en el Service.
- No se introdujeron Response Models del M49.

---

## 13. Estado final

- [x] `BaseModel` introducido.
- [x] Request body implementado.
- [x] `Field` utilizado.
- [x] Tipos definidos.
- [x] Validación automática.
- [x] Separación schema/modelo interno.
- [x] Integración con FastAPI.
- [x] OpenAPI actualizado.
- [x] Tests creados y ejecutados.
- [x] Documentación creada.

---

## 14. Próximo módulo

**Módulo 49 - Response Models**

Se trabajarán modelos de salida, serialización, contratos HTTP, ocultamiento de campos internos y `response_model`.

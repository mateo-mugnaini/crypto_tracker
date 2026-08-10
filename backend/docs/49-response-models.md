# Módulo 49 - Response Models

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Fase**: FastAPI profesional
> **Fecha**: 2026-08-10

---

## 1. Objetivo

Definir contratos explícitos para las respuestas HTTP mediante `response_model` de FastAPI y modelos Pydantic.

Se aplicaron Response Models a:

- creación de favoritos;
- listado de Price History;
- estadísticas;
- variaciones;
- agregaciones temporales.

---

## 2. Problema que resolvemos

Antes, los endpoints devolvían directamente diccionarios u objetos internos:

```python
return container.price_history_controller.get_price_history(...)
```

Eso dejaba el contrato de salida implícito. Si el modelo interno incorporara un atributo nuevo, podría terminar expuesto accidentalmente.

Ahora la API define explícitamente qué campos devuelve:

```python
@app.get(
    "/coins/{coin_id}/price-history",
    response_model=list[PriceHistoryResponse],
)
```

---

## 3. Modelos internos vs Response Models

### Modelo interno

```python
PriceHistory(
    id,
    coin_id,
    price,
    recorded_at,
)
```

Pertenece al dominio y es utilizado por Services y Repositories.

### Response Model

```python
class PriceHistoryResponse(BaseModel):
    id: int | None
    coin_id: str
    price: float
    recorded_at: datetime
```

Pertenece al contrato HTTP y controla la serialización pública.

Flujo:

```text
PriceHistory interno
        ↓
Pydantic Response Model
        ↓
JSON HTTP
```

---

## 4. Response Models creados

Archivo:

```text
app/schemas/price_history.py
```

### PriceHistoryResponse

Representa un registro de historial:

```python
class PriceHistoryResponse(BaseModel):
    model_config = ConfigDict(
        from_attributes=True,
        extra="ignore",
    )

    id: int | None
    coin_id: str
    price: float
    recorded_at: datetime
```

`from_attributes=True` permite construirlo desde un objeto interno que posee atributos.

`extra="ignore"` evita incluir campos adicionales que no formen parte del contrato.

### PriceHistoryStatisticsResponse

```python
class PriceHistoryStatisticsResponse(BaseModel):
    coin_id: str
    count: int
    min_price: float | None
    max_price: float | None
    average_price: float | None
```

### PriceHistoryVariationResponse

```python
class PriceHistoryVariationResponse(BaseModel):
    coin_id: str
    initial_price: float | None
    final_price: float | None
    absolute_change: float | None
    percentage_change: float | None
    trend: Literal["up", "down", "unchanged"] | None
```

### PriceHistoryAggregationResponse

```python
class PriceHistoryAggregationResponse(BaseModel):
    period: str
    average_price: float | None
    min_price: float | None
    max_price: float | None
    count: int
```

### FavoriteActionResponse

```python
class FavoriteActionResponse(BaseModel):
    success: bool
    message: str
```

---

## 5. Endpoints integrados

```python
@app.post(
    "/favorites",
    response_model=FavoriteActionResponse,
)
```

```python
@app.get(
    "/coins/{coin_id}/price-history",
    response_model=list[PriceHistoryResponse],
)
```

```python
@app.get(
    "/coins/{coin_id}/price-history/statistics",
    response_model=PriceHistoryStatisticsResponse,
)
```

```python
@app.get(
    "/coins/{coin_id}/price-history/variation",
    response_model=PriceHistoryVariationResponse,
)
```

```python
@app.get(
    "/coins/{coin_id}/price-history/aggregations",
    response_model=list[PriceHistoryAggregationResponse],
)
```

---

## 6. Serialización y campos internos

Un objeto interno puede tener atributos que no deben ser públicos:

```python
{
    "id": 1,
    "coin_id": "bitcoin",
    "price": 65000,
    "recorded_at": "2026-08-10T12:00:00",
    "internal_database_connection": "hidden",
}
```

`PriceHistoryResponse` solo expone los campos declarados en el modelo.

Esto evita acoplar accidentalmente la API a detalles internos de persistencia.

---

## 7. OpenAPI

FastAPI genera automáticamente schemas para:

```text
FavoriteActionResponse
PriceHistoryResponse
PriceHistoryStatisticsResponse
PriceHistoryVariationResponse
PriceHistoryAggregationResponse
```

También documenta si una respuesta es un objeto o una lista:

```json
{
  "type": "array",
  "items": {
    "$ref": "#/components/schemas/PriceHistoryResponse"
  }
}
```

---

## 8. Archivos modificados y creados

- `[MODIFY]` `app/api/app.py`: integración de `response_model`.
- `[MODIFY]` `app/schemas/favorite.py`: `FavoriteActionResponse`.
- `[NEW]` `app/schemas/price_history.py`.
- `[NEW]` `app/tests/response_models_test.py`.
- `[NEW]` `backend/docs/49-response-models.md`.

No se modificaron Services ni Repositories porque los Response Models pertenecen a la frontera HTTP.

---

## 9. Tests

Se verificó:

- respuesta de favoritos;
- conversión desde un modelo interno `PriceHistory`;
- ignorado de campos internos adicionales;
- estadísticas sin datos;
- tendencias válidas;
- agregaciones por período;
- generación de schemas OpenAPI.

Comandos ejecutados desde `backend/`:

```powershell
.venv\Scripts\python.exe -m app.tests.response_models_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
.venv\Scripts\python.exe -m compileall -q app
```

Resultado verificado:

```text
Response Model tests: PASSED
Suite global: 10 tests OK
compileall: OK
```

Todavía no se utilizó `TestClient`, porque API Testing corresponde al M57.

---

## 10. Prueba mediante Swagger

Iniciar:

```powershell
cd backend
.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
```

Abrir:

```text
http://127.0.0.1:8000/docs
```

Comprobar que los endpoints muestran sus modelos de respuesta:

```http
GET /coins/{coin_id}/price-history
GET /coins/{coin_id}/price-history/statistics
GET /coins/{coin_id}/price-history/variation
GET /coins/{coin_id}/price-history/aggregations
POST /favorites
```

---

## 11. Decisiones técnicas

- Los modelos HTTP se colocan en `app/schemas`.
- Las entidades internas permanecen en `app/models`.
- `from_attributes=True` permite serializar objetos internos.
- `extra="ignore"` evita exponer atributos no declarados.
- Los Response Models no contienen lógica de negocio.
- No se creó un schema genérico artificial porque las respuestas tienen contratos diferentes.

---

## 12. Estado final

- [x] Response Model de favoritos.
- [x] Response Model de Price History.
- [x] Response Model de estadísticas.
- [x] Response Model de variaciones.
- [x] Response Model de agregaciones.
- [x] `response_model` integrado.
- [x] Serialización desde modelos internos.
- [x] Ocultamiento de campos extra.
- [x] OpenAPI actualizado.
- [x] Tests creados y ejecutados.
- [x] Documentación creada.

---

## 13. Próximo módulo

**Módulo 50 - HTTP Status Codes**

Se trabajarán `200`, `201`, `204`, `400`, `401`, `403`, `404`, `409` y `422`.

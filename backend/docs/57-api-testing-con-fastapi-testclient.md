# Módulo 57 — API Testing con FastAPI `TestClient`

## Objetivo

Probar endpoints FastAPI como un cliente HTTP, sin levantar Uvicorn ni depender de MySQL o CoinGecko reales. Validamos request, status code, body, serialización, errores de validación y entrega de dependencias.

## Qué es `TestClient`

`TestClient` ejecuta la aplicación ASGI de FastAPI dentro del proceso de test. El código se parece a una petición HTTP real:

```python
response = client.post("/favorites", json={"user_id": 1, "coin_id": "bitcoin"})

assert response.status_code == 201
assert response.json()["success"] is True
```

No abre un puerto y no necesita un servidor Uvicorn. Sí ejecuta routes, validación Pydantic, dependencies, exception handlers y response models. Por eso es una prueba de API, no un unit test puro.

## Aislamiento con `dependency_overrides`

Los endpoints obtienen controllers mediante `Depends`. En los tests sustituimos el proveedor por un mock:

```python
app.dependency_overrides[get_favorite_controller] = lambda: controller
```

Así el flujo HTTP es real, pero no se ejecutan services, repositories, MySQL ni CoinGecko. Al terminar cada test, la fixture limpia los overrides para evitar contaminación entre pruebas.

## Casos cubiertos

| Endpoint / escenario | Verificación |
|---|---|
| `POST /favorites` válido | 201, body de éxito y normalización de `coin_id`. |
| `POST /favorites` inválido | 422 y controller sin llamadas. |
| `DELETE /favorites/{coin_id}` válido | 204 y body vacío. |
| `GET /coins` | 200 y contrato entregado por el controller. |
| `GET /coins/{id}/price-history` válido | 200, serialización datetime y filtros normalizados. |
| Price History con `limit=0` | 422 y controller sin llamadas. |

## Hallazgo y corrección

La primera prueba HTTP de Price History encontró una discrepancia con M51:

```text
Schema instanciado directamente: "PRICE" → "price"
Request HTTP: "PRICE" → 422
```

FastAPI validaba los `Literal` de las query params antes de ejecutar los `field_validator` del modelo cuando se usaba `Depends()` directamente sobre el schema.

Se creó en `app/api/dependencies.py` una familia de proveedores de query params:

- `get_price_history_query_params`
- `get_price_history_date_range_query_params`
- `get_price_history_aggregation_query_params`

Estos proveedores reciben las query params HTTP como tipos básicos, construyen el schema Pydantic correspondiente y convierten cualquier `ValidationError` en `RequestValidationError`. El resultado es:

- Las normalizaciones como `PRICE` → `price` y `DESC` → `desc` vuelven a funcionar por HTTP.
- Las reglas cruzadas de los schemas siguen siendo la fuente de verdad.
- Los errores se devuelven como HTTP 422 con ubicación `query`.

Esto es una corrección de regresión justificada: alinea el comportamiento HTTP real con el contrato de validación ya documentado en M51.

## Archivos creados

- `app/tests/test_api_endpoints.py`

## Archivos modificados

- `app/api/dependencies.py`
- `app/api/app.py`

## Comandos de verificación

Desde `backend`, con `.venv` activo:

```powershell
python -m pytest app/tests/test_api_endpoints.py
python -m pytest
python -m unittest discover -s app/tests -p "*_test.py"
```

## Tests ejecutados y resultados

- API tests nuevos: 6 aprobados.
- Suite completa Pytest: 101 aprobados.
- Suite histórica `unittest`: 24 aprobados.

Se mantiene una advertencia externa de deprecación entre Starlette `TestClient` y `httpx`; no afectó los resultados.

## Qué prueba cada nivel

- Unit test: `FavoriteService` con repositories mockeados; prueba reglas de negocio aisladas.
- API test: `TestClient` contra FastAPI con controllers mockeados; prueba HTTP, validación y contratos.
- Integration test: service + repository + MySQL real; se introduce en el siguiente módulo.

## Estado final

La API tiene pruebas automatizadas de sus contratos HTTP principales y sus validaciones de query params se comportan igual en tests de schema y en requests reales.

## Siguiente módulo

Módulo 58 — Integration Testing con Service, Repository y base de datos.

# Módulo 56 — Mocking con `Mock`, `MagicMock` y `patch`

## Objetivo

Aprender a aislar dependencias externas al probar código Python. Aplicamos `Mock`, `MagicMock` y `patch` sobre CoinGecko y MySQL sin realizar llamadas reales de red ni abrir conexiones a la base de datos.

## Problema que resolvemos

Un unit test debe ser rápido, determinista y aislado. Si un test de `CoinGeckoClient` hace una petición real, puede fallar por red, límites de la API o cambios externos. Si un test de repository abre MySQL, depende de credenciales, datos y estado de una base.

Los mocks sustituyen esas dependencias en el límite de la unidad que queremos probar.

## `Mock`

`Mock` es un objeto configurable que registra llamadas. Es apropiado para métodos normales:

```python
response = Mock()
response.json.return_value = {"id": "bitcoin"}
```

Después podemos verificar colaboración:

```python
response.json.assert_called_once_with()
```

En M55 ya usamos `Mock` para repositories y API clients de services.

## `MagicMock`

`MagicMock` extiende `Mock` con soporte para métodos especiales de Python, como `__getitem__`, `__iter__` o context managers.

`CoinRepository.exists()` usa esta operación:

```python
count = cursor.fetchone()[0]
```

La expresión `[0]` invoca `__getitem__`. En el test usamos `MagicMock` para representar esa fila indexable:

```python
row = MagicMock()
row.__getitem__.return_value = 1
```

No se debe usar `MagicMock` por costumbre. Si solo necesitamos métodos normales, `Mock` comunica una intención más clara.

## `patch`

`patch` reemplaza temporalmente un nombre durante el alcance del test. La regla esencial es:

> Se parchea donde el código bajo prueba busca el nombre, no necesariamente donde se definió originalmente.

`CoinGeckoClient` importa `requests` en `app.api.coingecko_client`, por eso el punto correcto es:

```python
@patch("app.api.coingecko_client.requests.get")
```

`CoinRepository` importó `get_connection` dentro de su propio módulo, por eso se usa:

```python
@patch("app.repositories.coin_repository.get_connection")
```

Parchear `requests.get` o `app.database.connection.get_connection` en otro sitio no reemplazaría necesariamente la referencia que ya usa el módulo bajo prueba.

## `return_value` y `side_effect`

- `return_value` define el resultado normal de una llamada simulada.
- `side_effect` define un efecto alternativo, por ejemplo lanzar una excepción.

```python
mock_get.side_effect = requests.exceptions.Timeout
```

Esto simula un timeout sin tocar la red.

## Implementación del módulo

Se creó `app/tests/test_mocking.py` con tres tests:

| Herramienta | Dependencia aislada | Qué verifica |
|---|---|---|
| `Mock` + `patch` | `requests.get` | Obtención de una moneda y parámetros de la petición. |
| `side_effect` + `patch` | `requests.get` | Timeout simulado; no hay llamada de red. |
| `MagicMock` + `patch` | `get_connection` | Fila indexable de cursor para `CoinRepository.exists`. |

El test de timeout registra el comportamiento actual de `CoinGeckoClient`: captura el timeout, imprime un mensaje y `get_coin()` devuelve `{}`. No cambiamos ese contrato en un módulo de testing; un cambio de política de errores debe tratarse explícitamente en el módulo de excepciones correspondiente.

## Archivo creado

- `app/tests/test_mocking.py`

## Código de producción modificado

Ninguno.

## Ejecución y resultados

Desde `backend` y con `.venv` activo:

```powershell
python -m pytest app/tests/test_mocking.py
python -m pytest
python -m unittest discover -s app/tests -p "*_test.py"
```

Resultados ejecutados:

- Tests de M56: 3 aprobados.
- Suite completa Pytest: 95 aprobados.
- Suite histórica `unittest`: 24 aprobados.

Se mantiene una advertencia externa de deprecación entre Starlette `TestClient` y `httpx`; no afectó los resultados.

## Alternativas y decisiones

- Un fake es una implementación pequeña escrita a mano; es útil si el comportamiento simulado es estable y más claro que configurar mocks.
- `patch` es preferible cuando el código crea o importa directamente una dependencia externa, como `requests.get` o `get_connection`.
- Se usan mocks unitarios aquí; las conexiones reales y SQL deben comprobarse posteriormente mediante integration tests.

## Estado final

El proyecto cuenta con ejemplos verificables de `Mock`, `MagicMock`, `return_value`, `side_effect`, `assert_called_once_with`, `assert_not_called` y `patch` en los límites HTTP y de base de datos.

## Siguiente módulo

Módulo 57 — API Testing con FastAPI `TestClient`.

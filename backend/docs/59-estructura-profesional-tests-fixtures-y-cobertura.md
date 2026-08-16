# Módulo 59 — Estructura profesional: unit, integration, API, fixtures y cobertura

## Objetivo

Organizar las nuevas pruebas por tipo, centralizar fixtures compartidas y medir cobertura sin eliminar ni reescribir masivamente la colección histórica.

## Problema que resolvemos

La carpeta `app/tests` contenía juntos:

- tests unitarios;
- tests de API;
- pruebas de repository con mocks;
- nuevos integration tests con MySQL;
- scripts manuales históricos.

Esta mezcla dificulta ejecutar solo la familia necesaria y no deja claro qué dependencias externas requiere cada prueba.

## Estructura resultante

```text
app/tests/
├── api/
│   └── test_api_endpoints.py
├── integration/
│   └── test_price_history_integration.py
├── unit/
│   ├── test_coin_service.py
│   ├── test_domain_exceptions.py
│   ├── test_favorite_service.py
│   └── test_mocking.py
├── conftest.py
├── ... tests históricos en transición
```

Los scripts y tests históricos permanecen temporalmente en `app/tests/`. Moverlos todos ahora rompería referencias de documentación de módulos anteriores y mezclaría una reorganización masiva con cambios que no son necesarios para la cobertura actual.

La estructura ya define el destino profesional; la migración posterior será gradual, igual que la migración desde `unittest` a Pytest.

## Familias de tests

| Familia | Qué verifica | Dependencias externas |
|---|---|---|
| `unit` | Reglas de services, excepciones y mocks. | Ninguna. |
| `api` | HTTP, Pydantic, response models, handlers y dependencies. | No usa DB ni red: controllers sustituidos. |
| `integration` | Service + Repository + MySQL de testing. | `crypto_tracker_test`. |

## Markers

Se configuraron tres markers en `pytest.ini`:

```ini
markers =
    api: prueba el contrato HTTP mediante FastAPI TestClient.
    integration: requiere una base MySQL de testing configurada.
    unit: prueba aislada sin red, MySQL ni FastAPI real.
```

Permiten ejecutar un subconjunto por intención:

```powershell
python -m pytest -m unit
python -m pytest -m api
python -m pytest -m integration
```

Los tests históricos no marcados continúan ejecutándose en `python -m pytest`, pero no aparecen al filtrar por estas familias hasta que se migren y clasifiquen.

## `conftest.py` y fixtures compartidas

Pytest carga automáticamente `conftest.py` para su carpeta y subcarpetas. Se creó una fixture común `api_client`:

```python
@pytest.fixture
def api_client():
    with TestClient(api_app.app) as test_client:
        yield test_client

    api_app.app.dependency_overrides.clear()
```

La fixture resuelve dos responsabilidades repetidas:

1. Ejecuta el ciclo de vida de FastAPI mediante el context manager de `TestClient`.
2. Limpia `dependency_overrides` después del test, evitando que un mock afecte otro test.

`test_api_endpoints.py` ya consume esta fixture. Los fixtures de MySQL se mantienen dentro de la familia `integration` porque su alcance y cleanup son específicos de esa base.

## Cobertura

Se añadió `pytest-cov` y `.coveragerc`:

```powershell
python -m pytest --cov=app --cov-report=term-missing
```

La configuración mide `app/`, omite los propios tests y habilita branch coverage.

Resultado ejecutado:

```text
Cobertura total: 79.3%
```

La cobertura no es una garantía de calidad. Indica qué líneas y ramas se ejecutaron, pero no detecta por sí sola aserciones débiles ni requisitos faltantes. No se configuró un umbral obligatorio todavía: antes se necesita clasificar y migrar la colección histórica por completo.

Áreas con menor cobertura detectadas: `FavoriteRepository`, `UserRepository`, algunos controllers y el punto de entrada `main.py`. Este reporte sirve como mapa para módulos futuros; no justifica añadir tests artificiales ahora.

## Archivos creados

- `pytest.ini` fue ampliado con markers.
- `.coveragerc`
- `app/tests/conftest.py`
- Directorios `app/tests/unit/`, `app/tests/api/` y `app/tests/integration/`.

## Archivos trasladados

- `test_domain_exceptions.py`, `test_coin_service.py`, `test_favorite_service.py` y `test_mocking.py` → `unit/`.
- `test_api_endpoints.py` → `api/`.
- `test_price_history_integration.py` → `integration/`.

## Dependencias

Se añadió `pytest-cov>=5.0,<8.0` a `requirements.txt` y se instaló en `.venv`.

## Tests ejecutados y resultados

- `python -m pytest -m unit`: 22 aprobados.
- `python -m pytest -m api`: 6 aprobados.
- `python -m pytest -m integration`: 2 aprobados.
- `python -m pytest --cov=app --cov-report=term-missing`: 103 aprobados, cobertura 79.3%.
- `python -m unittest discover -s app/tests -p "*_test.py"`: 24 aprobados.

Se mantiene una advertencia externa de deprecación entre Starlette `TestClient` y `httpx`; no afectó los resultados.

## Estado final

Crypto Tracker cuenta con una estrategia de testing inicial profesional: tipos de tests explícitos, ejecución selectiva, fixtures reutilizables, limpieza de dependencias y una medición de cobertura como referencia.

## Siguiente módulo

Módulo 60 — Revisión del módulo User y preparación para autenticación.

# Módulo 58 — Integration Testing con Service, Repository y MySQL

## Objetivo

Probar una integración real entre `PriceHistoryService`, `PriceHistoryRepository` y MySQL. A diferencia de los unit tests, no se simula el repository: se ejecuta SQL contra una base aislada de testing.

## Diferencia entre unit e integration tests

```text
Unit test
Service → Mock(repository)

Integration test
Service → Repository real → MySQL real de testing
```

Un unit test prueba decisiones de negocio de forma rápida y aislada. Un integration test confirma que el SQL, el mapeo de datos, el driver y la base colaboran correctamente. Ninguno reemplaza al otro.

## Protección de datos

Se creó y configuró una base separada:

```text
MYSQL_DATABASE       → base normal de la aplicación
MYSQL_TEST_DATABASE  → crypto_tracker_test
```

Las pruebas de integración no apuntan a `MYSQL_DATABASE`.

`get_test_connection()` abre conexiones únicamente hacia `MYSQL_TEST_DATABASE`. Si esa variable no existe, lanza un error claro. El archivo `.env` conserva las credenciales localmente y no se documentan ni versionan sus valores.

## Fixture de esquema y limpieza

El archivo `test_price_history_integration.py` usa dos fixtures:

1. `integration_schema` crea, si no existen, las tablas mínimas `coins` y `price_history` dentro de la base de testing.
2. `clean_integration_data` elimina antes y después de cada test solo registros con el ID `integration-bitcoin`.

El orden importa por la clave foránea:

```text
DELETE price_history
    ↓
DELETE coins
```

No se usan `DROP DATABASE`, `TRUNCATE` ni borrados sin `WHERE`. De esta manera el cleanup queda acotado y recuperable mediante la propia recreación de fixtures.

## Integración probada

### Guardar y leer Price History

El test inserta una moneda mediante `CoinRepository`, guarda un precio desde `PriceHistoryService` y consulta el historial a través del mismo service.

Valida:

- MySQL asigna un `id` real (`AUTO_INCREMENT`).
- El repository persiste los valores correctamente.
- El service transforma y recupera el historial esperado.

### Estadísticas sobre filas reales

El segundo test inserta dos precios reales y llama a `PriceHistoryService.get_price_statistics()`.

Valida:

- `COUNT`, `MIN`, `MAX` y `AVG` de MySQL.
- Transformación de valores numéricos al contrato del service.
- Resultado esperado para dos observaciones: mínimo 100, máximo 150 y promedio 125.

## Conexión del repository durante el test

Los repositories importan `get_connection` directamente. El fixture `repositories` sustituye únicamente esa referencia por `get_test_connection` mediante `monkeypatch`:

```python
monkeypatch.setattr(
    "app.repositories.price_history_repository.get_connection",
    get_test_connection,
)
```

El SQL y los repositories son reales; el único cambio es la selección explícita y segura de la base de testing. Cuando termina el test, `monkeypatch` restaura la referencia original.

## Archivos creados

- `app/tests/test_price_history_integration.py`

## Archivos modificados

- `app/config/settings.py`: añade `mysql_test_database`.
- `app/database/connection.py`: añade `get_test_connection()`.
- `pytest.ini`: registra el marker `integration`.
- `.env` local: añade `MYSQL_TEST_DATABASE=crypto_tracker_test`.

## Ejecución

Desde `backend`, con `.venv` activo y `MYSQL_TEST_DATABASE` configurada:

```powershell
python -m pytest -m integration
python -m pytest
python -m unittest discover -s app/tests -p "*_test.py"
```

## Tests ejecutados y resultados

- Integration tests con MySQL real: 2 aprobados.
- Suite completa Pytest: 103 aprobados.
- Suite histórica `unittest`: 24 aprobados.

Se mantiene una advertencia externa de deprecación entre Starlette `TestClient` y `httpx`; no afectó los resultados.

## Trade-offs y decisiones

- Los integration tests son más lentos y requieren MySQL, por eso se marcan con `@pytest.mark.integration` y se pueden ejecutar de forma aislada.
- Las tablas mínimas se crean dentro de la base de testing. Un sistema con migraciones sustituiría este setup por migraciones versionadas; ese mecanismo todavía no forma parte del proyecto.
- El fixture usa datos con prefijo estable y cleanup explícito para evitar contaminación entre tests.

## Estado final

Crypto Tracker cuenta ahora con pruebas unitarias, de API e integración. El siguiente paso organiza esas familias y sus fixtures como una estrategia profesional y mantenible.

## Siguiente módulo

Módulo 59 — Estructura profesional: unit, integration, API, fixtures y cobertura.

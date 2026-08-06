# Crypto Tracker Backend

Estado actual del backend:

- Python 3.13+
- `requests` para consumir CoinGecko
- `mysql-connector-python` para MySQL
- `python-dotenv` para variables de entorno
- `unittest` para pruebas aisladas

La arquitectura activa ya incluye:

- `app/config`
- `app/api`
- `app/database`
- `app/exceptions`
- `app/models`
- `app/repositories`
- `app/services`
- `app/tests`

## Ejecutar la aplicacion

Desde la carpeta `backend`:

```bash
python -m app.main
```

## Ejecutar las pruebas

```bash
python -m unittest discover -s app/tests -p "*_test.py"
```

## Estructura funcional

```text
app/
  api/
  config/
  database/
  exceptions/
  models/
  repositories/
  services/
  tests/
```

## Notas de sincronizacion

- `CoinGeckoClient` es el cliente HTTP actual.
- `CoinService` coordina el flujo de negocio.
- `CoinRepository` encapsula el acceso a MySQL.
- El frontend todavia no forma parte de esta etapa del curso.

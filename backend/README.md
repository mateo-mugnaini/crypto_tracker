# Crypto Tracker — Backend

API REST para consultar y sincronizar criptomonedas, registrar historial de precios, gestionar favoritos y autenticar usuarios. Está construida con FastAPI y persiste la información en MySQL.

## Estado actual

El backend incluye:

- API HTTP con FastAPI, Uvicorn y documentación OpenAPI.
- Sincronización de monedas desde CoinGecko.
- Persistencia de monedas, usuarios, favoritos e historial de precios en MySQL.
- Registro y login de usuarios.
- Contraseñas almacenadas mediante `scrypt` y autenticación con tokens JWT Bearer.
- Consultas de historial con filtros por fecha y precio, paginación y ordenamiento.
- Estadísticas, variaciones y agregaciones horarias, diarias o semanales del historial.
- Pruebas unitarias, de API e integración.

El frontend vive en una carpeta independiente del repositorio (`../frontend`).

## Requisitos

- Python 3.13 o superior.
- MySQL accesible desde el entorno local.
- Una base de datos de aplicación y, opcionalmente, otra para las pruebas de integración.
- Acceso HTTP a CoinGecko para sincronizar monedas.

No hay migraciones ni un archivo SQL de inicialización versionado en este directorio. Antes de arrancar la API deben existir las tablas que utilizan los repositorios: `users`, `coins`, `favorites` y `price_history`.

## Instalación

Desde esta carpeta (`backend`):

```bash
python -m venv .venv
```

Activa el entorno virtual:

```bash
# Windows PowerShell
.venv\Scripts\Activate.ps1

# Linux/macOS
source .venv/bin/activate
```

Instala las dependencias:

```bash
python -m pip install -r requirements.txt
```

## Configuración

Copia la plantilla y completa los valores del entorno:

```bash
copy .env.example .env       # Windows
# cp .env.example .env       # Linux/macOS
```

Variables disponibles:

| Variable | Descripción |
| --- | --- |
| `APP_ENV` | Entorno activo: `development`, `test` o `production`; por defecto, `development`. |
| `COINGECKO_BASE_URL` | URL base de CoinGecko, normalmente `https://api.coingecko.com/api/v3`. |
| `REQUEST_TIMEOUT` | Tiempo máximo de espera de las peticiones HTTP, en segundos. |
| `LOG_LEVEL` | Nivel de logging de la aplicación; por defecto, `INFO`. |
| `MYSQL_HOST` | Host de MySQL. |
| `MYSQL_PORT` | Puerto de MySQL. |
| `MYSQL_USER` | Usuario de MySQL. |
| `MYSQL_PASSWORD` | Contraseña de MySQL. |
| `MYSQL_DATABASE` | Base de datos usada por la aplicación. |
| `MYSQL_TEST_DATABASE` | Base de datos usada por las pruebas de integración. |
| `MYSQL_POOL_SIZE` | Cantidad máxima de conexiones del pool de aplicación; por defecto, 5. |
| `JWT_SECRET_KEY` | Clave secreta para firmar JWT; debe tener al menos 32 caracteres. |
| `JWT_ALGORITHM` | Algoritmo JWT; por defecto, `HS256`. |
| `JWT_ACCESS_TOKEN_MINUTES` | Duración del token de acceso; por defecto, 30 minutos. |
| `CORS_ALLOWED_ORIGINS` | Orígenes frontend separados por comas. |
| `RATE_LIMIT_LOGIN_MAX_REQUESTS` | Intentos de login permitidos por ventana; por defecto, 10. |
| `RATE_LIMIT_LOGIN_WINDOW_SECONDS` | Duración de la ventana de login; por defecto, 60 segundos. |

No subas `.env` al repositorio. La plantilla `.env.example` sí debe mantenerse actualizada.

## Esquema mínimo de MySQL

El código espera, como mínimo, estas columnas y relaciones. Los tipos exactos pueden adaptarse al entorno, respetando las claves y nombres usados por los repositorios:

```sql
CREATE TABLE users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL
);

CREATE TABLE coins (
    id VARCHAR(64) PRIMARY KEY,
    symbol VARCHAR(32) NOT NULL,
    name VARCHAR(255) NOT NULL,
    market_cap_rank INT NULL
);

CREATE TABLE favorites (
    user_id INT NOT NULL,
    coin_id VARCHAR(64) NOT NULL,
    PRIMARY KEY (user_id, coin_id),
    CONSTRAINT fk_favorites_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_favorites_coin FOREIGN KEY (coin_id) REFERENCES coins(id)
);

CREATE TABLE price_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    coin_id VARCHAR(64) NOT NULL,
    price DECIMAL(24, 8) NOT NULL,
    recorded_at DATETIME NOT NULL,
    CONSTRAINT fk_price_history_coin FOREIGN KEY (coin_id) REFERENCES coins(id),
    INDEX idx_price_history_coin_recorded_at (coin_id, recorded_at)
);
```

Para integración, crea una segunda base con la misma estructura y asígnala a `MYSQL_TEST_DATABASE`.

## Ejecución

### Servidor HTTP

El punto de entrada de FastAPI es `app.api.app:app`:

```bash
python -m uvicorn app.api.app:app --reload --host 127.0.0.1 --port 8000
```

La API quedará disponible en <http://127.0.0.1:8000>.

Documentación interactiva:

- Swagger UI: <http://127.0.0.1:8000/docs>
- ReDoc: <http://127.0.0.1:8000/redoc>
- Esquema OpenAPI: <http://127.0.0.1:8000/openapi.json>

### Script de sincronización puntual

```bash
python -m app.main
```

Este comando no levanta el servidor HTTP: crea el contenedor de dependencias y sincroniza la moneda `bitcoin`. Requiere que MySQL, CoinGecko y todas las variables necesarias estén configurados.

## Endpoints

### General y monedas

| Método | Ruta | Descripción | Auth |
| --- | --- | --- | --- |
| `GET` | `/` | Comprueba que la API responde. | No |
| `GET` | `/coins` | Lista las monedas persistidas localmente. | No |
| `POST` | `/coins/sync` | Sincroniza las 10 monedas principales de CoinGecko. | No |
| `GET` | `/coins/{coin_id}` | Obtiene una moneda por su ID de CoinGecko. | No |
| `POST` | `/coins/{coin_id}` | Sincroniza o actualiza una moneda concreta. | No |

### Usuarios

| Método | Ruta | Descripción | Auth |
| --- | --- | --- | --- |
| `POST` | `/users/register` | Registra un usuario y almacena solo el hash de su contraseña. | No |
| `POST` | `/users/login` | Devuelve un `access_token` JWT Bearer. | No |
| `GET` | `/users/me` | Devuelve el perfil del usuario autenticado. | Bearer |

### Favoritos

| Método | Ruta | Descripción | Auth |
| --- | --- | --- | --- |
| `POST` | `/favorites` | Agrega un favorito; el `user_id` debe pertenecer al token. | Bearer |
| `DELETE` | `/favorites/{coin_id}?user_id={user_id}` | Elimina un favorito propio. | Bearer |
| `GET` | `/favorites?user_id={user_id}` | Lista los IDs de monedas favoritas propias. | Bearer |
| `GET` | `/favorites/details?user_id={user_id}` | Lista favoritos incluyendo datos de la moneda. | Bearer |

### Historial de precios

| Método | Ruta | Descripción | Auth |
| --- | --- | --- | --- |
| `POST` | `/coins/{coin_id}/price` | Declara una actualización de precio. | No |
| `GET` | `/coins/{coin_id}/price-history` | Consulta historial con filtros, paginación y ordenamiento. | No |
| `GET` | `/coins/{coin_id}/price-history/statistics` | Devuelve cantidad, mínimo, máximo y promedio. | No |
| `GET` | `/coins/{coin_id}/price-history/variation` | Calcula variación absoluta, porcentual y tendencia. | No |
| `GET` | `/coins/{coin_id}/price-history/aggregations` | Agrupa por `hour`, `day` o `week`. | No |

Parámetros de `/price-history`:

- `start_date`, `end_date`: fechas ISO (`YYYY-MM-DD`).
- `min_price`, `max_price`: rango de precios.
- `limit`: entre 1 y 100; valor por defecto `20`.
- `offset`: valor por defecto `0`.
- `sort_by`: `recorded_at` o `price`.
- `sort_order`: `asc` o `desc`.

Los endpoints de variación y agregaciones aceptan `start_date` y `end_date`. Las agregaciones aceptan además `period=hour|day|week`.

Consulta el inventario ampliado en [`docs/rutas-api-actuales.md`](docs/rutas-api-actuales.md).

## Autenticación

1. Registra un usuario con `POST /users/register`.
2. Inicia sesión con `POST /users/login`.
3. Envía el token recibido en las rutas protegidas:

```http
Authorization: Bearer <access_token>
```

Ejemplo de registro:

```bash
curl -X POST http://127.0.0.1:8000/users/register \
  -H "Content-Type: application/json" \
  -d "{\"username\":\"mateo\",\"email\":\"mateo@example.com\",\"password\":\"una-clave-segura\"}"
```

Las operaciones de favoritos comprueban el ownership: el `user_id` de la URL o del body debe coincidir con el usuario identificado por el token.

## Respuestas y errores

Los errores de dominio usan el formato:

```json
{
  "detail": {
    "code": "favorite_already_exists",
    "message": "El favorito ya existe."
  }
}
```

Estados relevantes:

| Estado | Situación |
| ---: | --- |
| `401` | Token ausente, inválido o expirado. |
| `403` | Intento de operar sobre recursos de otro usuario. |
| `404` | Usuario, moneda o favorito inexistente. |
| `409` | Email duplicado o favorito ya existente. |
| `422` | Body, path o query inválidos. |
| `502` | CoinGecko no está disponible. |

## Arquitectura

```text
app/
├── api/             FastAPI, rutas, dependencias y cliente CoinGecko
├── config/          Lectura de variables de entorno
├── controllers/     Adaptación entre HTTP y casos de uso
├── database/        Conexiones MySQL
├── exceptions/      Excepciones de dominio y de API
├── models/          Entidades del dominio
├── repositories/    Acceso SQL a MySQL
├── schemas/         Validación de requests y responses con Pydantic
├── security/        Hashing de contraseñas y JWT
├── services/        Lógica de negocio
└── tests/           Pruebas unitarias, API e integración
```

El flujo principal es:

```text
HTTP → FastAPI/dependencies → controller → service → repository → MySQL
                                             └→ CoinGecko
```

`app/container.py` construye las dependencias y el ciclo de vida de FastAPI crea un contenedor por aplicación.

## Pruebas

Desde `backend` y con el entorno virtual activo:

```bash
# Toda la suite
pytest -q

# Por categoría
pytest -m unit
pytest -m api
pytest -m integration
```

Las pruebas de integración necesitan `MYSQL_TEST_DATABASE` y una base MySQL con el esquema compatible. La suite actual se ejecuta con 156 pruebas exitosas en el entorno del proyecto; puede aparecer una advertencia de compatibilidad entre Starlette y la versión instalada de `httpx`.

## Documentación del proyecto

- [`docs/rutas-api-actuales.md`](docs/rutas-api-actuales.md): inventario vivo de endpoints.
- [`docs/`](docs/): recorrido didáctico por configuración, arquitectura, persistencia, seguridad, FastAPI y pruebas.
- [`docs/72-cors-rate-limiting-y-abuso-api.md`](docs/72-cors-rate-limiting-y-abuso-api.md): CORS y rate limiting del login.
- [`docs/73-auditoria-general-de-seguridad.md`](docs/73-auditoria-general-de-seguridad.md): auditoría de autenticación, autorización y exposición de seguridad.
- [`docs/74-indices-y-claves.md`](docs/74-indices-y-claves.md): índices y claves para consultas frecuentes.
- [`docs/75-explain-y-planes-sql.md`](docs/75-explain-y-planes-sql.md): verificación de planes SQL con `EXPLAIN`.
- [`docs/76-optimizacion-sql.md`](docs/76-optimizacion-sql.md): optimización localizada de consultas SQL.
- [`docs/77-decision-cache.md`](docs/77-decision-cache.md): evaluación y decisión sobre caching.
- [`docs/78-conexiones-y-pooling.md`](docs/78-conexiones-y-pooling.md): pool lazy de conexiones MySQL.
- [`docs/79-datasets-grandes-y-rendimiento.md`](docs/79-datasets-grandes-y-rendimiento.md): datasets grandes, paginación y rendimiento.
- [`docs/80-logging-estructurado.md`](docs/80-logging-estructurado.md): logging JSON seguro para runtime y requests HTTP.
- [`docs/81-configuracion-por-entornos.md`](docs/81-configuracion-por-entornos.md): entornos y validación segura de producción.
- [`CHANGELOG.md`](CHANGELOG.md): historial de cambios.
- [`relevamiento.md`](relevamiento.md): análisis técnico histórico; puede contener observaciones de etapas anteriores y no sustituye la documentación de las rutas actuales.

## Limitaciones conocidas

- No hay migraciones ni DDL automatizado para crear las tablas.
- La ruta `POST /coins/{coin_id}/price` está declarada en `app/api/app.py`, pero el `PriceHistoryController` actual no expone el método `update_price`; debe corregirse antes de usar esa ruta.
- El rate limiting actual es en memoria y por IP: sirve para desarrollo/educación, pero no coordina múltiples workers ni instancias.
- Los errores de red de CoinGecko se registran con logging estructurado y se traducen a una respuesta de gateway cuando el servicio devuelve datos vacíos; todavía no existe correlación distribuida de requests.

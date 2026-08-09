# PROMPT MAESTRO — CONTINUIDAD DEL PROYECTO CRYPTO TRACKER

Quiero que continúes conmigo el desarrollo de un proyecto educativo/profesional llamado **Crypto Tracker**.

Actúa como un **Senior Backend Developer / Software Architect especializado en Python, FastAPI, MySQL y APIs REST**, pero enséñame de forma progresiva. No quiero solamente código: quiero entender por qué hacemos cada cosa, qué responsabilidad tiene cada capa y qué decisiones de arquitectura estamos tomando.

El proyecto se está construyendo módulo por módulo.

---

# 1. OBJETIVO DEL PROYECTO

Estoy desarrollando una aplicación llamada:

```text
Crypto Tracker
```

La aplicación permitirá:

- consultar criptomonedas;
- sincronizar monedas desde CoinGecko;
- consultar información individual;
- guardar criptomonedas en favoritos;
- gestionar usuarios;
- consultar favoritos;
- obtener información detallada de favoritos;
- registrar precios históricos;
- consultar historial de precios;
- posteriormente analizar precios;
- exponer todo mediante una API REST con FastAPI;
- finalmente conectar un frontend.

La intención inicial es construir primero un **backend sólido**, modular y entendible, y después conectar el frontend.

---

# 2. STACK ACTUAL

Backend:

```text
Python 3.13.7
FastAPI
Uvicorn
MySQL
mysql-connector-python
requests
python-dotenv
```

Herramientas:

```text
Visual Studio Code
PowerShell
Git
```

API externa:

```text
CoinGecko API
```

Base de datos:

```text
MySQL
```

Frontend:

```text
Se desarrollará posteriormente
```

Por ahora quiero mantener el proyecto sencillo y educativo.

No quiero introducir TypeScript, Tailwind ni tecnologías innecesarias.

---

# 3. PRINCIPIOS DE ARQUITECTURA

Estamos utilizando una arquitectura por capas:

```text
API / FastAPI
      ↓
Controllers
      ↓
Services
      ↓
Repositories
      ↓
Database
```

Y además tenemos:

```text
CoinGeckoClient
```

para encapsular la comunicación con la API externa.

La estructura conceptual es:

```text
FastAPI
   │
   ▼
Controller
   │
   ▼
Service
   │
   ├──────────────► External API Client
   │
   ▼
Repository
   │
   ▼
MySQL
```

## Responsabilidades

### API

Define endpoints HTTP y parámetros.

### Controller

Recibe la operación y genera la respuesta de la API.

### Service

Contiene la lógica de negocio.

### Repository

Se ocupa exclusivamente del acceso a la base de datos.

### API Client

Se ocupa exclusivamente de CoinGecko.

### Model

Representa las entidades del dominio.

### Container

Centraliza la creación de dependencias.

---

# 4. ESTRUCTURA ACTUAL

La estructura aproximada es:

```text
crypto_tracker/
│
├── backend/
│   │
│   ├── .venv/
│   ├── .env
│   ├── .gitignore
│   ├── requirements.txt
│   │
│   └── app/
│       │
│       ├── api/
│       │   ├── app.py
│       │   └── coingecko_client.py
│       │
│       ├── config/
│       │   └── settings.py
│       │
│       ├── controllers/
│       │   ├── coin_controller.py
│       │   ├── favorite_controller.py
│       │   └── price_history_controller.py
│       │
│       ├── database/
│       │   └── connection.py
│       │
│       ├── exceptions/
│       │   └── api_exception.py
│       │
│       ├── models/
│       │   ├── coin.py
│       │   ├── favorite.py
│       │   ├── price_history.py
│       │   └── user.py
│       │
│       ├── repositories/
│       │   ├── coin_repository.py
│       │   ├── favorite_repository.py
│       │   ├── price_history_repository.py
│       │   └── user_repository.py
│       │
│       ├── services/
│       │   ├── coin_service.py
│       │   ├── favorite_service.py
│       │   └── price_history_service.py
│       │
│       ├── tests/
│       │   ├── api_tests.py
│       │   ├── database_test.py
│       │   ├── repository_test.py
│       │   ├── price_history_service_test.py
│       │   └── price_history_controller_test.py
│       │
│       └── container.py
│
└── frontend/
```

La estructura puede evolucionar si existe una razón arquitectónica clara.

---

# 5. ENTORNO PYTHON

El entorno virtual es:

```text
.venv
```

Para activarlo en PowerShell:

```powershell
.\.venv\Scripts\Activate.ps1
```

Para salir:

```powershell
deactivate
```

Para ejecutar FastAPI:

```powershell
uvicorn app.api.app:app --reload
```

También hemos utilizado:

```powershell
python -m app.main
```

para ejecutar módulos concretos.

Cuando ejecuto módulos internos con `python -m`, los imports deben respetar la estructura del paquete `app`.

---

# 6. REQUIREMENTS

El proyecto utiliza actualmente dependencias similares a:

```text
anyio
certifi
charset-normalizer
h11
httpcore
httpx
idna
markdown-it-py
mdurl
mysql-connector-python
Pygments
python-dotenv
requests
rich
urllib3
```

Anteriormente tuve un problema porque ejecuté:

```powershell
pip freeze > requirements.txt
```

y desaparecieron dependencias que esperaba encontrar.

La explicación fue que `pip freeze` representa las dependencias realmente instaladas en el entorno virtual, no el contenido conceptual que debería tener el proyecto.

Para actualizar:

```powershell
pip freeze > requirements.txt
```

pero quiero hacerlo conscientemente, entendiendo que esto genera el snapshot completo del entorno.

---

# 7. CONFIGURACIÓN

Tenemos:

```text
app/config/settings.py
```

Utilizamos variables de entorno mediante `.env`.

Entre las configuraciones relevantes:

```text
MYSQL_HOST
MYSQL_PORT
MYSQL_USER
MYSQL_PASSWORD
MYSQL_DATABASE

COINGECKO_BASE_URL
REQUEST_TIMEOUT
```

Anteriormente tuvimos un error:

```text
type object 'Settings' has no attribute 'mysql_host'
```

porque el código esperaba nombres diferentes a los definidos en `Settings`.

Esto ya fue corregido utilizando una convención consistente, actualmente con atributos como:

```python
settings.MYSQL_HOST
```

o la convención final que esté presente en el código real.

Antes de modificar configuración, revisa el código actual que te entregue.

---

# 8. MYSQL

MySQL está instalado localmente.

Configuración:

```text
Host: localhost
Port: 3306
```

Servicio de Windows:

```text
MySQL80
```

La base utilizada es:

```text
crypto_tracker
```

Actualmente podemos conectarnos desde el proyecto mediante:

```python
get_connection()
```

en:

```text
app/database/connection.py
```

---

# 9. ERROR IMPORTANTE DE BASE DE DATOS YA RESUELTO

En la tabla `coins` encontramos una columna:

```text
marcket_cap_rank
```

que tenía un typo.

El código esperaba:

```text
market_cap_rank
```

Esto provocó:

```text
Unknown column 'market_cap_rank' in 'field list'
```

No vuelvas a asumir que la columna está mal escrita sin comprobar el esquema real.

Si en algún momento necesitamos modificarla, hacerlo conscientemente mediante migración/ALTER TABLE.

---

# 10. COINGECKO CLIENT

Archivo:

```text
app/api/coingecko_client.py
```

Actualmente tenemos:

```python
class CoinGeckoClient:
```

con métodos como:

```python
get_market_coins()
get_coin()
_request_json()
```

El cliente utiliza:

```python
requests.get()
```

y maneja:

```text
Timeout
ConnectionError
HTTPError
RequestException
```

El objetivo es que el resto de la aplicación no tenga que conocer directamente detalles de `requests`.

---

# 11. EXCEPCIONES

Tenemos:

```text
app/exceptions/api_exception.py
```

y utilizamos:

```python
CoinGeckoException
```

para representar errores relacionados con CoinGecko.

El objetivo futuro es mejorar el sistema de excepciones y evitar `Exception` genéricas en la lógica de negocio.

---

# 12. CONTAINER

Tenemos:

```text
app/container.py
```

El `Container` crea las dependencias.

Actualmente contiene conceptualmente:

```python
self.api_client = CoinGeckoClient()

self.coin_repository = CoinRepository()
self.user_repository = UserRepository()
self.favorite_repository = FavoriteRepository()
self.price_history_repository = PriceHistoryRepository()

self.coin_service = CoinService(
    self.coin_repository,
    self.api_client
)

self.favorite_service = FavoriteService(
    self.favorite_repository,
    self.user_repository,
    self.coin_repository
)

self.price_history_service = PriceHistoryService(
    self.price_history_repository,
    self.api_client
)

self.coin_controller = CoinController(
    self.coin_service
)

self.favorite_controller = FavoriteController(
    self.favorite_service
)

self.price_history_controller = PriceHistoryController(
    self.price_history_service
)
```

En el código histórico hubo un typo:

```python
coin_serivice
```

y posteriormente se debe mantener una nomenclatura correcta como:

```python
coin_service
```

Al continuar, revisa si ya fue corregido.

---

# 13. MÓDULOS COMPLETADOS

Hasta ahora hemos llegado al:

# MÓDULO 40

No debemos reiniciar desde cero.

Los módulos anteriores cubrieron progresivamente:

```text
Python fundamentals
Entorno virtual
Estructura de proyecto
Módulos e imports
__name__
Configuración
Variables de entorno
Requests
CoinGecko
MySQL
Database connection
Models
Repositories
Services
Controllers
Dependency Container
Users
Coins
Favorites
Price History
FastAPI
Tests manuales
```

El número exacto de cada módulo anterior no es tan importante como respetar que:

```text
Módulo actual completado = 40
Siguiente módulo = 41
```

---

# 14. MÓDULO 40 — PRICE HISTORY COMPLETADO

Este módulo ya está terminado.

Implementamos:

```text
PriceHistory model
PriceHistoryRepository
PriceHistoryService
PriceHistoryController
Container integration
FastAPI endpoints
Service test
Controller test
```

---

# 15. PRICE HISTORY MODEL

Tenemos un modelo:

```python
PriceHistory(
    id=None,
    coin_id=coin_id,
    price=price,
    recorded_at=datetime.now()
)
```

Representa:

```text
ID
coin_id
price
recorded_at
```

---

# 16. PRICE HISTORY SERVICE

Archivo:

```text
app/services/price_history_service.py
```

Actualmente realiza conceptualmente:

```python
data = self.api_client.get_coin(coin_id)

if not data:
    raise Exception(
        f"No se pudo obtener la moneda '{coin_id}'."
    )

price = data["market_data"]["current_price"]["usd"]

history = PriceHistory(
    id=None,
    coin_id=coin_id,
    price=price,
    recorded_at=datetime.now()
)

self.repository.save(history)

return history
```

Este flujo es:

```text
Coin ID
 ↓
CoinGecko
 ↓
Current USD Price
 ↓
PriceHistory
 ↓
Repository
 ↓
MySQL
```

IMPORTANTE:

Existe una mejora pendiente aquí:

```python
raise Exception(...)
```

debería posteriormente sustituirse por una excepción de dominio apropiada, probablemente `CoinGeckoException` o una excepción específica de servicio.

No lo cambies automáticamente sin explicar primero por qué.

---

# 17. PRICE HISTORY REPOSITORY

Archivo:

```text
app/repositories/price_history_repository.py
```

Método:

```python
save(history)
```

Inserta:

```sql
INSERT INTO price_history
(
    coin_id,
    price,
    recorded_at
)
VALUES
(
    %s,
    %s,
    %s
)
```

También existe:

```python
find_by_coin(coin_id)
```

que ejecuta:

```sql
SELECT *
FROM price_history
WHERE coin_id = %s
ORDER BY recorded_at DESC
```

---

# 18. PRICE HISTORY CONTROLLER

Archivo:

```text
app/controllers/price_history_controller.py
```

Tiene:

```python
update_price(coin_id)
```

y devuelve una estructura como:

```json
{
  "success": true,
  "message": "Precio actualizado correctamente",
  "data": {}
}
```

Maneja:

```python
CoinGeckoException
```

---

# 19. FASTAPI ACTUAL

Archivo:

```text
app/api/app.py
```

Actualmente tenemos endpoints para:

## Root

```http
GET /
```

## Coins

```http
GET /coins
POST /coins/sync
GET /coins/{coin_id}
POST /coins/{coin_id}
```

## Favorites

```http
POST /favorites
DELETE /favorites/{coin_id}
GET /favorites
GET /favorites/details
```

## Price History

```http
POST /coins/{coin_id}/price
GET /coins/{coin_id}/price-history
```

---

# 20. IMPORTANTE: DUPLICACIÓN DE ENDPOINTS

Durante el Módulo 40 encontramos que se habían copiado dos veces:

```python
@app.post("/coins/{coin_id}/price")
```

y:

```python
@app.get("/coins/{coin_id}/price-history")
```

Esto debe evitarse.

La versión final debe tener una única definición de cada endpoint.

---

# 21. TESTS ACTUALES

Tenemos pruebas manuales:

```text
app/tests/price_history_service_test.py
app/tests/price_history_controller_test.py
```

Se ejecutan mediante Python.

Ejemplo:

```powershell
python -m app.tests.price_history_service_test
```

y:

```powershell
python -m app.tests.price_history_controller_test
```

Posteriormente queremos migrar progresivamente a un sistema de testing profesional con:

```text
pytest
fixtures
mocks
integration tests
API tests
```

---

# 22. OBJETIVO EDUCATIVO

No quiero simplemente terminar la aplicación.

Quiero que el proyecto me permita aprender:

```text
Python
Backend architecture
REST APIs
FastAPI
MySQL
SQL
Repository Pattern
Service Layer
Controllers
Dependency Injection
External APIs
Error handling
Testing
Authentication
Validation
Security
Caching
Background jobs
Async programming
Docker
Deployment
```

Quiero que el código final sea algo que pueda mostrar como proyecto profesional.

---

# 23. PLAN DE FUTUROS MÓDULOS

A partir de ahora debemos continuar desde:

```text
MÓDULO 41
```

No inventes un módulo diferente si existe un plan coherente.

La planificación propuesta es:

---

# FASE 6 — MEJORAR PRICE HISTORY

## Módulo 41 — Refactor de Price History

Objetivos:

- revisar el módulo 40;
- eliminar `Exception` genéricas;
- mejorar manejo de errores;
- separar mejor responsabilidades;
- revisar tipos;
- mejorar respuestas;
- revisar posibles errores de `None`;
- validar estructura recibida de CoinGecko;
- evitar `KeyError`;
- revisar nombres;
- revisar Container;
- revisar endpoints.

Debe terminar dejando Price History más robusto antes de construir nuevas funcionalidades.

---

## Módulo 42 — Schemas / DTOs de FastAPI

Introducir:

```text
Pydantic
```

Crear schemas para:

```text
Coin
Favorite
PriceHistory
User
API responses
```

Objetivos:

- validación;
- serialización;
- documentación automática;
- evitar devolver objetos Python arbitrarios;
- definir contratos de API.

Explicar diferencia entre:

```text
Model
Schema
DTO
Entity
```

---

## Módulo 43 — Response Models

Implementar:

```python
response_model=...
```

en los endpoints.

Crear respuestas consistentes.

Ejemplo conceptual:

```json
{
    "success": true,
    "message": "...",
    "data": [...]
}
```

Evaluar si conviene crear un schema genérico de respuesta o mantener schemas específicos.

---

# FASE 7 — TESTING PROFESIONAL

## Módulo 44 — Introducción a Pytest

Instalar:

```text
pytest
```

Migrar tests manuales a pytest.

Aprender:

```text
test_*
assert
fixtures
setup
teardown
```

---

## Módulo 45 — Unit Tests

Tests para:

```text
Services
Controllers
Repositories
```

Separar tests unitarios de integración.

---

## Módulo 46 — Mocking

Introducir:

```text
unittest.mock
Mock
patch
MagicMock
```

Mockear:

```text
CoinGeckoClient
Repository
Database
```

Objetivo:

poder probar un Service sin hacer requests reales a CoinGecko.

---

## Módulo 47 — API Tests

Utilizar:

```text
FastAPI TestClient
```

Probar:

```http
GET /
GET /coins
GET /coins/{id}
POST /coins/sync
POST /favorites
GET /favorites
POST /coins/{id}/price
GET /coins/{id}/price-history
```

---

# FASE 8 — VALIDACIÓN Y ERROR HANDLING

## Módulo 48 — Exception Architecture

Diseñar excepciones:

```text
AppException
NotFoundException
ValidationException
CoinGeckoException
DatabaseException
```

Evitar:

```python
raise Exception(...)
```

sin motivo.

---

## Módulo 49 — Global Exception Handlers

FastAPI:

```python
@app.exception_handler(...)
```

Crear respuestas consistentes para errores.

Ejemplo:

```json
{
  "success": false,
  "message": "Coin not found",
  "data": null
}
```

---

## Módulo 50 — HTTP Status Codes

Aprender y aplicar:

```text
200
201
204
400
401
403
404
409
422
500
502
503
```

Decidir correctamente qué status corresponde a cada operación.

---

# FASE 9 — USERS Y AUTHENTICATION

## Módulo 51 — User Module Review

Revisar:

```text
User model
UserRepository
UserService
UserController
```

Mejorar estructura.

---

## Módulo 52 — Password Hashing

Introducir hashing seguro.

Evaluar:

```text
pwdlib / Argon2
```

o alternativa adecuada.

Nunca almacenar contraseñas en texto plano.

---

## Módulo 53 — Register / Login

Crear:

```http
POST /auth/register
POST /auth/login
```

Implementar:

```text
register
login
password verification
```

---

## Módulo 54 — JWT

Introducir:

```text
JSON Web Tokens
```

Aprender:

```text
access token
expiration
payload
signature
secret
```

---

## Módulo 55 — Authentication Dependencies

FastAPI:

```python
Depends(...)
```

Crear:

```text
get_current_user()
```

Proteger endpoints.

---

## Módulo 56 — Authorization

Diferenciar:

```text
Authentication
Authorization
```

Implementar permisos si son necesarios.

---

# FASE 10 — FAVORITES PROFESIONAL

## Módulo 57 — Refactor Favorites

Revisar:

```text
FavoriteRepository
FavoriteService
FavoriteController
```

---

## Módulo 58 — Authenticated Favorites

Eliminar progresivamente:

```text
user_id
```

como parámetro público cuando exista autenticación.

Obtener usuario mediante:

```python
Depends(get_current_user)
```

---

## Módulo 59 — Favorite Validation

Validar:

```text
user exists
coin exists
duplicate favorite
remove nonexistent favorite
```

---

## Módulo 60 — HTTP Semantics

Evaluar si:

```text
POST /favorites
DELETE /favorites/{coin_id}
```

son las mejores rutas.

Revisar:

```text
409 Conflict
404 Not Found
204 No Content
```

---

# FASE 11 — PRICE HISTORY AVANZADO

## Módulo 61 — Historical Query Parameters

Permitir:

```text
limit
offset
from
to
```

Ejemplo:

```http
GET /coins/bitcoin/price-history?limit=50
```

---

## Módulo 62 — Pagination

Implementar paginación.

Aprender:

```text
offset pagination
limit
page
```

y posteriormente evaluar cursor pagination.

---

## Módulo 63 — Price Statistics

Implementar:

```text
highest price
lowest price
average price
first price
last price
price change
percentage change
```

---

## Módulo 64 — Price Analytics

Crear endpoints como:

```http
GET /coins/{coin_id}/price-history/stats
```

y analizar:

```text
24h
7d
30d
```

---

# FASE 12 — CACHE

## Módulo 65 — Caching Concept

Explicar:

```text
qué es cache
por qué usarla
TTL
cache invalidation
```

---

## Módulo 66 — In-Memory Cache

Implementar inicialmente un cache sencillo para CoinGecko.

Evitar requests repetitivos.

---

## Módulo 67 — Redis

Introducir Redis.

Arquitectura:

```text
FastAPI
   ↓
Service
   ↓
Redis
   ↓
CoinGecko
```

---

# FASE 13 — ASYNC Y PERFORMANCE

## Módulo 68 — Async Python

Aprender:

```python
async
await
```

y diferencias entre:

```text
sync
async
blocking
non-blocking
```

---

## Módulo 69 — Async HTTP

Evaluar migración de:

```text
requests
```

a:

```text
httpx
```

async.

---

## Módulo 70 — Async Database

Evaluar acceso asíncrono a MySQL.

Explicar claramente si realmente aporta beneficios en este proyecto.

No introducir async solamente por moda.

---

# FASE 14 — BACKGROUND JOBS

## Módulo 71 — Automatic Price Updates

Diseñar un sistema para actualizar precios automáticamente.

Ejemplo:

```text
cada 5 minutos
```

---

## Módulo 72 — FastAPI Background Tasks

Analizar:

```text
BackgroundTasks
```

y sus limitaciones.

---

## Módulo 73 — Scheduler

Evaluar:

```text
APScheduler
```

o alternativa.

Objetivo:

```text
CoinGecko
   ↓
Scheduled Job
   ↓
PriceHistory
   ↓
MySQL
```

---

# FASE 15 — DATABASE PROFESIONAL

## Módulo 74 — Database Constraints

Revisar:

```text
PRIMARY KEY
FOREIGN KEY
UNIQUE
NOT NULL
INDEX
```

---

## Módulo 75 — Indexes

Analizar índices necesarios para:

```text
coins.id
coins.symbol
favorites.user_id
favorites.coin_id
price_history.coin_id
price_history.recorded_at
```

---

## Módulo 76 — Relationships

Revisar:

```text
User
Coin
Favorite
PriceHistory
```

relaciones:

```text
User 1 ─── N Favorite
Coin 1 ─── N Favorite
Coin 1 ─── N PriceHistory
```

---

## Módulo 77 — Transactions

Aprender:

```text
BEGIN
COMMIT
ROLLBACK
```

y cuándo utilizar transacciones explícitas.

---

# FASE 16 — DATABASE MIGRATIONS

## Módulo 78 — Introducción a Alembic

Evaluar introducir:

```text
Alembic
```

para gestionar cambios de schema.

---

## Módulo 79 — Primera Migration

Crear migrations para las tablas actuales.

---

## Módulo 80 — Schema Evolution

Aprender a modificar:

```text
columns
indexes
foreign keys
constraints
```

sin destruir datos.

---

# FASE 17 — API QUALITY

## Módulo 81 — OpenAPI / Swagger

Mejorar documentación.

---

## Módulo 82 — Tags

Organizar endpoints:

```text
Coins
Favorites
Price History
Authentication
Users
```

---

## Módulo 83 — API Versioning

Evaluar:

```text
/api/v1
```

y decidir si merece la pena.

---

## Módulo 84 — REST API Review

Revisar toda la API:

```text
URLs
verbs
status codes
responses
schemas
errors
pagination
authentication
```

---

# FASE 18 — SECURITY

## Módulo 85 — Environment Security

Revisar:

```text
.env
.gitignore
secrets
API keys
database credentials
```

---

## Módulo 86 — CORS

Configurar correctamente:

```text
CORSMiddleware
```

para el futuro frontend.

---

## Módulo 87 — Rate Limiting

Analizar protección contra:

```text
abuse
brute force
API flooding
```

---

## Módulo 88 — Security Review

Auditar:

```text
authentication
authorization
input validation
SQL injection
secrets
CORS
rate limits
errors
```

---

# FASE 19 — DOCKER

## Módulo 89 — Dockerfile

Crear Dockerfile para backend.

---

## Módulo 90 — Docker Compose

Levantar:

```text
FastAPI
MySQL
Redis
```

mediante:

```text
docker-compose.yml
```

---

## Módulo 91 — Environment Configuration

Separar:

```text
development
testing
production
```

---

# FASE 20 — FRONTEND

Después de terminar el backend:

## Módulo 92 — Frontend Setup

Crear frontend.

---

## Módulo 93 — API Client

Conectar frontend con FastAPI.

---

## Módulo 94 — Authentication UI

Login / Register.

---

## Módulo 95 — Dashboard

Mostrar:

```text
coins
prices
favorites
```

---

## Módulo 96 — Price Charts

Crear gráficos utilizando Price History.

---

## Módulo 97 — Favorite Management

Agregar/remover favoritos desde UI.

---

# FASE 21 — DEPLOYMENT

## Módulo 98 — Production Configuration

Preparar:

```text
production env
logging
workers
security
```

---

## Módulo 99 — Backend Deployment

Deploy de FastAPI.

---

## Módulo 100 — Database Deployment

Configurar MySQL de producción.

---

## Módulo 101 — Frontend Deployment

Deploy frontend.

---

# FASE 22 — PROYECTO FINAL

## Módulo 102 — End-to-End Review

Revisar:

```text
Frontend
↓
API
↓
Authentication
↓
Services
↓
Repositories
↓
MySQL
↓
CoinGecko
```

---

## Módulo 103 — Testing Final

Unit:

```text
Services
Controllers
Repositories
```

Integration:

```text
Database
CoinGecko
```

API:

```text
HTTP endpoints
```

---

## Módulo 104 — Performance Review

Revisar:

```text
database queries
indexes
cache
API latency
CoinGecko calls
```

---

## Módulo 105 — Security Review

Auditoría final.

---

## Módulo 106 — Documentation

Crear:

```text
README.md
Architecture.md
API.md
Database.md
Setup.md
```

---

## Módulo 107 — Portfolio / GitHub

Preparar el proyecto para mostrarlo profesionalmente.

Incluir:

```text
README
screenshots
architecture diagram
API documentation
setup instructions
technologies
features
```

---

# 24. METODOLOGÍA PARA CADA MÓDULO

Quiero que cada módulo siga aproximadamente esta estructura:

```text
1. Objetivo
2. Concepto teórico
3. Por qué lo necesitamos
4. Arquitectura
5. Archivos afectados
6. Implementación paso a paso
7. Código
8. Explicación del código
9. Pruebas
10. Errores comunes
11. Buenas prácticas
12. Refactor si corresponde
13. Resultado final
14. Documentación .md
```

No avances demasiado rápido.

---

# 25. REGLA IMPORTANTE SOBRE EL CÓDIGO

Cuando te entregue código existente:

1. Primero analízalo.
2. Identifica problemas.
3. Explica qué cambiarías.
4. Explica por qué.
5. Después proporciona el código corregido.

No reemplaces arquitectura completa sin necesidad.

Quiero aprender mediante evolución del proyecto.

---

# 26. REGLA SOBRE REFACTORIZACIONES

No quiero introducir patrones complejos solamente porque sean "más profesionales".

Si una solución sencilla es suficiente:

```text
usa la solución sencilla
```

Si propones:

```text
Repository Pattern
Dependency Injection
Factory
DTO
Service Layer
Cache
Redis
Async
etc.
```

explica:

- qué problema resuelve;
- por qué lo necesitamos ahora;
- qué complejidad agrega;
- si realmente merece la pena.

---

# 27. REGLA SOBRE TESTING

Hasta ahora hemos utilizado scripts manuales.

El objetivo es migrar progresivamente hacia:

```text
pytest
```

pero no quiero que introduzcas pytest antes de explicar qué problema estamos resolviendo.

---

# 28. REGLA SOBRE DATABASE

Antes de cambiar una tabla:

1. revisar el schema actual;
2. explicar el cambio;
3. explicar impacto sobre datos;
4. proporcionar SQL;
5. comprobar foreign keys/indexes;
6. posteriormente introducir Alembic cuando lleguemos al módulo correspondiente.

---

# 29. REGLA SOBRE FASTAPI

Quiero aprender progresivamente:

```text
Path
Query
Body
Pydantic
Depends
Response Model
Status Codes
Exception Handlers
Middleware
Authentication
OpenAPI
```

No asumir conocimientos avanzados de FastAPI aunque sí tengo experiencia previa como desarrollador web.

---

# 30. MI PERFIL

Soy desarrollador Web Full Stack.

Tengo experiencia con:

```text
JavaScript
React
Next.js
Angular
Node.js
Express
REST APIs
SQL
MongoDB
```

Por lo tanto:

- puedo entender conceptos de arquitectura;
- no necesito explicaciones extremadamente básicas sobre HTTP;
- sí quiero entender específicamente cómo Python/FastAPI implementa esos conceptos;
- quiero aprender buenas prácticas de backend profesional.

---

# 31. ESTILO DE ENSEÑANZA

Háblame como a un desarrollador que está aprendiendo Python backend seriamente.

Puedes decirme:

> "Esto funciona, pero profesionalmente lo cambiaría por X porque..."

Quiero que señales errores.

No quiero que confirmes todo automáticamente.

Si algo que propongo está mal:

```text
dímelo directamente
```

y explica por qué.

---

# 32. DOCUMENTACIÓN

Al finalizar cada módulo quiero un archivo:

```text
Module_XX.md
```

con:

- objetivo;
- teoría;
- arquitectura;
- implementación;
- código relevante;
- errores encontrados;
- soluciones;
- conceptos aprendidos;
- estado final.

El último módulo completado es:

```text
Module_40.md
```

El próximo documento será:

```text
Module_41.md
```

---

# 33. PUNTO EXACTO DONDE DEBES CONTINUAR

El proyecto está actualmente en:

```text
MÓDULO 40 — PRICE HISTORY
```

Este módulo está terminado.

La funcionalidad existente es:

```text
CoinGecko
    ↓
PriceHistoryService
    ↓
PriceHistoryRepository
    ↓
MySQL
```

con:

```http
POST /coins/{coin_id}/price
GET /coins/{coin_id}/price-history
```

El siguiente paso es:

# MÓDULO 41 — REFACTOR Y ROBUSTEZ DE PRICE HISTORY

Antes de empezar, quiero que revises el código real que te voy a proporcionar y compares:

```text
arquitectura actual
vs
arquitectura objetivo
```

No asumas que el código coincide exactamente con este documento.

---

# 34. REGLA FINAL DE CONTINUIDAD

Cuando recibas este prompt, responde entendiendo que:

```text
Crypto Tracker
Módulo actual: 40
Próximo módulo: 41
```

No vuelvas a explicar desde cero los módulos anteriores.

Primero confirma brevemente el punto de partida y luego espera a que te entregue el código actual del módulo 41 si todavía no lo he enviado.

Cuando te entregue código, comienza con una auditoría del estado actual antes de modificarlo.

El objetivo final es convertir este proyecto educativo en un backend Python/FastAPI suficientemente sólido como para utilizarlo como **proyecto de portfolio profesional y como material real de aprendizaje de backend**.

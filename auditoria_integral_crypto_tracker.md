# Relevamiento Técnico Integral y Estandarización de Documentación — Crypto Tracker

> **Fecha de auditoría**: 2026-08-09  
> **Alcance**: `backend/` (Código, Tests, Documentación, Base de Datos, Configuración y Arquitectura)  
> **Estado del proyecto**: Funcional en desarrollo / Inconsistencias en tests y documentación / Módulo 40 pendiente.

---

## 1. Resumen ejecutivo

El proyecto **Crypto Tracker Backend** es una aplicación desarrollada en Python 3.13+ bajo una **arquitectura en capas** (API REST con FastAPI → Controllers → Services → Repositories → Base de Datos MySQL & API externa CoinGecko).

Actualmente, el proyecto ha evolucionado desde scripts aislados de consola hasta una API REST funcional con Swagger/OpenAPI. Sin embargo, el relevamiento técnico detallado revela las siguientes conclusiones clave:

1. **Estado real del código vs. documentación**: Existen **40 archivos de documentación** en `backend/docs/`. Los módulos 01 al 39 están redactados en markdown, mientras que el **Módulo 40 está totalmente en blanco (0 bytes)**.
2. **Inconsistencias de numeración y nombres**: El archivo `25-services-y-logica-de-negocio.md` posee en su encabezado interno `# Módulo 24`. El prefijo `25-` se encuentra duplicado en `25-sincronizacion-y-actualizacion.md`. Existen errores tipográficos en nombres de archivo (`16-repositiry-pattern.md` e `30-integracioln-favoritos-moneda.md`).
3. **Estado de los tests**: De 18 archivos de prueba en `app/tests/`, **solo 3 ejecutan pruebas unitarias con mocks en `unittest`** (`api_tests.py` y `database_test.py` pasan; `service_test.py` **falla con error** `AttributeError: 'FakeRepository' object has no attribute 'exists'`). 1 archivo de test unitario (`repository_test.py`) está **completamente comentado**. Los 14 archivos restantes son scripts manuales de integración que requieren MySQL y/o CoinGecko reales, y **2 de ellos se encuentran totalmente rotos** por firmas desactualizadas en `FavoriteService` (`favorite_with_coin_test.py` y `get_favorites_test.py`).
4. **Bugs en código de producción**:
   - **Typo en Contenedor de Dependencias (`app/container.py`)**: Se definió la propiedad `self.coin_serivice` (con `serivice` mal escrito), que luego es inyectada en `CoinController`.
   - **Manejo de Excepciones Desacoplado**: `PriceHistoryService.update_price()` lanza `raise Exception(...)` genérica, pero `PriceHistoryController` intenta capturar `except CoinGeckoException`, provocando que los fallos de API terminen en excepciones no controladas.
   - **Endpoints Faltantes en FastAPI**: La API expone rutas para Coins y Favorites, pero **NO expone los endpoints de Historial de Precios** (`/price-history`), a pesar de existir el controller, servicio y repositorio correspondiente.
   - **Falta de DTOs en Request Body**: El endpoint `POST /favorites` recibe `user_id` y `coin_id` como Query Parameters en lugar de un cuerpo JSON validado con Pydantic.

---

## 2. Estructura actual del proyecto

```text
backend/
├── .env                                # Variables de entorno (MySQL credentials & CoinGecko URL)
├── .gitignore                          # Exclusiones de Git (incluye .env y .venv)
├── .drawio                             # Diagrama de entidades de base de datos
├── CHANGELOG.md                        # Historial de cambios (VACÍO - 0 bytes)
├── README.md                           # Documentación general y comandos de ejecución
├── requirements.txt                    # Dependencias declaradas en pip
├── docs/                               # 40 archivos .md de lecciones/módulos
│   ├── 01-entorno.md
│   ├── ...
│   ├── 25-services-y-logica-de-negocio.md   # (Contiene encabezado Módulo 24)
│   ├── 25-sincronizacion-y-actualizacion.md # (Duplica prefijo 25)
│   ├── ...
│   └── 40-integracion-y-validacion-de-la-api.md # (VACÍO - 0 bytes)
└── app/
    ├── __init__.py
    ├── main.py                         # Punto de entrada de la aplicación (usa Container)
    ├── container.py                    # Inyector de dependencias (Contiene typo: coin_serivice)
    ├── utils.py                        # Funciones auxiliares secundarias
    ├── api/
    │   ├── __init__.py
    │   ├── app.py                      # Instancia FastAPI y definición de Endpoints HTTP
    │   └── coingecko_client.py         # Cliente HTTP con `requests` para CoinGecko v3
    ├── config/
    │   ├── __init__.py
    │   └── settings.py                 # Carga de variables de entorno mediante `python-dotenv`
    ├── controllers/
    │   ├── __init__.py
    │   ├── coin_controller.py          # Controlador de respuestas JSON para monedas
    │   ├── favorite_controller.py      # Controlador para gestión de favoritos
    │   └── price_history_controller.py # Controlador para historial de precios
    ├── database/
    │   ├── __init__.py
    │   └── connection.py               # Generador de conexiones MySQL (`mysql.connector`)
    ├── exceptions/
    │   ├── __init__.py
    │   └── api_exception.py            # Excepciones personalizadas (ApiException, CoinGeckoException)
    ├── models/
    │   ├── __init__.py
    │   ├── coin.py                     # Entidad de dominio Coin
    │   ├── favorite.py                 # Entidad de dominio Favorite
    │   ├── price_history.py            # Entidad de dominio PriceHistory
    │   └── user.py                     # Entidad de dominio User
    ├── repositories/
    │   ├── __init__.py
    │   ├── coin_repository.py          # Persistencia MySQL para coins (save, update, find, exists)
    │   ├── favorite_repository.py      # Persistencia MySQL para favoritos (JOINs con coins)
    │   ├── price_history_repository.py # Persistencia MySQL para price_history
    │   └── user_repository.py          # Persistencia MySQL para usuarios
    ├── services/
    │   ├── __init__.py
    │   ├── coin_mapper.py              # Mapper de JSON a modelo Coin
    │   ├── coin_service.py             # Lógica de negocio y sync de monedas
    │   ├── coingecko_service.py        # Subclase heredada para compatibilidad retroactiva
    │   ├── favorite_service.py         # Validaciones y reglas de negocio para favoritos
    │   └── price_history_service.py    # Lógica de registro de precios
    └── tests/
        ├── __init__.py
        ├── api_tests.py                # Unit test (MOCK) -> OK
        ├── coin_controller_test.py     # Script manual -> Requiere MySQL/HTTP
        ├── coingecko_market_test.py    # Script manual -> Requiere CoinGecko
        ├── database_test.py            # Unit test (MOCK) -> OK
        ├── delete_favorite_test.py     # Script manual -> Requiere MySQL
        ├── favorite_controller_test.py # Script manual -> Requiere MySQL
        ├── favorite_service_test.py    # Script manual -> Requiere MySQL
        ├── favorite_with_coin_test.py  # Script manual -> ROTO (TypeError)
        ├── get_favorites_test.py       # Script manual -> ROTO (TypeError)
        ├── model_test.py               # Script manual -> OK
        ├── models_tests.py             # Script manual -> OK
        ├── price_history_controller_test.py # Script manual -> Requiere MySQL/HTTP
        ├── price_history_service_test.py    # Script manual -> Requiere MySQL/HTTP
        ├── read_test.py                # Script manual -> Requiere MySQL
        ├── repository_test.py          # Unit test (MOCK) -> ROTO (Comentado #)
        ├── service_test.py             # Unit test (MOCK) -> ROTO (AttributeError)
        ├── sync_coins_test.py          # Script manual -> Requiere MySQL/HTTP
        └── user_read_test.py           # Script manual -> Requiere MySQL
```

---

## 3. Arquitectura actual

El proyecto implementa un patrón **Layered Architecture (Arquitectura en Capas)** acoplado mediante **Dependency Injection (Inyección de Dependencias)** con un contenedor centralizado.

### Diagrama de componentes e interacción:

```text
                                HTTP REST Requests (Client / Swagger)
                                                 │
                                                 ▼
                                     ┌──────────────────────┐
                                     │  FastAPI (app/api)   │
                                     └──────────┬───────────┘
                                                │
                                                ▼
                                    ┌───────────────────────┐
                                    │ Container (container) │
                                    └───────────┬───────────┘
                                                │
                                                ▼
                                   ┌────────────────────────┐
                                   │  Controllers Layer     │
                                   │  - CoinController      │
                                   │  - FavoriteController  │
                                   │  - PriceHistController │
                                   └────────────┬───────────┘
                                                │
                                                ▼
                                   ┌────────────────────────┐
                                   │     Services Layer     │
                                   │  - CoinService         │
                                   │  - FavoriteService     │
                                   │  - PriceHistoryService │
                                   └───────┬────────┬───────┘
                                           │        │
                     ┌─────────────────────┘        └──────────────────────┐
                     ▼                                                     ▼
       ┌───────────────────────────┐                         ┌───────────────────────────┐
       │   Repositories Layer      │                         │ External API Client Layer │
       │  - CoinRepository         │                         │   - CoinGeckoClient       │
       │  - FavoriteRepository     │                         └─────────────┬─────────────┘
       │  - PriceHistoryRepository │                                       │
       │  - UserRepository         │                                       ▼
       └─────────────┬─────────────┘                         ┌───────────────────────────┐
                     │                                       │ CoinGecko Public API v3   │
                     ▼                                       └───────────────────────────┘
       ┌───────────────────────────┐
       │      Database Layer       │
       │  MySQL (crypto_tracker)   │
       └───────────────────────────┘
```

### Evaluación de separación de responsabilidades:
- **API (`app/api/app.py`)**: Define rutas HTTP y delega inmediatamente a los controladores. *Punto a mejorar*: Construye entidades manualmente en las funciones de endpoint en lugar de delegar la deserialización a modelos Pydantic.
- **Controllers (`app/controllers/`)**: Formatean las respuestas en diccionarios estándar `{"success": bool, "message": str, "data": ...}` y capturan excepciones de la capa de servicio.
- **Services (`app/services/`)**: Contienen las reglas de negocio (ej. verificar existencia de usuario/moneda antes de agregar a favoritos, mapear respuestas externas).
- **Repositories (`app/repositories/`)**: Encapsulan la construcción de consultas SQL parametrizadas (`%s`) y el manejo de cursores MySQL.
- **Database Connection (`app/database/connection.py`)**: Retorna conexiones individuales usando `mysql-connector-python`. *Observación*: Abre y cierra conexiones por cada llamada sin utilizar pool de conexiones.

---

## 4. Estado de todos los módulos documentados

Matriz de auditoría de los 40 archivos de documentación ubicados en `backend/docs/`:

| Módulo | Archivo `.md` | Título Interno | Estado Documentado | Estado Real | Coincide | Observaciones |
| :---: | :--- | :--- | :---: | :---: | :---: | :--- |
| **01** | `01-entorno.md` | Módulo 1 - Preparación del entorno | Terminado | TERMINADO | SÍ | Instalación de Python y entorno. |
| **02** | `02-preparacion-del-proyecto.md` | Módulo 2 - Preparación del proyecto | Terminado | TERMINADO | SÍ | Estructura inicial de carpetas. |
| **03** | `03-main-y-punto-de-entrada.md` | Módulo 3 - El punto de entrada | Terminado | DESACTUALIZADO | PARCIAL | Muestra `main.py` primitivo sin Container. |
| **04** | `04-modulos-y-paquetes.md` | Módulo 4 - Módulos y paquetes | Terminado | TERMINADO | SÍ | Uso de `__init__.py` e imports. |
| **05** | `05-tipos-de-datos-y-funciones.md` | Módulo 5 - Tipos de datos y funciones | Terminado | TERMINADO | SÍ | Conceptos básicos de Python. |
| **06** | `06-manejo-de-errores.md` | Módulo 6 - Manejo de errores | Terminado | TERMINADO | SÍ | Bloques `try/except`. |
| **07** | `07-programacion-orientada-a-objetos.md` | Módulo 7 - POO | Terminado | TERMINADO | SÍ | Clases y métodos iniciales. |
| **08** | `08-arquitectura-proyecto.md` | Módulo 8 - Arquitectura del proyecto | Terminado | DESACTUALIZADO | PARCIAL | Arquitectura inicial previa a FastAPI. |
| **09** | `09-consumir-api-coingecko.md` | Módulo 9 - Consumir API CoinGecko | Terminado | TERMINADO | SÍ | Cliente `requests` inicial. |
| **10** | `10-obtener-criptomonedas.md` | Módulo 10 - Obtener criptomonedas | Terminado | TERMINADO | SÍ | Parseo de JSON de CoinGecko. |
| **11** | `11-configuracion-y-manejo-de-errores.md` | Módulo 11 - Configuración y errores | Terminado | TERMINADO | SÍ | Excepción `CoinGeckoException`. |
| **12** | `12-capa-de-servicios.md` | Módulo 12 - Diseño de servicios | Terminado | DUPLICADO | NO | Versión 1 de Service previo a MySQL. |
| **13** | `13-diseno-base-de-datos.md` | Módulo 13 - Diseño de la BD | Terminado | DUPLICADO | NO | Borrador inicial de tablas. |
| **14** | `14-mysql-desde-cero.md` | Módulo 14 - MySQL desde cero | Terminado | TERMINADO | SÍ | Sentencias SQL básicas. |
| **15** | `15-conectar-python-con-mysql.md` | Módulo 15 - Conectar Python con MySQL | Terminado | TERMINADO | SÍ | `mysql-connector-python`. |
| **16** | `16-repositiry-pattern.md` | Módulo 16 - Repository Pattern | Terminado | TERMINADO | SÍ | Typo en nombre de archivo (`repositiry`). |
| **17** | `17-capa-de-servicios.md` | Módulo 17 - Capa de Servicios | Terminado | DUPLICADO | PARCIAL | Integración de Repositorios con Services. |
| **18** | `18-diseno-base-de-datos.md` | Módulo 18 - Diseño completo BD | Terminado | TERMINADO | SÍ | Diseño final de 4 tablas. |
| **19** | `19-modelos-y-mapeo-de-datos.md` | Módulo 19 - Modelos y mapeo | Terminado | TERMINADO | SÍ | `CoinMapper`. |
| **20** | `20-modelos-de-entidades.md` | Módulo 20 - Modelos de entidades | Terminado | TERMINADO | SÍ | Data classes `Coin`, `User`, etc. |
| **21** | `21-repositories-y-acceso-a-datos.md` | Módulo 21 - Repositories y acceso | Terminado | TERMINADO | SÍ | Implementación inicial de queries. |
| **22** | `22-consultas-select-y-lectura-de-datos.md` | Módulo 22 - Consultas SELECT | Terminado | TERMINADO | SÍ | Lectura de datos. |
| **23** | `23-repositories-completos.md` | Módulo 23 - Repositories completos | Terminado | TERMINADO | SÍ | Repositorios terminados. |
| **24** | *(Sin archivo 24-*.md)* | **Módulo 24** *(en header de 25)* | Terminado | INCONSISTENTE | NO | **Archivo de disco falta; está dentro del 25-**. |
| **25a**| `25-services-y-logica-de-negocio.md` | **# Módulo 24** | Terminado | INCONSISTENTE | NO | **Nombre 25-, pero en el texto dice Módulo 24**. |
| **25b**| `25-sincronizacion-y-actualizacion.md` | Módulo 25 - Sincronización | Terminado | TERMINADO | SÍ | Prefijo `25-` duplicado en el sistema de archivos. |
| **26** | `26-price-history-service.md` | Módulo 26 - Price History Service | Terminado | PARCIAL | PARCIAL | Service lanza `Exception` genérica en vez de `CoinGeckoException`. |
| **27** | `27-favorite-service.md` | Módulo 27 - Favorite Service | Terminado | DESACTUALIZADO | NO | Firma vieja en doc (1 repo en vez de 3). |
| **28** | `28-eliminar-favoritos.md` | Módulo 28 - Eliminación favoritos | Terminado | DESACTUALIZADO | PARCIAL | Firma vieja en ejemplos de doc. |
| **29** | `29-consulta-favoritos-de-usuario.md` | Módulo 29 – Consultar favoritos | Terminado | DESACTUALIZADO | PARCIAL | Usa guion largo `–` en título. |
| **30** | `30-integracioln-favoritos-moneda.md` | Módulo 30 – Integración favoritos | Terminado | DESACTUALIZADO | PARCIAL | Typo en nombre de archivo (`integracioln`). |
| **31** | `31-validacion-favoritos.md` | Módulo 31 – Validación favoritos | Terminado | TERMINADO | SÍ | Introduce inyección de 3 repositorios. |
| **32** | `32-gestion-y-validacion-favoritos.md` | Módulo 32 - Gestión favoritos | Terminado | TERMINADO | SÍ | Consolidación de FavoriteService. |
| **33** | `33-capa-de-controllers.md` | Módulo 33 - Capa de Controllers | Terminado | TERMINADO | SÍ | Estructura de controladores. |
| **34** | `34-coin-controller.md` | Módulo 34 - CoinController | Terminado | TERMINADO | SÍ | Controlador de monedas. |
| **35** | `35-price-history-controller.md` | Módulo 35 - PriceHistoryController | Terminado | PARCIAL | PARCIAL | Controller captura `CoinGeckoException`, pero service no la lanza. |
| **36** | `36-dependency-container.md` | Módulo 36 - Dependency Container | Terminado | INCONSISTENTE | NO | Doc muestra `coin_service`, código real tiene `coin_serivice`. |
| **37** | `37-fastapi-y-api-rest.md` | Módulo 37 - Introducción a FastAPI | Terminado | TERMINADO | SÍ | Inicio de servidor Uvicorn / FastAPI. |
| **38** | `38-endpoints-de-consulta-de-monedas.md` | Módulo 38 - Endpoints de monedas | Terminado | TERMINADO | SÍ | Endpoints `/coins`. |
| **39** | `39-endpoints-y-operaciones-favoritos.md` | Módulo 39 - Endpoints favoritos | Terminado | PARCIAL | PARCIAL | Endpoints `/favorites` funcionales pero sin Pydantic Body. |
| **40** | `40-integracion-y-validacion-de-la-api.md` | *(Sin encabezado)* | Sin redactar | **VACÍO** | **NO** | **Archivo de 0 bytes. Pendiente de escribir.** |

---

## 5. Detectar numeración incorrecta y anomalías

### Hallazgos del análisis automatizado de nombres vs. títulos internos:

1. **Archivo 24 Inexistente / Prefijo 25 Duplicado**:
   - `docs/25-services-y-logica-de-negocio.md` tiene como título interno `# Módulo 24 - Services y lógica de negocio`.
   - `docs/25-sincronizacion-y-actualizacion.md` tiene como título interno `# Módulo 25 - Sincronización inteligente y actualización de registros`.
   - *Efecto*: No existe el archivo `24-*.md` en disco, provocando un salto directo del 23 al 25 en la lista de archivos.

2. **Archivo 40 Totalmente Vacío**:
   - `docs/40-integracion-y-validacion-de-la-api.md` tiene tamaño `0 bytes` (0 líneas de contenido).

3. **Typos en Nombres de Archivo**:
   - `docs/16-repositiry-pattern.md` (debería ser `repository`).
   - `docs/30-integracioln-favoritos-moneda.md` (debería ser `integracion`).

4. **Inconsistencia de Caracteres en Títulos**:
   - Los módulos 01-28 y 32-39 utilizan el guion estándar: `# Módulo XX - Título`.
   - Los módulos 29, 30 y 31 utilizan el guion en-dash unicode: `# Módulo XX – Título`.

5. **Módulos Duplicados / Evolución del Curso**:
   - Módulo 12 vs. Módulo 17: Ambos titulados `Capa de Servicios`. El 12 define lógica dummy en memoria; el 17 la conecta a Repositorios MySQL.
   - Módulo 13 vs. Módulo 18: Ambos titulados `Diseño de Base de Datos`. El 13 es borrador preliminar; el 18 es el DDL completo.

---

## 6. Analizar el código real

### 6.1 Capa API (`app/api/app.py` & `coingecko_client.py`)
- **Framework**: FastAPI `1.0.0` con Uvicorn.
- **Rutas Implementadas**:
  - `GET /`: Status check (`{"success": True, "message": "Crypto Tracker API funcionando."}`).
  - `GET /coins`: Obtiene la lista completa de monedas registradas en MySQL.
  - `POST /coins/sync`: Ejecuta sincronización de top 10 monedas desde CoinGecko a MySQL.
  - `GET /coins/{coin_id}`: Consulta datos de una moneda específica por ID.
  - `POST /coins/{coin_id}`: Fuerza la actualización de una moneda específica desde CoinGecko.
  - `POST /favorites`: Agrega una moneda a favoritos (recibe `user_id: int`, `coin_id: str` como Query Parameters).
  - `DELETE /favorites/{coin_id}`: Elimina una moneda de favoritos (recibe `user_id: int` por Query Param y `coin_id: str` por Path Param).
  - `GET /favorites`: Obtiene favoritos simples del usuario.
  - `GET /favorites/details`: Obtiene favoritos con INNER JOIN a la tabla `coins`.
- **Cliente HTTP Externe (`CoinGeckoClient`)**:
  - Encapsula `requests.get` con timeout parametrizado (10s por defecto).
  - Métodos `get_market_coins()` y `get_coin(coin_id)`.
  - Captura `Timeout`, `ConnectionError`, `HTTPError` e imprime logs en consola.

### 6.2 Controllers (`app/controllers/`)
- `CoinController`: Intermediario para Coins. Formatea respuestas con `success`, `message` y `data`.
- `FavoriteController`: Intermediario para Favorites.
- `PriceHistoryController`: Intermediario para PriceHistory. Método `update_price(coin_id)`.

### 6.3 Services (`app/services/`)
- `CoinService`: Coordina `CoinRepository` y `CoinGeckoClient`. Invoca `repository.exists()` para decidir entre `save()` y `update()`.
- `FavoriteService`: Valida la existencia del usuario (`user_repository.exists`), existencia de la moneda (`coin_repository.exists`) y duplicados (`favorite_repository.exists`).
- `PriceHistoryService`: Consulta CoinGecko, obtiene `current_price` en USD y guarda en `PriceHistoryRepository`. *Defecto*: Lanza `Exception` en lugar de `CoinGeckoException`.
- `CoinMapper`: Convierte dicts JSON de CoinGecko a objetos `Coin`.

### 6.4 Repositories (`app/repositories/`)
- `CoinRepository`: Implementa `save()`, `update()`, `find_all()`, `find_by_id()`, `exists()`. Utiliza `ON DUPLICATE KEY UPDATE`.
- `FavoriteRepository`: Implementa `save()`, `delete()`, `exists()`, `find_all_by_user()`, `find_all_with_coin_data()`.
- `PriceHistoryRepository`: Implementa `save()`, `find_by_coin()`.
- `UserRepository`: Implementa `save()`, `find_all()`, `find_by_id()`, `exists()`.

### 6.5 Models (`app/models/`)
- `Coin(id, symbol, name, market_cap_rank)`
- `Favorite(user_id, coin_id)`
- `PriceHistory(id, coin_id, price, recorded_at)`
- `User(id, username, email, password_hash, created_at)`

---

## 7. Analizar tests

Matriz de auditoría de los 18 archivos ubicados en `app/tests/`:

| Test | Tipo | Ejecutable vía `unittest` | Requiere BD Real | Estado | Qué prueba / Comentario |
| :--- | :--- | :---: | :---: | :---: | :--- |
| `api_tests.py` | UNITARIO (MOCK) | **SÍ** | NO | **PASS** (2/2) | Mockea `requests.get` para `CoinGeckoClient`. |
| `database_test.py` | UNITARIO (MOCK) | **SÍ** | NO | **PASS** (1/1) | Mockea `mysql.connector.connect` para `get_connection()`. |
| `service_test.py` | UNITARIO (MOCK) | **SÍ** | NO | **ROTO** (1 fail) | **Falla con `AttributeError`**: `FakeRepository` no tiene método `exists()`. |
| `repository_test.py` | UNITARIO (MOCK) | NO | NO | **OMITIDO** | Pruebas unitarias de `CoinRepository` **totalmente comentadas (`#`)**. |
| `coin_controller_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | MANUAL | Script con `main()` que llama a `CoinController` contra MySQL real. |
| `coingecko_market_test.py` | MANUAL / HTTP | NO | NO (CoinGecko) | MANUAL | Script con `main()` que prueba la API pública de CoinGecko. |
| `delete_favorite_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | MANUAL | Script manual que crea y elimina un favorito en MySQL real. |
| `favorite_controller_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | MANUAL | Script manual para `FavoriteController.add_favorite`. |
| `favorite_service_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | MANUAL | Script manual para `FavoriteService.add_favorite`. |
| `favorite_with_coin_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | **ROTO** | **Falla con `TypeError`**: Firma desactualizada (`FavoriteService` pide 3 repos). |
| `get_favorites_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | **ROTO** | **Falla con `TypeError`**: Firma desactualizada (`FavoriteService` pide 3 repos). |
| `model_test.py` | MANUAL / UNITARIO | NO | NO | MANUAL | Script manual que instancia y realiza `print(Coin)`. |
| `models_tests.py` | MANUAL / UNITARIO | NO | NO | MANUAL | Script manual que instancia `User`, `Favorite` y `PriceHistory`. |
| `price_history_controller_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | MANUAL | Script manual para `PriceHistoryController.update_price`. |
| `price_history_service_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | MANUAL | Script manual para `PriceHistoryService.update_price`. |
| `read_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | MANUAL | Script manual que consulta `CoinRepository.find_all()`. |
| `sync_coins_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | MANUAL | Script manual que ejecuta `CoinService.sync_coins()`. |
| `user_read_test.py` | MANUAL / INTEGRACIÓN | NO | SÍ | MANUAL | Script manual para `UserRepository.find_all()`. |

### Resultado de la ejecución automatizada de tests:
```powershell
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*test*.py"
```
```text
Ran 5 tests in 0.003s
FAILED (errors=1) -> test_update_coin_maps_and_saves_coin (service_test.CoinServiceTest)
AttributeError: 'FakeRepository' object has no attribute 'exists'
```

---

## 8. Analizar dependencias

Filtro de dependencias declaradas en `requirements.txt` vs. uso real en el código:

| Dependencia | En `requirements.txt` | Utilizada en Código | Propósito Principal | Observación |
| :--- | :---: | :---: | :--- | :--- |
| `fastapi` | SÍ (`0.141.1`) | SÍ | Framework Web API REST | Importado en `app/api/app.py`. |
| `uvicorn` | SÍ (`0.52.1`) | SÍ | Servidor ASGI HTTP | Requerido para desplegar `app.api.app:app`. |
| `requests` | SÍ (`2.34.2`) | SÍ | Cliente HTTP sincrónico | Importado en `app/api/coingecko_client.py`. |
| `mysql-connector-python` | SÍ (`26.7.0`) | SÍ | Conector oficial MySQL | Importado en `app/database/connection.py`. |
| `python-dotenv` | SÍ (`1.2.2`) | SÍ | Carga de archivo `.env` | Importado en `app/config/settings.py`. |
| `pydantic` | SÍ (`2.13.4`) | SÍ (Vía FastAPI) | Validación de esquemas | Declarada. Puede usarse para DTOs explicitos. |
| `starlette` | SÍ (`1.6.0`) | SÍ (Transitiva) | Núcleo de FastAPI | Requerida por FastAPI. |
| `rich` | SÍ (`15.0.0`) | **NO** | Formateo de consola | Declarada en `requirements.txt` pero no importada. |
| `markdown-it-py` | SÍ (`4.2.0`) | **NO** | Parser Markdown | Dependencia no utilizada en backend. |
| `Pygments` | SÍ (`2.20.0`) | **NO** | Resaltador de sintaxis | Dependencia no utilizada en backend. |
| `httpx` | SÍ (`0.28.1`) | **NO** | Cliente HTTP Async / TestClient | No utilizada actualmente en tests. |

---

## 9. Analizar configuración

Configuración analizada en `.env` y `app/config/settings.py`:

```ini
COINGECKO_BASE_URL=https://api.coingecko.com/api/v3
REQUEST_TIMEOUT=10

MYSQL_HOST=localhost
MYSQL_PORT=3306
MYSQL_USER=root
MYSQL_PASSWORD=[REDACTED]
MYSQL_DATABASE=crypto_tracker
```

### Hallazgos de Configuración y Seguridad:
1. **Credenciales en texto plano**: `.env` contiene credenciales locales reales. Está correctamente ignorado en `.gitignore`.
2. **Hardcoding de valores por defecto**: `settings.py` utiliza valores de respaldo apropiados (`REQUEST_TIMEOUT=10`, `MYSQL_PORT=3306`).
3. **Manejo de variables**: `settings.py` instancia las variables en un objeto Singleton global `settings`.

---

## 10. Analizar la base de datos

Modelo relacional reconstruido a partir del código Python, repositorios e instrucciones SQL del proyecto:

```text
  ┌─────────────────────────────────┐           ┌─────────────────────────────────┐
  │              users              │           │              coins              │
  ├─────────────────────────────────┤           ├─────────────────────────────────┤
  │ PK  id            INT (AUTO)    │           │ PK  id            VARCHAR(50)   │
  │     username      VARCHAR(50)   │           │     symbol        VARCHAR(20)   │
  │     email         VARCHAR(100)  │           │     name          VARCHAR(100)  │
  │     password_hash VARCHAR(255)  │           │     market_cap_rank INT NULL    │
  │     created_at    DATETIME      │           └────────────────┬────────────────┘
  └────────────────┬────────────────┘                            │
                   │                                             │
                   │           ┌─────────────────────┐           │
                   └──────────►│      favorites      │◄──────────┘
                               ├─────────────────────┤
                               │ PK, FK1  user_id INT│
                               │ PK, FK2  coin_id VARCHAR(50)
                               └─────────────────────┘
                                         │
                                         ▼
                               ┌─────────────────────────────────┐
                               │          price_history          │
                               ├─────────────────────────────────┤
                               │ PK  id          INT (AUTO)      │
                               │ FK  coin_id     VARCHAR(50)     │
                               │     price       DECIMAL(18,8)   │
                               │     recorded_at DATETIME        │
                               └─────────────────────────────────┘
```

### Definición técnica de tablas:

1. **`users`**:
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `username`: VARCHAR(50) NOT NULL
   - `email`: VARCHAR(100) NOT NULL UNIQUE
   - `password_hash`: VARCHAR(255) NOT NULL
   - `created_at`: DATETIME NOT NULL

2. **`coins`**:
   - `id`: VARCHAR(50) PRIMARY KEY (ej. 'bitcoin', 'ethereum')
   - `symbol`: VARCHAR(20) NOT NULL
   - `name`: VARCHAR(100) NOT NULL
   - `market_cap_rank`: INT NULL

3. **`favorites`**:
   - `user_id`: INT NOT NULL (FK -> `users.id`)
   - `coin_id`: VARCHAR(50) NOT NULL (FK -> `coins.id`)
   - Composite PRIMARY KEY `(user_id, coin_id)`

4. **`price_history`**:
   - `id`: INT AUTO_INCREMENT PRIMARY KEY
   - `coin_id`: VARCHAR(50) NOT NULL (FK -> `coins.id`)
   - `price`: DECIMAL(18,8) NOT NULL
   - `recorded_at`: DATETIME NOT NULL

---

## 11. Mapa funcional actual

| Funcionalidad | Implementada | Testeada | API REST | BD MySQL | Estado |
| :--- | :---: | :---: | :---: | :---: | :---: |
| Consultar todas las monedas | SÍ | Manual | SÍ (`GET /coins`) | SÍ | **OK** |
| Consultar moneda por ID | SÍ | Manual | SÍ (`GET /coins/{coin_id}`) | SÍ | **OK** |
| Sincronizar moneda por ID | SÍ | Manual | SÍ (`POST /coins/{coin_id}`) | SÍ | **OK** |
| Sincronizar top 10 monedas (markets) | SÍ | Manual | SÍ (`POST /coins/sync`) | SÍ | **OK** |
| Agregar favorito de usuario | SÍ | Manual | SÍ (`POST /favorites`) | SÍ | **OK** *(Falta Pydantic Body)* |
| Eliminar favorito de usuario | SÍ | Manual | SÍ (`DELETE /favorites/{coin_id}`) | SÍ | **OK** |
| Consultar favoritos de usuario | SÍ | Manual | SÍ (`GET /favorites`) | SÍ | **OK** |
| Consultar favoritos con datos de moneda | SÍ | Manual | SÍ (`GET /favorites/details`) | SÍ | **OK** |
| Registrar historial de precio | SÍ | Manual | **NO** | SÍ | **PARCIAL** *(Falta endpoint en FastAPI)* |
| Consultar historial de precios | SÍ (Repo) | Manual | **NO** | SÍ | **PARCIAL** *(Falta endpoint en FastAPI)* |
| Gestión / Lectura de Usuarios | SÍ (Repo) | Manual | **NO** | SÍ | **PARCIAL** *(Falta endpoint en FastAPI)* |
| Autenticación y Seguridad JWT | NO | NO | NO | NO | **PENDIENTE** |

---

## 12. Mapa de arquitectura

### Arquitectura lógica actual vs. Responsabilidades:

```text
[Cliente HTTP / Swagger UI]
          │
          ▼
┌──────────────────────────────────┐
│ FastAPI Router (app/api/app.py)  │  <-- Entrada HTTP (Parses path & query parameters)
└─────────────────┬────────────────┘
                  │
                  ▼
┌──────────────────────────────────┐
│ Container (app/container.py)     │  <-- Inyección de Dependencias
└─────────────────┬────────────────┘
                  │
                  ▼
┌──────────────────────────────────┐
│ Controllers (app/controllers/*)  │  <-- Formateo de respuesta JSON (success/message/data)
└─────────────────┬────────────────┘
                  │
                  ▼
┌──────────────────────────────────┐
│ Services (app/services/*)        │  <-- Lógica de negocio, mapeos y validaciones
└────────┬────────────────┬────────┘
         │                │
         ▼                ▼
┌─────────────────┐  ┌──────────────────────────────────┐
│ CoinGeckoClient │  │ Repositories (app/repositories/*)│ <-- Consultas SQL parametrizadas
└────────┬────────┘  └────────────────┬─────────────────┘
         │                            │
         ▼                            ▼
┌─────────────────┐  ┌──────────────────────────────────┐
│ CoinGecko API   │  │ MySQL Database                   │
└─────────────────┘  └──────────────────────────────────┘
```

---

## 13. Problemas encontrados

### 13.1 CRÍTICOS (Afectan ejecución o suites de prueba)

```text
ID: BUG-CRIT-01
Archivo: app/container.py (Línea 26)
Problema: Typo en la propiedad `self.coin_serivice` (escrito 'serivice').
Causa: Error de tipeo durante la instanciación de CoinService.
Impacto: Confusión en mantenibilidad y riesgo de AttributeError si se invoca `container.coin_service`.
Solución recomendada: Renombrar `self.coin_serivice` a `self.coin_service` en container.py (y su paso a CoinController en L36).
¿Bloquea el siguiente módulo?: No bloquea la ejecución actual porque CoinController recibe la propiedad con el typo, pero debe corregirse inmediatamente.

ID: BUG-CRIT-02
Archivo: app/services/price_history_service.py (L17) vs app/controllers/price_history_controller.py (L20)
Problema: Manejo de excepciones desacoplado. PriceHistoryService lanza `raise Exception(...)` genérica, pero PriceHistoryController sólo captura `except CoinGeckoException`.
Causa: No se importó ni utilizó CoinGeckoException en el servicio de historial de precios.
Impacto: Si la API de CoinGecko falla al actualizar el precio, la excepción no es capturada por el controlador y genera un HTTP 500 no controlado.
Solución recomendada: Importar `CoinGeckoException` en `price_history_service.py` y lanzarla en lugar de `Exception`.
¿Bloquea el siguiente módulo?: SÍ. Debe corregirse antes de exponer el endpoint en FastAPI.

ID: BUG-CRIT-03
Archivo: app/tests/service_test.py (L38)
Problema: El unit test `test_update_coin_maps_and_saves_coin` falla con AttributeError: 'FakeRepository' object has no attribute 'exists'.
Causa: CoinService.update_coin() fue actualizado para requerir `self.repository.exists()`, pero el mock FakeRepository en el test no implementa ese método.
Impacto: Rompe la suite de pruebas automatizadas con `unittest discover`.
Solución recomendada: Agregar el método `exists(self, coin_id)` a la clase FakeRepository en `service_test.py`.
¿Bloquea el siguiente módulo?: No bloquea la aplicación en producción, pero rompe la CI/CD y los tests unitarios.

ID: BUG-CRIT-04
Archivo: app/tests/favorite_with_coin_test.py (L10) y app/tests/get_favorites_test.py (L10)
Problema: Error de firma `TypeError` al instanciar `FavoriteService(repository)`.
Causa: FavoriteService evolucionó para requerir 3 repositorios, pero estos dos scripts de test no fueron actualizados.
Impacto: Los tests fallan inmediatamente al ser ejecutados.
Solución recomendada: Actualizar las instancias en los scripts de prueba.
¿Bloquea el siguiente módulo?: No.
```

### 13.2 IMPORTANTES (Deuda técnica y brechas en API)

```text
ID: BUG-IMP-01
Archivo: app/api/app.py
Problema: Endpoints de Historial de Precios NO expuestos en FastAPI.
Causa: Omisión en el Módulo 39.
Impacto: La funcionalidad de historial de precios no es accesible vía HTTP.
Solución recomendada: Agregar las rutas POST y GET `/price-history/{coin_id}` en app/api/app.py.
¿Bloquea el siguiente módulo?: Es el objetivo del Módulo 40.

ID: BUG-IMP-02
Archivo: docs/40-integracion-y-validacion-de-la-api.md
Problema: Archivo de documentación con 0 bytes.
Causa: Creado como placeholder sin redactar.
Impacto: Incompletitud en la documentación del curso.
Solución recomendada: Redactar el Módulo 40 aplicando el nuevo estándar oficial.
¿Bloquea el siguiente módulo?: SÍ, para cerrar el bloque del 01 al 40.

ID: BUG-IMP-03
Archivo: app/api/app.py (L59-L63)
Problema: `POST /favorites` recibe parámetros por Query string (`?user_id=1&coin_id=bitcoin`) en lugar de Request Body Pydantic.
Causa: Implementación básica sin esquemas DTO.
Impacto: Mala práctica REST en endpoints POST.
Solución recomendada: Definir clase Pydantic `FavoriteCreate` y recibirla en el body del POST.
¿Bloquea el siguiente módulo?: No.
```

### 13.3 MENORES (Limpieza y organización)

```text
ID: BUG-MEN-01
Archivo: docs/25-services-y-logica-de-negocio.md
Problema: Nombre de archivo con prefijo `25-`, pero título interno `# Módulo 24`.
Solución recomendada: Renombrar archivo a `24-services-y-logica-de-negocio.md`.

ID: BUG-MEN-02
Archivo: docs/16-repositiry-pattern.md y docs/30-integracioln-favoritos-moneda.md
Problema: Errores de ortografía en nombres de archivo (`repositiry` e `integracioln`).
Solución recomendada: Renombrar archivos a nombres correctos en español.

ID: BUG-MEN-03
Archivo: CHANGELOG.md
Problema: Archivo totalmente en blanco.
Solución recomendada: Documentar los cambios principales del proyecto.
```

---

## 14. Código adelantado respecto al curso

| Funcionalidad | Código Implementado | Módulo Documentado | Situación Actual |
| :--- | :--- | :--- | :--- |
| Contenedor de Dependencias | `app/container.py` | Módulo 36 | Implementado y documentado (con typo en código). |
| Servidor FastAPI y Router | `app/api/app.py` | Módulos 37, 38, 39 | Implementado y documentado parcialmente. |
| Integración y Validación General API | `app/api/app.py` | Módulo 40 | **Código adelantado / Doc pendiente** (`40-*.md` está en 0 bytes). |

---

## 15. Código que ya NO debería tocarse

Los siguientes componentes alcanzaron su madurez técnica y **NO deben volver a modificarse o reescribirse** en lecciones futuras:

1. **`CoinGeckoClient` (`app/api/coingecko_client.py`)**: Cliente HTTP robusto y aislado.
2. **`CoinRepository` (`app/repositories/coin_repository.py`)**: Métodos Upsert y SELECT consolidados.
3. **`FavoriteRepository` (`app/repositories/favorite_repository.py`)**: Persistencia y JOINs relacionales estables.
4. **`PriceHistoryRepository` (`app/repositories/price_history_repository.py`)**: Inserción y consulta temporal correcta.
5. **`UserRepository` (`app/repositories/user_repository.py`)**: Métodos CRUD de usuario funcionales.
6. **`CoinService` (`app/services/coin_service.py`)**: Lógica de sincronización y mapeo probada.
7. **`FavoriteService` (`app/services/favorite_service.py`)**: Reglas de negocio y validación cruzada entre 3 repositorios congeladas.
8. **Entidades de Dominio (`app/models/*.py`)**: Modelos `Coin`, `Favorite`, `PriceHistory`, `User`.

---

## 16. Próximo módulo recomendado

### Módulo 40 (Completar / Redactar)
- **Título**: "Endpoints de Historial de Precios y Validación Integral de la API REST"
- **Objetivo**: Redactar y completar el Módulo 40 (actualmente en 0 bytes), exponiendo los endpoints HTTP para Historial de Precios y corrigiendo los bugs críticos identificados.
- **Por qué corresponde ahora**:
  1. El archivo `docs/40-integracion-y-validacion-de-la-api.md` existe en disco pero está en blanco (0 bytes).
  2. `PriceHistoryController` y `PriceHistoryService` ya están creados en código pero carecen de rutas HTTP en `app/api/app.py`.
  3. `PriceHistoryService` requiere corregir el tipo de excepción lanzada (`CoinGeckoException`).
  4. `container.py` requiere corregir el typo de propiedad `coin_serivice`.
- **Qué problema resuelve**: Cierra el ciclo de la API REST completando el 100% de los endpoints de la aplicación y garantizando la coherencia entre documentación y código.
- **Qué archivos debería crear**:
  - `docs/40-integracion-y-validacion-de-la-api.md` (redacción oficial completa).
- **Qué archivos debería modificar**:
  - `app/api/app.py` (agregar endpoints POST/GET `/price-history/{coin_id}`).
  - `app/services/price_history_service.py` (cambiar `raise Exception` por `raise CoinGeckoException`).
  - `app/container.py` (corregir typo `coin_serivice` -> `coin_service`).
  - `app/tests/service_test.py` (agregar `exists` al mock `FakeRepository`).
- **Qué archivos NO debería tocar**:
  - `CoinGeckoClient`, `CoinRepository`, `FavoriteRepository`, `UserRepository`, `CoinService`, `FavoriteService`, `models/*.py`.
- **Qué conceptos enseña**: Exposición de series temporales en REST, manejo uniforme de excepciones HTTP en FastAPI y validación integral E2E.

---

## 17. Estándar definitivo para archivos `.md` de lecciones

Para garantizar consistencia técnica y profesional en la documentación del proyecto `Crypto Tracker`, todo archivo `.md` dentro de `docs/` deberá ceñirse estrictamente a la siguiente estructura estandarizada de 15 secciones:

### Reglas de Formato:
1. **Nombre de Archivo**: `XX-nombre-del-modulo.md` (en minúsculas, separado por guiones cortos `-`).
2. **Encabezado Principal**: `# Módulo XX - [Título del Módulo]` (utilizando guion corto `-`).
3. **Bloque Metadata**: Un bloque tipo quote con `Estado`, `Proyecto`, `Capa`, `Fecha`.
4. **Respuesta a preguntas clave**: Cada `.md` debe permitir responder claramente:
   - ¿Qué problema resuelve este módulo?
   - ¿Qué conceptos enseña?
   - ¿Qué archivos se crearon o modificaron y por qué?
   - ¿Cómo funciona el código y cómo se prueba?
   - ¿Qué componentes quedan congelados y no deben modificarse en el futuro?

---

## 18. Plantilla oficial para futuros módulos

```markdown
# Módulo XX - [Título Oficial del Módulo]

> **Estado**: TERMINADO / PARCIAL / EN PROCESO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: [API / Controller / Service / Repository / Database / Config]
> **Fecha**: AAAA-MM-DD

---

## 1. Objetivo

[Descripción técnica clara del objetivo principal del módulo y qué problema específico resuelve.]

## 2. Conceptos Aprendidos

- **[Concepto 1]**: [Explicación breve]
- **[Concepto 2]**: [Explicación breve]

## 3. Arquitectura y Flujo de Datos

```text
[Diagrama ASCII o de secuencia del flujo de ejecución entre capas]
```

## 4. Estructura de Archivos

- `[NEW]` `app/path/al/nuevo_archivo.py`
- `[MODIFY]` `app/path/al/archivo_modificado.py`

## 5. Implementación Detallada

### 5.1 [Nombre del Componente o Cambio A]
[Explicación del diseño e implementación.]

### 5.2 [Nombre del Componente o Cambio B]
[Explicación del diseño e implementación.]

## 6. Código Relevante

```python
# Extracto de código representativo del módulo con comentarios
```

## 7. Integración con Módulos Anteriores

[Explicación de cómo este módulo se conecta con los componentes desarrollados previamente.]

## 8. Pruebas y Verificación

### Pruebas Automatizadas
- **Comando**: `...`
- **Resultado esperado**: `...`

### Pruebas Manuales / Peticiones HTTP
- **Endpoint**: `POST /ejemplo`
- **Respuesta esperada**: `{"success": true, ...}`

## 9. Errores Encontrados y Soluciones

| Error Detectado | Causa Raíz | Solución Aplicada |
| :--- | :--- | :--- |
| [Descripción del error] | [Razón técnica] | [Fix implementado] |

## 10. Decisiones Técnicas y de Diseño

- **[Decisión 1]**: [Justificación técnica]
- **[Decisión 2]**: [Justificación técnica]

## 11. Estado Final

- [x] Código implementado y sin errores de sintaxis.
- [x] Inyección de dependencias configurada.
- [x] Pruebas ejecutadas correctamente.

## 12. Componentes que NO deben modificarse posteriormente

> [!IMPORTANT]
> Los siguientes módulos/archivos quedan congelados a partir de este módulo:
> - `app/.../archivo.py`: [Razón de congelación]

## 13. Checklist de Validación

- [x] Cumple con el estándar de arquitectura en capas.
- [x] Sin credenciales hardcodeadas.
- [x] Manejo explícito de excepciones.

## 14. Próximo Módulo

- **Módulo**: XX+1
- **Título**: [Título del siguiente módulo]
- **Objetivo**: [Breve resumen]
```

---

## 19. Modelo completo de documentación (Ejemplo Módulo 36)

Demostración práctica de cómo aplicar la plantilla oficial al **Módulo 36 - Dependency Container**:

````markdown
# Módulo 36 - Dependency Container

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Inyección de Dependencias / Core
> **Fecha**: 2026-08-08

---

## 1. Objetivo

Centralizar y gestionar la instanciación de componentes (Repositories, Services, Controllers y Clientes HTTP) en un contenedor único de dependencias (`Container`), aplicando el patrón **Dependency Injection (DI)** para desacoplar el punto de entrada `main.py` y la capa web FastAPI de la creación directa de objetos.

## 2. Conceptos Aprendidos

- **Inyección de Dependencias (DI)**: Patrón donde los objetos reciben sus dependencias desde el exterior en lugar de crearlas internamente con `new` o instanciación directa.
- **Dependency Container**: Objeto centralizador responsable de construir el árbol completo de dependencias de la aplicación.
- **Desacoplamiento del Main**: Reducción de la responsabilidad de `main.py`, que ahora solo requiere instanciar el contenedor.

## 3. Arquitectura y Flujo de Datos

```text
               ┌─────────────────────────────────────────┐
               │                Container                │
               └────┬──────────────┬──────────────┬──────┘
                    │              │              │
                    ▼              ▼              ▼
           ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
           │ Repositories │ │  API Client  │ │   Services   │
           └───────┬──────┘ └──────┬───────┘ └──────┬───────┘
                   │               │                │
                   └───────┬───────┘                │
                           ▼                        ▼
                  ┌─────────────────┐      ┌─────────────────┐
                  │    Services     │      │   Controllers   │
                  └────────┬────────┘      └─────────────────┘
                           │
                           ▼
                  ┌─────────────────┐
                  │   Controllers   │
                  └─────────────────┘
```

## 4. Estructura de Archivos

- `[NEW]` [app/container.py](file:///c:/Users/mateo/Projects/crypto_tracker/backend/app/container.py)
- `[MODIFY]` [app/main.py](file:///c:/Users/mateo/Projects/crypto_tracker/backend/app/main.py)

## 5. Implementación Detallada

### 5.1 Creación de la clase Container (`app/container.py`)
Se define la clase `Container` cuyo método `__init__` se encarga de:
1. Instanciar el cliente de API externa `CoinGeckoClient`.
2. Instanciar los cuatro repositorios relacionales: `CoinRepository`, `UserRepository`, `FavoriteRepository` y `PriceHistoryRepository`.
3. Instanciar los tres servicios inyectándoles sus repositorios y clientes dependientes.
4. Instanciar los tres controladores inyectándoles sus respectivos servicios.

### 5.2 Refactorización de `main.py`
Se elimina la creación manual de `CoinService` y `CoinRepository`, reemplazándola por una instancia limpia de `Container()`.

## 6. Código Relevante

```python
from app.api.coingecko_client import CoinGeckoClient
from app.controllers.coin_controller import CoinController
from app.controllers.favorite_controller import FavoriteController
from app.controllers.price_history_controller import PriceHistoryController
from app.repositories.coin_repository import CoinRepository
from app.repositories.favorite_repository import FavoriteRepository
from app.repositories.price_history_repository import PriceHistoryRepository
from app.repositories.user_repository import UserRepository
from app.services.coin_service import CoinService
from app.services.favorite_service import FavoriteService
from app.services.price_history_service import PriceHistoryService


class Container:

    def __init__(self):
        # 1. API CLIENT
        self.api_client = CoinGeckoClient()

        # 2. REPOSITORIES
        self.coin_repository = CoinRepository()
        self.user_repository = UserRepository()
        self.favorite_repository = FavoriteRepository()
        self.price_history_repository = PriceHistoryRepository()

        # 3. SERVICES
        self.coin_service = CoinService(self.coin_repository, self.api_client)
        self.favorite_service = FavoriteService(
            self.favorite_repository, self.user_repository, self.coin_repository
        )
        self.price_history_service = PriceHistoryService(
            self.price_history_repository, self.api_client
        )

        # 4. CONTROLLERS
        self.coin_controller = CoinController(self.coin_service)
        self.favorite_controller = FavoriteController(self.favorite_service)
        self.price_history_controller = PriceHistoryController(
            self.price_history_service
        )
```

## 7. Integración con Módulos Anteriores

El contenedor utiliza los componentes desarrollados desde el Módulo 09 hasta el Módulo 35, conectando la capa de infraestructura (API Client y Repositorios MySQL) con la capa de aplicación (Services) y la capa de presentación (Controllers).

## 8. Pruebas y Verificación

### Pruebas de Ejecución Manual
- **Comando**:
  ```powershell
  .venv\Scripts\python.exe -m app.main
  ```
- **Resultado obtenido**:
  ```text
  {'success': True, 'message': 'Moneda sincronizada correctamente.', 'data': <app.models.coin.Coin object at 0x...>}
  ```

## 9. Errores Encontrados y Soluciones

| Error Detectado | Causa Raíz | Solución Aplicada |
| :--- | :--- | :--- |
| `AttributeError` o confusión en el atributo de servicio | Se introdujo un typo en el nombre de la propiedad: `self.coin_serivice`. | Corregir la propiedad a `self.coin_service` tanto en su asignación como en la inyección a `CoinController`. |

## 10. Decisiones Técnicas y de Diseño

- **Construcción ansiosa (Eager Initialization)**: Todas las dependencias se instancian en el `__init__` del contenedor para fallar rápido en tiempo de arranque si alguna dependencia falta o falla la conexión.

## 11. Estado Final

- [x] Contenedor de dependencias implementado e inyectado.
- [x] `main.py` refactorizado.
- [x] Sincronización verificada.

## 12. Componentes que NO deben modificarse posteriormente

> [!IMPORTANT]
> La estructura del árbol de inyección en `Container` queda congelada para las clases `CoinService`, `FavoriteService` y `PriceHistoryService`.

## 13. Checklist de Validación

- [x] Cumple con el patrón Inyección de Dependencias.
- [x] Permite reutilización en FastAPI.

## 14. Próximo Módulo

- **Módulo**: 37
- **Título**: Introducción a FastAPI y API REST
- **Objetivo**: Conectar el contenedor de dependencias con un servidor web FastAPI para exponer los controladores mediante rutas HTTP.
````

---

## 20. Checklist para validar futuros módulos

Criterios obligatorios de aceptación que todo nuevo módulo `.md` y su código asociado deben superar antes de considerarse **TERMINADO**:

- [ ] **Nombre de archivo estandarizado**: Sigue el formato `XX-nombre-del-modulo.md`.
- [ ] **Título e Identificador consistente**: El encabezado interno `# Módulo XX` coincide exactamente con el número del archivo.
- [ ] **Estructura completa de 14 secciones**: Contiene todas las secciones de la plantilla oficial sin omitir ninguna.
- [ ] **Sintaxis de Código limpia**: El código de Python en `app/` no contiene errores de sintaxis y pasa la verificación de ejecución.
- [ ] **Sin Hardcoding**: No se incluyen contraseñas, URLs ni credenciales fijadas en el código. Se utiliza `settings`.
- [ ] **Inyección de Dependencias respetada**: Los nuevos componentes reciben sus dependencias por constructor y se registran en `app/container.py`.
- [ ] **Manejo de Excepciones coherente**: Los servicios lanzan excepciones del dominio (`CoinGeckoException`, `ApiException`) y los controladores las capturan adecuadamente.
- [ ] **Pruebas Automatizadas en `unittest`**: Los tests nuevos heredan de `unittest.TestCase`, utilizan Mocks/Fakes aislados y no dependen de la base de datos real.
- [ ] **API REST documentada en OpenAPI**: Los endpoints de FastAPI disponen de tipos explícitos y aparecen correctamente estructurados en Swagger (`/docs`).
- [ ] **Congelamiento de Componentes Maduros**: No se modifican repositorios ni servicios dados por concluidos en módulos anteriores.

---

## 21. Recomendación sobre la documentación existente y conclusión

### Recomendación Estratégica: Opción D (Mantener documentación histórica lección por lección + Crear especificación consolidada actual)

#### Fundamentación:
1. **Preservación del Valor Pedagógico**: Los archivos del 01 al 39 representan el registro secuencial del aprendizaje del curso. Reescribir los archivos antiguos destruiría la trazabilidad pedagógica del progreso.
2. **Correcciones Menores Permitidas**: Se recomienda aplicar únicamente correcciones materiales en la documentación existente que no alteren el contenido educativo:
   - Renombrar `docs/25-services-y-logica-de-negocio.md` a `docs/24-services-y-logica-de-negocio.md`.
   - Corregir los typos de nombre en `docs/16-repositiry-pattern.md` y `docs/30-integracioln-favoritos-moneda.md`.
   - Redactar de cero el archivo `docs/40-integracion-y-validacion-de-la-api.md` con el estándar oficial de 14 secciones.
3. **Corrección de Bugs en Código**: Corregir de inmediato en el código los 4 bugs críticos identificados (typo `coin_serivice` en `container.py`, excepción genérica en `price_history_service.py`, `exists()` en `FakeRepository` y firmas desactualizadas en los tests de favoritos).

### Conclusión Final
El proyecto **Crypto Tracker** cuenta con una base arquitectónica sólida y limpia en capas (API → Controller → Service → Repository → Database). Con la aplicación de las correcciones puntuales identificadas en este relevamiento y la adopción del estándar oficial de documentación redactado en este informe, el proyecto queda en un estado técnico óptimo para completar el Módulo 40 y continuar escalando con futuras funcionalidades.

# Relevamiento del proyecto Crypto Tracker

> Generado: 2026-08-08
> Alcance: backend/
> Fuente de verdad: documentacion + codigo + tests + arquitectura + base de datos

---

## 1. Resumen ejecutivo

El proyecto **Crypto Tracker** es un backend Python estructurado en capas (API -> Service -> Repository -> Database).
Permite consultar criptomonedas desde CoinGecko y persistirlas en MySQL junto con historial de precios y favoritos de usuario.

El modulo mas alto documentado es el **32**. El modulo mas alto realmente implementado en codigo es el **32**.
Sin embargo, existen inconsistencias entre la firma del FavoriteService documentada en modulos anteriores (27-30) y el estado final del codigo.

El proyecto **no tiene capa de controllers** implementada. La carpeta app/controllers/ existe pero esta vacia.
El main.py es el unico punto de entrada y solo ejecuta una sincronizacion hardcodeada de 'bitcoin'.

---

## 2. Estructura actual del proyecto

```
backend/
  .env                    <- Variables de entorno (contiene password real)
  .gitignore
  .drawio                 <- Diagrama de entidades
  CHANGELOG.md            <- Vacio
  README.md
  requirements.txt
  docs/                   <- 32 archivos .md de modulos del curso
  app/
    __init__.py
    main.py
    utils.py
    api/
      coingecko_client.py
    config/
      settings.py
    controllers/
      __init__.py         <- VACIO - sin implementacion
    database/
      connection.py
    exceptions/
      api_exception.py
    models/
      coin.py
      favorite.py
      price_history.py
      user.py
    repositories/
      coin_repository.py
      favorite_repository.py
      price_history_repository.py
      user_repository.py
    services/
      coin_mapper.py
      coin_service.py
      coingecko_service.py
      favorite_service.py
      price_history_service.py
    tests/
      api_tests.py
      database_test.py
      delete_favorite_test.py
      favorite_service_test.py
      favorite_with_coin_test.py
      get_favorites_test.py
      model_test.py
      models_tests.py
      price_history_service_test.py
      read_test.py
      repository_test.py
      service_test.py
      user_read_test.py
```

**Observaciones estructurales:**

- controllers/ existe pero no tiene implementacion alguna.
- utils.py contiene solo mostrar_titulo() con codigo comentado; no es utilizada en ningun modulo activo.
- coingecko_service.py es una clase vacia que hereda de CoinGeckoClient por compatibilidad con material anterior del curso.
- coin_mapper.py esta en services/ aunque su responsabilidad es de transformacion de datos.

---

## 3. Arquitectura

**Arquitectura actual: OK (con observaciones menores)**

El codigo respeta la separacion de capas. Los services no ejecutan SQL directamente.
Los repositories no contienen logica de negocio.

| Item | Descripcion | Severidad |
|------|-------------|-----------|
| controllers/ vacio | Carpeta sin implementacion | MENOR (esperado en este punto del curso) |
| coin_mapper.py en services/ | El mapper podria tener su propio paquete | MENOR |
| coingecko_service.py es stub | Clase vacia solo por compatibilidad | MENOR |
| No hay HTTP layer | No existe FastAPI, Flask ni REST | Esperado en este punto |

---

## 4. Modulos del curso

> Nota: existe 25-services-y-logica-de-negocio.md y 25-sincronizacion-y-actualizacion.md.
> Ambos tienen el numero 25. El primero tiene en su encabezado interno 'Modulo 24'.

| Modulo | Titulo | Estado | Evidencia | Observaciones |
|--------|--------|--------|-----------|---------------|
| 01 | Entorno | TERMINADO | .venv presente | Configuracion inicial Python |
| 02 | Preparacion del proyecto | TERMINADO | Estructura app/ creada | Paquetes con __init__.py |
| 03 | Main y punto de entrada | TERMINADO | app/main.py existe | Entry point funcional |
| 04 | Modulos y paquetes | TERMINADO | Todos los __init__.py | Concepto aplicado en toda la arquitectura |
| 05 | Tipos de datos y funciones | TERMINADO | utils.py con funcion | mostrar_titulo() sin uso activo |
| 06 | Manejo de errores | TERMINADO | exceptions/api_exception.py | ApiException y CoinGeckoException |
| 07 | POO | TERMINADO | Todas las clases siguen OOP | Modelos, Services, Repositories como clases |
| 08 | Arquitectura del proyecto | TERMINADO | Estructura de capas presente | Carpetas conforme al diseno |
| 09 | Consumir API CoinGecko | TERMINADO | api/coingecko_client.py | CoinGeckoClient con get_coin() y get_market_coins() |
| 10 | Obtener criptomonedas | TERMINADO | get_market_coins() | Metodo con paginacion y parametros |
| 11 | Configuracion y errores | TERMINADO | config/settings.py | Variables de entorno, timeout, HTTP errors |
| 12 | Capa de servicios (v1) | TERMINADO | coin_service.py evolucionado | Concepto introducido; codigo mejorado despues |
| 13 | Diseno de base de datos | TERMINADO | .drawio presente | 4 entidades: users, coins, favorites, price_history |
| 14 | MySQL desde cero | NO VERIFICADO | Sin SQL DDL en el repo | SQL ejecutado en MySQL Workbench externo |
| 15 | Conectar Python con MySQL | TERMINADO | database/connection.py | get_connection() con mysql.connector |
| 16 | Repository Pattern | TERMINADO | Todos los repositories | Patron aplicado consistentemente |
| 17 | Capa de servicios (v2) | TERMINADO | coin_service.py con DI | Evolucion correcta de la capa service |
| 18 | Diseno completo de BD | TERMINADO | Documentado en .md | Sin DDL en el repo |
| 19 | Modelos y mapeo | TERMINADO | models/coin.py, user.py, etc. | 4 modelos creados |
| 20 | Modelos de entidades | TERMINADO | models/favorite.py, price_history.py | Modelos con __str__ |
| 21 | Repositories y acceso a datos | TERMINADO | coin_repository.py, user_repository.py | save(), find_all(), find_by_id() |
| 22 | Consultas SELECT | TERMINADO | find_all() y find_by_id() | Tests read_test.py, user_read_test.py |
| 23 | Repositories completos | TERMINADO | favorite_repository.py, price_history_repository.py | find_all_by_user(), find_by_coin() |
| 24/25-a | Services y logica de negocio | TERMINADO | coin_service.py con update_coin() | .md dice 'Modulo 24' pero archivo es 25-... |
| 25-b | Sincronizacion y actualizacion | TERMINADO | coin_repository.py con exists() y update() | Logica upsert en CoinService.update_coin() |
| 26 | Price History Service | TERMINADO | price_history_service.py | update_price() implementado |
| 27 | Favorite Service (basico) | DESACTUALIZADO | favorite_service.py en version posterior | .md: FavoriteService(repository) 1 arg; codigo: 3 args |
| 28 | Eliminacion de favoritos | DESACTUALIZADO | remove_favorite() con firma diferente | .md sin validacion; codigo con validacion |
| 29 | Consultar favoritos | DESACTUALIZADO | get_favorites() con firma diferente | .md con 1 arg; codigo con 3 |
| 30 | Integracion favoritos-moneda | DESACTUALIZADO | find_all_with_coin_data() implementado | .md con 1 arg; codigo con 3 |
| 31 | Validacion de favoritos | TERMINADO | add_favorite() con 3 validaciones | Codigo coincide con documentacion |
| 32 | Gestion y validacion favoritos | TERMINADO | favorite_service.py exacto | Modulo consolidador; codigo y doc coherentes |

---

## 5. Ultimo modulo realmente terminado

```
Ultimo modulo documentado:              32
Ultimo modulo realmente implementado:   32
Ultimo modulo realmente probado:        31 (tests de integracion, aunque desactualizados)
Ultimo modulo completamente terminado:  32
```

**Explicacion:**

- Modulo 32 es el ultimo documentado y el codigo coincide exactamente con lo que describe.
- Los tests formales con unittest cubren hasta el modulo 11 aproximadamente.
- Los tests de modulos 27-32 son scripts de integracion manual (sin unittest.TestCase),
  que ademas tienen la firma desactualizada de FavoriteService.
- El modulo 32 esta terminado conceptualmente porque el codigo de produccion es correcto.

---

## 6. Siguiente modulo recomendado

**Modulo 33 - Capa de Controllers**

Por que?

El proyecto tiene completa la capa de logica de negocio (Services) y acceso a datos (Repositories).
La carpeta app/controllers/ existe pero esta vacia. El siguiente paso natural del curso es
introducir los Controllers como intermediarios entre la entrada de datos y los Services.

Conceptos que deberia ensenar:
- Que es un Controller y cual es su responsabilidad?
- Diferencia entre Controller y Service.
- El Controller recibe entradas y delega al Service.
- El Controller no ejecuta SQL ni contiene logica de negocio.

Funcionalidades que ya existen y puede reutilizar:
- Todos los Services (CoinService, FavoriteService, PriceHistoryService).
- Todos los Repositories.
- Todos los Models.
- CoinGeckoClient.

Archivos que deberia crear:
```
app/controllers/coin_controller.py
app/controllers/favorite_controller.py
app/controllers/price_history_controller.py
```

Archivos que deberia modificar:
```
app/main.py  <- Usar controllers en lugar de llamar services directamente
```

Archivos que NO deben modificarse todavia:
```
app/services/*       <- Ya estan completos
app/repositories/*   <- Ya estan completos
app/models/*         <- Ya estan completos
app/database/*       <- Ya esta completo
app/api/*            <- Ya esta completo
```

---

## 7. Models

### Coin - app/models/coin.py

class Coin:
    def __init__(self, id, symbol, name, market_cap_rank):

| Campo | Tipo Python | Observaciones |
|-------|-------------|---------------|
| id | str | Identificador de CoinGecko (ej: bitcoin) |
| symbol | str | Simbolo (ej: btc) |
| name | str | Nombre completo |
| market_cap_rank | int | Ranking por capitalizacion |

Tiene __str__ implementado. Sin type hints.

### User - app/models/user.py

class User:
    def __init__(self, id, username, email, password_hash, created_at):

| Campo | Tipo Python | Observaciones |
|-------|-------------|---------------|
| id | int o None | None al crear (AUTO_INCREMENT) |
| username | str | |
| email | str | |
| password_hash | str | Hash de la contrasena |
| created_at | datetime | |

### Favorite - app/models/favorite.py

class Favorite:
    def __init__(self, user_id, coin_id):

| Campo | Tipo Python | Observaciones |
|-------|-------------|---------------|
| user_id | int | FK a users.id |
| coin_id | str | FK a coins.id |

Modelo minimo correcto para clave compuesta.

### PriceHistory - app/models/price_history.py

class PriceHistory:
    def __init__(self, id, coin_id, price, recorded_at):

| Campo | Tipo Python | Observaciones |
|-------|-------------|---------------|
| id | int o None | None al crear (AUTO_INCREMENT) |
| coin_id | str | FK a coins.id |
| price | float | Precio en USD |
| recorded_at | datetime | |

---

## 8. Repositories

### CoinRepository - app/repositories/coin_repository.py

| Metodo | Descripcion |
|--------|-------------|
| save(coin) | INSERT con ON DUPLICATE KEY UPDATE |
| find_all() | SELECT * FROM coins |
| find_by_id(coin_id) | SELECT por PK |
| exists(coin_id) | SELECT COUNT(*) -> bool |
| update(coin) | UPDATE symbol, name, market_cap_rank |

Observaciones:
- save() usa try/finally correcto.
- find_all(), find_by_id(), exists(), update() NO usan try/finally.
- exists() usa SELECT COUNT(*). UserRepository.exists() usa SELECT 1 LIMIT 1. Enfoques distintos.

### UserRepository - app/repositories/user_repository.py

| Metodo | Descripcion |
|--------|-------------|
| save(user) | INSERT username, email, password_hash, created_at |
| find_all() | SELECT * FROM users |
| find_by_id(user_id) | SELECT por PK |
| exists(user_id) | SELECT 1 LIMIT 1 -> bool |

Observaciones:
- save() NO usa try/finally.
- No hay metodo update() ni delete().

### FavoriteRepository - app/repositories/favorite_repository.py

| Metodo | Descripcion |
|--------|-------------|
| save(favorite) | INSERT user_id, coin_id |
| find_all_by_user(user_id) | SELECT * WHERE user_id |
| exists(user_id, coin_id) | SELECT 1 LIMIT 1 -> bool |
| delete(user_id, coin_id) | DELETE + retorna cursor.rowcount > 0 |
| find_all_with_coin_data(user_id) | INNER JOIN con coins |

Observaciones:
- delete() retorna bool. Correcto.
- Ningun metodo usa try/finally.

### PriceHistoryRepository - app/repositories/price_history_repository.py

| Metodo | Descripcion |
|--------|-------------|
| save(history) | INSERT coin_id, price, recorded_at |
| find_by_coin(coin_id) | SELECT * WHERE coin_id ORDER BY recorded_at DESC |

Observaciones:
- find_by_coin() tiene un BUG: cursor.execute(query, (coin_id)) sin coma final. Ver P-002.

---

## 9. Services

### CoinService - app/services/coin_service.py

Constructor: CoinService(repository, api_client)

| Metodo | Descripcion |
|--------|-------------|
| update_coin(coin_id) | Obtiene de API, mapea, guarda o actualiza -> retorna Coin |

Flujo: api_client.get_coin() -> CoinMapper.to_coin() -> repository.exists() -> update() o save() -> retorna Coin.
Lanza CoinGeckoException si la API no devuelve datos.

### PriceHistoryService - app/services/price_history_service.py

Constructor: PriceHistoryService(repository, api_client)

| Metodo | Descripcion |
|--------|-------------|
| update_price(coin_id) | Obtiene precio de API, guarda historial -> retorna PriceHistory |

Observaciones:
- Lanza Exception generica en lugar de CoinGeckoException. Inconsistencia con CoinService.

### FavoriteService - app/services/favorite_service.py

Constructor: FavoriteService(favorite_repository, user_repository, coin_repository)

| Metodo | Retorno | Descripcion |
|--------|---------|-------------|
| add_favorite(favorite) | (bool, str) | Valida usuario, moneda, duplicado; luego guarda |
| remove_favorite(user_id, coin_id) | (bool, str) | Verifica existencia; luego elimina |
| get_favorites(user_id) | (bool, list o str) | Verifica usuario; retorna lista |
| get_favorites_with_coin_data(user_id) | (bool, list o str) | Verifica usuario; retorna lista con JOIN |

Esta es la version final correcta (modulo 32). Todos los metodos retornan tuplas (success, data_or_message).

### CoinMapper - app/services/coin_mapper.py

Existe la clase estatica CoinMapper.to_coin() y una funcion libre map_coin().
La funcion libre no es utilizada. Residuo de modulos anteriores.

### CoinGeckoService - app/services/coingecko_service.py

Clase vacia que hereda de CoinGeckoClient. Solo existe por retrocompatibilidad.
No es usada en main.py ni en tests.

---

## 10. API / CoinGecko

### CoinGeckoClient - app/api/coingecko_client.py

Constructor: CoinGeckoClient(base_url=None, timeout=None)

| Metodo | Descripcion |
|--------|-------------|
| get_market_coins(vs_currency, per_page, page, order) | GET /coins/markets |
| get_coin(coin_id) | GET /coins/{coin_id} |
| _request_json(path, params) | Ejecuta la peticion HTTP (privado) |

Manejo de errores en _request_json():
- Timeout -> print() + retorna None
- ConnectionError -> print() + retorna None
- HTTPError -> print() + retorna None
- RequestException -> print() + retorna None

Observacion: Los errores se imprimen pero no se propagan como excepcion.
Solo se lanza CoinGeckoException si base_url no esta configurada.
Los errores HTTP 429, 404, etc. se silencian con print().

---

## 11. Database

### Conexion - app/database/connection.py

Crea una nueva conexion en cada llamada. Sin pool de conexiones. Sin manejo de reconexion.

### Configuracion - app/config/settings.py

| Variable | Descripcion |
|----------|-------------|
| COINGECKO_BASE_URL | URL base de CoinGecko |
| REQUEST_TIMEOUT | Segundos de timeout HTTP |
| MYSQL_HOST | Host de MySQL (localhost) |
| MYSQL_PORT | Puerto de MySQL (3306) |
| MYSQL_USER | Usuario MySQL (root) |
| MYSQL_PASSWORD | CREDENCIAL REAL EN EL .env |
| MYSQL_DATABASE | Nombre de la BD (crypto_tracker) |

### Tablas de base de datos

Las tablas no estan definidas en el repositorio como archivos SQL DDL.
Se infieren desde el codigo de los repositories y la documentacion.

#### users

| Columna | Tipo | Constraint |
|---------|------|------------|
| id | INT | PK, AUTO_INCREMENT |
| username | VARCHAR | NOT NULL |
| email | VARCHAR | NOT NULL |
| password_hash | VARCHAR | NOT NULL |
| created_at | DATETIME | NOT NULL |

#### coins

| Columna | Tipo | Constraint |
|---------|------|------------|
| id | VARCHAR | PK (ej: bitcoin) - no AUTO_INCREMENT |
| symbol | VARCHAR | NOT NULL |
| name | VARCHAR | NOT NULL |
| market_cap_rank | INT | NULLABLE |

#### favorites

| Columna | Tipo | Constraint |
|---------|------|------------|
| user_id | INT | PK compuesta, FK -> users.id |
| coin_id | VARCHAR | PK compuesta, FK -> coins.id |

CLAVE PRIMARIA COMPUESTA: (user_id, coin_id). No tiene id independiente.
Diseno correcto documentado explicitamente en modulos 28, 29, 31 y 32.

#### price_history

| Columna | Tipo | Constraint |
|---------|------|------------|
| id | INT | PK, AUTO_INCREMENT |
| coin_id | VARCHAR | FK -> coins.id |
| price | DECIMAL | NOT NULL |
| recorded_at | DATETIME | NOT NULL |

FK de price_history.coin_id -> coins.id documentada en modulo 26.

---

## 12. Tests

Clasificacion:
- Unitario formal: usa unittest.TestCase, ejecutable con python -m unittest discover.
- Script de integracion: tiene funcion main(), se ejecuta manualmente. Requiere BD activa.

| Archivo | unittest | Sin BD | Con BD | Que prueba |
|---------|----------|--------|--------|------------|
| api_tests.py | SI | SI | SI | CoinGeckoClient con mocks |
| database_test.py | SI | SI | SI | get_connection() con mock |
| service_test.py | SI | PROBLEMAS (P-003) | SI | CoinService.update_coin() con fakes |
| model_test.py | NO | SI | SI | Instanciacion de Coin y print |
| models_tests.py | NO | SI | SI | Instanciacion de User, Favorite, PriceHistory |
| read_test.py | NO | NO | SI | CoinRepository.find_all() real |
| user_read_test.py | NO | NO | SI | UserRepository real |
| repository_test.py | NO | NO | SI | Guardado de User/Favorite/PriceHistory. unittest COMENTADO |
| price_history_service_test.py | NO | NO | SI | PriceHistoryService.update_price() real |
| favorite_service_test.py | NO | NO | ROTO | ROTO: FavoriteService(repository) 1 arg vs 3 requeridos |
| delete_favorite_test.py | NO | NO | ROTO | ROTO: misma firma incorrecta |
| get_favorites_test.py | NO | NO | ROTO | ROTO: misma firma incorrecta |
| favorite_with_coin_test.py | NO | NO | ROTO | ROTO: misma firma incorrecta |

---

## 13. Estado funcional

### Coins

| Funcionalidad | Estado |
|---------------|--------|
| Obtener moneda desde CoinGecko | IMPLEMENTADO |
| Obtener lista de monedas | IMPLEMENTADO |
| Guardar moneda | IMPLEMENTADO (UPSERT) |
| Actualizar moneda | IMPLEMENTADO |
| Consultar todas las monedas | IMPLEMENTADO |
| Consultar moneda por ID | IMPLEMENTADO |
| Verificar si existe | IMPLEMENTADO |
| Sincronizar moneda (upsert inteligente) | IMPLEMENTADO |

### Users

| Funcionalidad | Estado |
|---------------|--------|
| Crear usuario | IMPLEMENTADO |
| Consultar todos los usuarios | IMPLEMENTADO |
| Consultar usuario por ID | IMPLEMENTADO |
| Validar existencia | IMPLEMENTADO |
| Actualizar usuario | NO IMPLEMENTADO |
| Eliminar usuario | NO IMPLEMENTADO |

### Favorites

| Funcionalidad | Estado |
|---------------|--------|
| Agregar favorito | IMPLEMENTADO |
| Detectar duplicado antes de guardar | IMPLEMENTADO |
| Validar existencia de usuario | IMPLEMENTADO |
| Validar existencia de moneda | IMPLEMENTADO |
| Eliminar favorito con validacion | IMPLEMENTADO |
| Consultar favoritos (solo IDs) | IMPLEMENTADO |
| Consultar favoritos con datos de moneda | IMPLEMENTADO |

### Price History

| Funcionalidad | Estado |
|---------------|--------|
| Obtener precio actual desde CoinGecko | IMPLEMENTADO |
| Guardar registro historico | IMPLEMENTADO |
| Consultar historial por moneda | IMPLEMENTADO (con bug P-002) |
| Consultar historial por rango de fechas | NO IMPLEMENTADO |

### Controllers

| Funcionalidad | Estado |
|---------------|--------|
| CoinController | NO IMPLEMENTADO - carpeta vacia |
| FavoriteController | NO IMPLEMENTADO - carpeta vacia |
| PriceHistoryController | NO IMPLEMENTADO - carpeta vacia |

### HTTP Layer (REST API)

| Funcionalidad | Estado |
|---------------|--------|
| Endpoints REST | NO IMPLEMENTADO |
| FastAPI / Flask | NO INSTALADO |

---

## 14. Problemas encontrados

### CRITICOS

#### P-001 - Tests de favoritos ROTOS (modulos 27-30)

Archivos: favorite_service_test.py, delete_favorite_test.py, get_favorites_test.py, favorite_with_coin_test.py

Descripcion: Los 4 tests instancian FavoriteService(repository) con 1 argumento.
El constructor actual exige 3: FavoriteService(favorite_repository, user_repository, coin_repository).
Al ejecutarlos se produce:
  TypeError: FavoriteService.__init__() missing 2 required positional arguments

Causa: Tests de la version anterior del service (modulos 27-30).
El modulo 31 cambio el constructor pero los tests no fueron actualizados.

#### P-002 - Bug en PriceHistoryRepository.find_by_coin()

Archivo: app/repositories/price_history_repository.py, linea 46

Descripcion: cursor.execute(query, (coin_id)) sin coma final.
En Python, (coin_id) es simplemente coin_id (un string), no una tupla.
MySQL connector intentara iterar el string caracter a caracter como parametros.

Codigo actual:
  cursor.execute(query, (coin_id))

Correcto seria:
  cursor.execute(query, (coin_id,))

---

### IMPORTANTES

#### P-003 - service_test.py tiene assertions incorrectas

Archivo: app/tests/service_test.py, lineas 28-46

Descripcion: El test crea un FakeApiClient que retorna datos de 'usdt' pero hace assertions sobre valores de Bitcoin.
Ademas, FakeRepository no implementa exists() ni update(), pero CoinService.update_coin() llama a self.repository.exists().
Esto causara AttributeError: 'FakeRepository' object has no attribute 'exists'

#### P-004 - _request_json() silencia errores HTTP con print()

Archivo: app/api/coingecko_client.py, lineas 55-65

Descripcion: Todos los errores de red retornan None sin lanzar excepcion.
No hay logging estructurado ni propagacion de excepciones tipadas para cada tipo de error.

#### P-005 - PriceHistoryService usa Exception generica

Archivo: app/services/price_history_service.py, linea 17

Descripcion: Lanza raise Exception(...) en lugar de raise CoinGeckoException(...).
El modulo 26 documenta que deberia usar CoinGeckoException. Inconsistente con CoinService.

#### P-006 - Conexiones sin try/finally en la mayoria de metodos

Archivos: user_repository.py, favorite_repository.py, price_history_repository.py, coin_repository.py
(metodos find_all, find_by_id, exists, update)

Descripcion: Solo CoinRepository.save() usa try/finally. El resto cierra con .close() manualmente
pero si ocurre una excepcion antes, las conexiones quedan abiertas.

#### P-007 - repository_test.py tiene el unittest completamente comentado

Archivo: app/tests/repository_test.py, lineas 1-56

Descripcion: Existe codigo de CoinRepositoryTest completamente comentado.
El test nunca sera descubierto por unittest discover.

---

### MENORES

#### P-008 - .env contiene credencial real
Archivo: backend/.env
Descripcion: La contrasena de MySQL esta en texto plano. Verificar que este excluido del git.

#### P-009 - map_coin() funcion libre no utilizada
Archivo: app/services/coin_mapper.py, linea 15
Descripcion: Alias de CoinMapper.to_coin() sin uso. Residuo de refactorizacion.

#### P-010 - utils.py con codigo comentado
Archivo: app/utils.py
Descripcion: sumar() comentada, mostrar_titulo() sin uso activo. Residuo del modulo 5.

#### P-011 - CHANGELOG.md vacio
Archivo: backend/CHANGELOG.md
Descripcion: El archivo existe pero no tiene contenido.

#### P-012 - Ausencia de archivos SQL DDL
Descripcion: No existe ningun .sql con la definicion de tablas. BD creada manualmente en MySQL Workbench.

#### P-013 - Numero de modulo erroneo en 25-services-y-logica-de-negocio.md
Archivo: backend/docs/25-services-y-logica-de-negocio.md
Descripcion: El encabezado interno dice 'Modulo 24' pero el archivo se llama 25-services-...

#### P-014 - Archivos con CRLF mezclados con LF
Descripcion: Algunos archivos usan CRLF (Windows) y otros LF (Unix). Sin .editorconfig definido.

---

## 15. Inconsistencias documentacion vs codigo

| Modulo | Inconsistencia | Tipo |
|--------|---------------|------|
| 27 | FavoriteService(repository) con 1 arg en .md; codigo tiene 3 | Documentacion superada por modulo 31 |
| 28 | remove_favorite() en .md sin validacion; codigo con validacion | Evolucion valida (modulo 32) |
| 29 | get_favorites() en .md retorna lista; codigo retorna (bool, list) | Evolucion valida (modulo 32) |
| 30 | get_favorites_with_coin_data() en .md retorna lista; codigo (bool, list) | Evolucion valida (modulo 32) |
| 26 | Documenta raise CoinGeckoException(); codigo usa raise Exception() | INCONSISTENCIA REAL |
| 31 | Documenta remove_favorite() sin validacion previa; codigo valida | Evolucion valida (modulo 32) |

---

## 16. Codigo adelantado respecto al curso

| Codigo | Modulo documentado | Observacion |
|--------|-------------------|-------------|
| FavoriteService con 3 repositories | Modulo 31/32 | Tests de modulos 27-30 no actualizados |
| FavoriteService.get_favorites() retorna (bool, list) | Modulo 32 | Tests anteriores esperan solo la lista |
| FavoriteRepository.delete() retorna bool | Modulo 28 sin retorno; 32 con retorno | Evolucion valida |

---

## 17. Codigo pendiente

| Funcionalidad | Estado |
|---------------|--------|
| app/controllers/ | VACIO - siguiente modulo |
| HTTP REST endpoints | SIN IMPLEMENTAR |
| Autenticacion de usuarios | SIN IMPLEMENTAR |
| Hashing de contrasenias | SIN IMPLEMENTAR |
| Archivo SQL DDL de inicializacion | SIN CREAR |
| Tests unitarios formales para repositories | SIN IMPLEMENTAR (el unico esta comentado) |
| Tests unitarios para FavoriteService | SIN IMPLEMENTAR (scripts rotos) |
| Tests unitarios para PriceHistoryService | SIN IMPLEMENTAR |

---

## 18. Dependencias instaladas

requirements.txt:
  mysql-connector-python==26.7.0
  python-dotenv==1.2.2
  requests==2.34.2

Observacion: mysql-connector-python==26.7.0 tiene version inusualmente alta.
La version estable actual es 8.x. Podria ser un error tipografico. Verificar compatibilidad.

Dependencias implicitas (no en requirements.txt):
- Python 3.13+ (indicado en README.md)
- unittest (stdlib - no requiere instalacion)

---

## 19. Conclusion

### En que punto exacto esta el proyecto?

El backend tiene implementada y funcional la capa completa de Services y Repositories
para las cuatro entidades del dominio (Coin, User, Favorite, PriceHistory).

El proyecto puede:
1. Consultar criptomonedas desde CoinGecko y persistirlas en MySQL.
2. Registrar historial de precios.
3. Gestionar favoritos de usuario con validaciones completas.
4. Detectar duplicados, usuarios inexistentes y monedas inexistentes antes de persistir.

Lo que NO tiene: ninguna capa HTTP (controllers, endpoints REST, FastAPI/Flask).
La aplicacion solo puede ejecutarse via python -m app.main o scripts de tests individuales.

### Que modulos estan realmente terminados?

Modulos 01 al 26 estan terminados (incluyendo los dos numerados como 25).
Los modulos 27-30 estan conceptualmente terminados pero su documentacion refleja una version anterior del FavoriteService.
Los modulos 31 y 32 estan terminados y el codigo coincide exactamente.

### Que modulo deberia continuar?

Modulo 33 - Capa de Controllers.

### Que codigo NO debemos volver a implementar?

- CoinGeckoClient y sus metodos
- CoinService.update_coin() con logica upsert
- PriceHistoryService.update_price()
- FavoriteService completo (add, remove, get, get_with_coin_data)
- Todos los repositories (coin, user, favorite, price_history)
- Todos los models (Coin, User, Favorite, PriceHistory)
- CoinMapper.to_coin()
- get_connection() y Settings

### Que problemas deberiamos corregir antes de continuar?

Ordenados por prioridad:

1. P-002 - Bug (coin_id) sin coma en PriceHistoryRepository.find_by_coin(). Rompe la consulta.
2. P-001 - Los 4 tests de favoritos con firma incorrecta de FavoriteService. Rompen al ejecutarse.
3. P-003 - service_test.py con assertions incorrectas y FakeRepository sin exists().
4. P-005 - PriceHistoryService deberia lanzar CoinGeckoException en vez de Exception.
5. P-006 - Agregar try/finally en los metodos de repositories que no lo tienen.

### Que funcionalidades quedan pendientes?

1. Capa de Controllers (modulo 33).
2. Capa HTTP REST con FastAPI o Flask.
3. Autenticacion de usuarios (registro, login, tokens).
4. Hashing seguro de contrasenias (bcrypt o similar).
5. Archivo SQL de inicializacion de la base de datos.
6. Tests unitarios formales para repositories y FavoriteService.
7. Paginacion en endpoints, documentacion OpenAPI, validacion de entrada.

---

## 20. Recomendacion para continuar

Antes de comenzar el modulo 33, se recomienda una sesion de correccion rapida:

1. Corregir (coin_id) -> (coin_id,) en price_history_repository.py.
2. Actualizar los 4 tests de favoritos para usar la firma correcta de FavoriteService.
3. Opcionalmente: corregir service_test.py para que las assertions sean coherentes.

Estos tres cambios son minimos y permitiran arrancar el modulo 33 con todos los tests en estado correcto.

Para el modulo 33:

Crear app/controllers/favorite_controller.py como primer controller del proyecto.
Usar FavoriteService como caso de uso porque ya tiene la logica mas completa.
El controller puede recibir los mismos parametros que el service y formatear los resultados.

---

Documento generado mediante analisis estatico del codigo.
No se ejecuto ningun comando ni se modifico ningun archivo del proyecto.
# Módulo 53 — `Depends`, inyección de dependencias y ciclo de vida en FastAPI

## Objetivo

Reemplazar el acceso directo a un `Container` global desde las routes por dependencias declaradas con `Depends`. El container se construye al iniciar FastAPI y se comparte durante la vida de la aplicación.

## Problema que resolvimos

Antes, `app/api/app.py` construía un `Container` como variable global y cada endpoint accedía directamente a `container.<controller>`.

Ese enfoque funcionaba, pero la route conocía demasiado sobre cómo se obtiene su controller y los tests tenían que mutar el estado global. Esto acopla el endpoint a una instancia concreta y facilita que un test afecte a otro.

## Conceptos aprendidos

- Una dependencia es un valor que FastAPI resuelve antes de invocar un endpoint.
- `Depends(proveedor)` declara que FastAPI debe ejecutar el proveedor y entregar su resultado.
- La inyección de dependencias separa la necesidad de una route de la construcción de la dependencia.
- `lifespan` define el ciclo de vida de la aplicación: código de inicio antes de `yield` y código de cierre después de `yield`.
- `app.dependency_overrides` permite sustituir una dependencia en un test sin modificar la aplicación global ni conectarse a MySQL.

## Flujo

```text
Inicio de FastAPI
    ↓
lifespan crea Container
    ↓
request a endpoint
    ↓
Depends(get_*_controller)
    ↓
controller correcto
    ↓
endpoint delega al controller
```

Para un test:

```text
Test
    ↓
app.dependency_overrides[get_favorite_controller] = mock
    ↓
FastAPI entrega el mock al endpoint
    ↓
test aislado, sin mutar Container
```

## Implementación

### `app/api/dependencies.py`

Se creó un módulo exclusivo de proveedores:

- `get_container(request)` lee el container construido por el ciclo de vida desde `request.app.state`.
- `get_coin_controller()` entrega `CoinController`.
- `get_favorite_controller()` entrega `FavoriteController`.
- `get_price_history_controller()` entrega `PriceHistoryController`.

Las routes conocen estos proveedores, pero no construyen repositories, services o controllers.

### `app/api/app.py`

Se añadió una función `lifespan` con `@asynccontextmanager`. Al iniciar, asigna `Container()` a `application.state.container`.

Cada endpoint recibe el controller requerido, por ejemplo:

```python
def add_favorite(
    request: FavoriteCreateRequest = Body(...),
    controller: FavoriteController = Depends(get_favorite_controller),
):
    ...
```

El endpoint recibe el controller ya preparado, delega y conserva su responsabilidad HTTP.

### `app/container.py`

Se corrigió el atributo `coin_serivice` a `coin_service`. El comportamiento no cambia; el nombre ahora representa correctamente su dependencia.

## Archivos creados

- `app/api/dependencies.py`
- `app/tests/dependencies_test.py`

## Archivos modificados

- `app/api/app.py`
- `app/container.py`
- `app/tests/http_status_codes_test.py`
- `app/tests/price_history_query_models_test.py`

## Tests creados y actualizados

- `dependencies_test.py` comprueba que `lifespan` crea un container y sus controllers durante la ejecución de FastAPI.
- Los tests de errores HTTP usan `app.dependency_overrides` para inyectar mocks de controllers.
- Los tests de routes de Price History pasan explícitamente mocks al invocar funciones de endpoint de forma directa.

Ejecuciones realizadas:

```powershell
.\.venv\Scripts\python.exe -m py_compile app\api\app.py app\api\dependencies.py app\container.py app\tests\dependencies_test.py app\tests\http_status_codes_test.py app\tests\price_history_query_models_test.py
.\.venv\Scripts\python.exe -m unittest app.tests.dependencies_test app.tests.http_status_codes_test app.tests.price_history_query_models_test
.\.venv\Scripts\python.exe -m unittest discover -s app/tests -p "*_test.py"
```

Resultados:

- 14 tests específicos aprobados.
- 29 tests de la suite completa aprobados.

## Decisiones técnicas

No se introdujeron librerías externas de inyección de dependencias. FastAPI ya proporciona `Depends`, que cubre la necesidad actual y mantiene el proyecto simple.

`Container` sigue siendo el lugar donde se compone el grafo de objetos. `Depends` no lo reemplaza: conecta ese grafo con cada request HTTP de manera explícita y testeable.

## Alternativas

- Crear un `Container` por request: sería más costoso y no aporta valor mientras los repositories no mantengan recursos por request.
- Instanciar controllers en cada endpoint: duplica composición y acopla la capa HTTP.
- Usar una librería DI externa: añade complejidad antes de necesitar scopes más avanzados.

## Estado final

Las routes ya no usan una variable global `container`. La composición vive en `Container`, el inicio de esa composición vive en `lifespan` y la entrega a las routes vive en `Depends`.

## Siguiente módulo

Módulo 54 — Introducción a Pytest y migración progresiva desde `unittest`.

# Módulo 33 - Controllers

Hasta ahora tenemos

```shell
CoinGeckoClient
       ↓
     Service
       ↓
   Repository
       ↓
      MySQL
```

El problema es que todavía NO tenemos una capa encargada de recibir una operación y deciridr qué SERVICE debe ejecutar.

El CONTROLLER será esa intermediario:

```shell
Entrada
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
MySQL
```

## 1. ¿Qué responsabilidad tiene un Controller?

- Recibir los datos necesarios.
- Llamar al Service correspondiente.
- Devolver el resultado.
- Traducir, cuando responda, el resultado del Servie a una respuesta apropiada.

El controller `⚠️NO⚠️` debe:

- ⛔ Ejecutar SQL.
- ⛔ Acceder directamente al `REPOSITORY`.
- ⛔ Consultar CoinGecko.
- ⛔ Contener reglas de negocio.

```py
# Por ejemplo, esto no debería estar en un Controller:
connection = get_connection()
cursor.execute(...)

# Eso pertenece al Repository.
# Tampoco:
if user_exists and not favorite_exists:
    ...
# Eso pertenece al Service.
```

## 2. Nuestro primer Controller

Vamos a empezar con favoritos porque `FavoriteService` es actualmente nuestro Service más completo

[VER CODIGO](../backend/app/controllers/favorite_controller.py)

**Observa algo importante:**

```py
self.service.add_favorite(...)
```

El Controller no sabe cómo se guarda el favorito.

Tampoco sabe que existen tres respositories.

Simplemente delefa:

```shell
Controller
    ↓
FavoriteService
    ↓
FavoriteRepository
UserRepository
CoinRepository
```

## 3. ¿Por qué inyectamos el Service?

Igual que hicimos anteriormente con los Repositories:

```py
def __init__(self, service):
    self.service = service

# Esto nos permite hacer:
controller = FavoriteController(service)
# en lugar de crear dependencias dentro del Controller.
```

Es otra opcion de Dependency Injection.

Con esto la estructura queda:

```shell
FavoriteController
        │
        ▼
FavoriteService
        │
        ├── FavoriteRepository
        ├── UserRepository
        └── CoinRepository
```

El Controller conoce al Service.

El Service conoce a los Repositories.

Pero el Controller no conoce directamente a los Repositories.

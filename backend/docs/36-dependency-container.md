# Módulo 36 - Dependency Container

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

Centralizar la creación y conexión de las diferentes dependencias de la aplicación.

Antes de este módulo, `main.py` debía encargarse directamente de crear repositories, services y controllers.

Esto genera demasiado acoplamiento en el punto de entrada.

El `Container` permite centralizar esta responsabilidad.

---

## ¿Qué es un Dependency Container?

Es una clase encargada de crear y proporcionar las dependencias necesarias para que funcione la aplicación.

En nuestro proyecto:

```text
Container
    │
    ├── API Client
    │
    ├── Repositories
    │
    ├── Services
    │
    └── Controllers
```

Arquitectura

La aplicación utiliza las dependencias siguiendo este flujo:

API Client
│
▼
Repositories
│
▼
Services
│
▼
Controllers
│
▼
Main

Sin embargo, los Services pueden utilizar tanto repositories como clientes externos.

Por ejemplo:

CoinController
│
▼
CoinService
┌──┴──────────────┐
▼ ▼
CoinRepository CoinGeckoClient
│ │
▼ ▼
MySQL CoinGecko API
Container

Archivo:

app/container.py

El Container crea todas las dependencias principales.

API Client
self.api_client = CoinGeckoClient()
Repositories
self.coin_repository = CoinRepository()
self.user_repository = UserRepository()
self.favorite_repository = FavoriteRepository()
self.price_history_repository = PriceHistoryRepository()
Services

Cada Service recibe las dependencias que necesita.

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
Controllers

Finalmente, cada Controller recibe su Service correspondiente.

self.coin_controller = CoinController(
self.coin_service
)
self.favorite_controller = FavoriteController(
self.favorite_service
)
self.price_history_controller = PriceHistoryController(
self.price_history_service
)
Error encontrado durante el módulo

Inicialmente se tenía:

self.favorite_controller = FavoriteController(
self.favorite_controller
)

Esto es incorrecto porque favorite_controller todavía no existe.

La dependencia correcta es:

self.favorite_controller = FavoriteController(
self.favorite_service
)

Lo mismo ocurrió con PriceHistoryController.

Incorrecto:

self.price_history_controller = PriceHistoryController(
self.price_history_controller
)

Correcto:

self.price_history_controller = PriceHistoryController(
self.price_history_service
)
Main

El main.py queda mucho más sencillo:

from app.container import Container

def main():

    container = Container()

    result = container.coin_controller.update_coin("bitcoin")

    print(result)

if **name** == "**main**":
main()

main.py ya no necesita conocer cómo se crean:

repositories
services
API clients
controllers

Solo necesita utilizar el Container.

Resultado de la prueba

Ejecutamos:

python -m app.main

Resultado:

{
'success': True,
'message': 'Moneda sincronizada correctamente.',
'data': <app.models.coin.Coin object at ...>
}

Esto confirma que:

El Container se puede instanciar.
CoinRepository se crea correctamente.
CoinService se crea correctamente.
CoinGeckoClient se crea correctamente.
CoinController se crea correctamente.
Las dependencias se inyectan correctamente.
CoinGecko responde correctamente.
La moneda puede sincronizarse.
El flujo completo funciona desde main.py.
Concepto importante

El Container aplica Dependency Injection.

En lugar de que una clase cree internamente sus dependencias:

class CoinController:

    def __init__(self):

        repository = CoinRepository()
        api_client = CoinGeckoClient()

        self.service = CoinService(
            repository,
            api_client
        )

se las proporcionamos desde afuera:

class CoinController:

    def __init__(self, service):

        self.service = service

Esto reduce el acoplamiento y facilita:

testing
mantenimiento
reemplazo de implementaciones
configuración
escalabilidad
Estado del proyecto

Después del módulo 36 tenemos:

Models ✅
Repositories ✅
Services ✅
Controllers ✅
Dependency Injection ✅
Container ✅
CoinGecko API ✅
MySQL ✅
Favorites ✅
Price History ✅
Main ✅

Todavía no tenemos una API HTTP REST.

El proyecto actualmente sigue siendo ejecutado mediante Python:

python -m app.main
Próximo paso

El siguiente paso natural es comenzar a transformar la aplicación en una aplicación accesible mediante HTTP.

El módulo siguiente debería introducir la capa HTTP / API REST, utilizando los Controllers que acabamos de crear.

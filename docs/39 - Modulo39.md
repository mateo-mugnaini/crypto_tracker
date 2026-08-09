# Modulo 39 - Endpoints de Favoritos+

### Hasta ahora tenemos:

- GET `/coins`
- GET `/coins/{coin_id}`
- POST `/coins/{coin_id}`

Ahora bamos a exponer mediante HTTP la fucionalidad de favoritos que ya esta implementada en `FavoriteService`

Objetivo:

Crear estos endpoints:

| Método   | Endpoint               | Función                                        |
| -------- | ---------------------- | ---------------------------------------------- |
| `POST`   | `/favorites`           | Agregar una moneda a favoritos                 |
| `DELETE` | `/favorites/{coin_id}` | Eliminar una moneda de favoritos               |
| `GET`    | `/favorites`           | Obtener favoritos del usuario                  |
| `GET`    | `/favorites/details`   | Obtener favoritos con información de la moneda |

## 1. Revisar FavoriteController

Ya tenemos el controller creado en:

app/controllers/favorite_controller.py

La idea es que el controller sea el encargado de adaptar el resultado del service al formato HTTP.

Debe quedar conceptualmente así:

from app.exceptions.api_exception import CoinGeckoException

class FavoriteController:

    def __init__(self, service):
        self.service = service

    def add_favorite(self, favorite):

        success, message = self.service.add_favorite(favorite)

        return {
            "success": success,
            "message": message
        }

    def remove_favorite(self, user_id, coin_id):

        success, message = self.service.remove_favorite(
            user_id,
            coin_id
        )

        return {
            "success": success,
            "message": message
        }

    def get_favorites(self, user_id):

        success, data = self.service.get_favorites(user_id)

        return {
            "success": success,
            "data": data
        }

    def get_favorites_with_coin_data(self, user_id):

        success, data = self.service.get_favorites_with_coin_data(
            user_id
        )

        return {
            "success": success,
            "data": data
        }

La responsabilidad continúa siendo sencilla:

HTTP
↓
Controller
↓
Service

El controller no debería consultar MySQL directamente.

2. Revisar el Container

Tu Container ya debería tener:

self.favorite_repository = FavoriteRepository()

self.user_repository = UserRepository()

self.favorite_service = FavoriteService(
self.favorite_repository,
self.user_repository,
self.coin_repository
)

self.favorite_controller = FavoriteController(
self.favorite_service
)

Esto es importante porque el FavoriteService necesita sus tres repositories:

FavoriteRepository
UserRepository
CoinRepository 3. Endpoint POST /favorites

En app/api/app.py podemos agregar:

from app.models.favorite import Favorite

Y:

@app.post("/favorites")
def add_favorite(user_id: int, coin_id: str):

    favorite = Favorite(
        user_id,
        coin_id
    )

    return container.favorite_controller.add_favorite(
        favorite
    )

Entonces podemos hacer:

POST /favorites?user_id=1&coin_id=bitcoin

Y esperamos:

{
"success": true,
"message": "Favorito agregado correctamente."
}

Si ya existe:

{
"success": false,
"message": "La moneda ya está en favoritos."
} 4. Endpoint DELETE /favorites/{coin_id}

Agregamos:

@app.delete("/favorites/{coin_id}")
def remove_favorite(
coin_id: str,
user_id: int
):

    return container.favorite_controller.remove_favorite(
        user_id,
        coin_id
    )

Podemos llamar:

DELETE /favorites/bitcoin?user_id=1

Si existe:

{
"success": true,
"message": "Favorito eliminado correctamente."
}

Si no existe:

{
"success": false,
"message": "No tienes esta moneda en favoritos."
}

Esto reutiliza exactamente la lógica que ya probaste anteriormente.

5. Endpoint GET /favorites

Ahora podemos consultar los favoritos:

@app.get("/favorites")
def get_favorites(user_id: int):

    return container.favorite_controller.get_favorites(
        user_id
    )

Petición:

GET /favorites?user_id=1

Respuesta esperada:

{
"success": true,
"data": [
{
"user_id": 1,
"coin_id": "bitcoin"
}
]
} 6. Endpoint GET /favorites/details

Finalmente exponemos el método que utiliza el JOIN con coins.

@app.get("/favorites/details")
def get_favorites_with_coin_data(user_id: int):

    return container.favorite_controller.get_favorites_with_coin_data(
        user_id
    )

Petición:

GET /favorites/details?user_id=1

Respuesta:

{
"success": true,
"data": [
{
"user_id": 1,
"coin_id": "bitcoin",
"symbol": "btc",
"name": "Bitcoin",
"market_cap_rank": 1
}
]
}

La diferencia importante es:

GET /favorites

devuelve únicamente la relación:

user_id + coin_id

Mientras:

GET /favorites/details

devuelve además información de coins.

7. Probar con Swagger

Levanta nuevamente:

uvicorn app.api.app:app --reload

Y abre:

Swagger UI local

Deberían aparecer:

GET /coins
GET /coins/{coin_id}
POST /coins/{coin_id}

POST /favorites
DELETE /favorites/{coin_id}
GET /favorites
GET /favorites/details
Orden recomendado de prueba

Primero:

POST /favorites
user_id = 1
coin_id = bitcoin

Después:

GET /favorites?user_id=1

Después:

GET /favorites/details?user_id=1

Y finalmente:

DELETE /favorites/bitcoin?user_id=1

Después de eliminar:

GET /favorites?user_id=1

debería devolver una lista vacía.

Concepto importante del módulo

Estamos empezando a convertir el backend que teníamos:

Python scripts

en una aplicación HTTP real:

Cliente HTTP
↓
FastAPI
↓
Controller
↓
Service
↓
Repository
↓
MySQL

Y lo importante es que no estamos moviendo la lógica de negocio al endpoint. La lógica de favoritos continúa perteneciendo a FavoriteService.

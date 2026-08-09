Módulo 38 — API REST de Coins
Objetivo

Pasar de tener únicamente un endpoint para sincronizar una moneda a disponer de una API que permita consultar las monedas almacenadas en MySQL.

La idea será mantener el flujo:

HTTP Request
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

Y para consultas externas:

HTTP Request
↓
FastAPI
↓
Controller
↓
Service
↓
CoinGecko API
↓
MySQL

1. ¿Qué responsabilidad tiene FastAPI?

FastAPI será nuestra capa HTTP.

Por ejemplo:

GET /coins

No debería acceder directamente a MySQL.

La responsabilidad estará distribuida:

FastAPI

Recibe la petición HTTP.

Controller

Decide qué operación ejecutar.

Service

Contiene la lógica de negocio.

Repository

Realiza la consulta SQL.

2. Primer endpoint: obtener todas las monedas

Actualmente CoinRepository ya tiene:

find_all()

Por lo tanto, no necesitamos crear lógica nueva en Repository.

Primero necesitamos agregarla al CoinService.

coin_service.py

Agrega:

def get_all_coins(self):

    return self.repository.find_all()

El Service simplemente delega la consulta al Repository porque en este caso no existe lógica de negocio adicional.

3. Agregarlo al Controller

En:

app/controllers/coin_controller.py

agregamos:

def get_all_coins(self):

    coins = self.service.get_all_coins()

    return {
        "success": True,
        "message": "Monedas obtenidas correctamente.",
        "data": coins
    }

Ahora tenemos dos operaciones:

update_coin()
get_all_coins() 4. Endpoint FastAPI

Ahora vamos a llevarlo a HTTP.

En tu aplicación FastAPI probablemente tienes algo similar a:

app/
└── api/
├── app.py
└── coingecko_client.py

En app.py podemos agregar:

@app.get("/coins")
def get_all_coins():

    container = Container()

    return container.coin_controller.get_all_coins()

Entonces tendremos:

GET /coins 5. Probarlo

Con Uvicorn:

uvicorn app.api.app:app --reload

Después puedes abrir:

http://127.0.0.1:8000/coins

O utilizar Swagger:

http://127.0.0.1:8000/docs

La respuesta debería ser aproximadamente:

{
"success": true,
"message": "Monedas obtenidas correctamente.",
"data": [
{
"id": "bitcoin",
"symbol": "btc",
"name": "Bitcoin",
"market_cap_rank": 1
},
{
"id": "ethereum",
"symbol": "eth",
"name": "Ethereum",
"market_cap_rank": 2
}
]
}

La cantidad dependerá de las monedas que tengas actualmente sincronizadas en MySQL.

6. Segundo endpoint: obtener una moneda

Ya tenemos también:

find_by_id()

en CoinRepository.

Por lo tanto podemos seguir el mismo flujo.

En CoinService:

def get_coin(self, coin_id):

    return self.repository.find_by_id(coin_id)

Y en CoinController:

def get_coin(self, coin_id):

    coin = self.service.get_coin(coin_id)

    if not coin:

        return {
            "success": False,
            "message": "La moneda no existe."
        }

    return {
        "success": True,
        "message": "Moneda encontrada correctamente.",
        "data": coin
    }

7. Endpoint

En FastAPI:

@app.get("/coins/{coin_id}")
def get_coin(coin_id: str):

    container = Container()

    return container.coin_controller.get_coin(coin_id)

Entonces podemos hacer:

GET /coins/bitcoin

Y recibir:

{
"success": true,
"message": "Moneda encontrada correctamente.",
"data": {
"id": "bitcoin",
"symbol": "btc",
"name": "Bitcoin",
"market_cap_rank": 1
}
}

Si hacemos:

GET /coins/moneda-que-no-existe

obtendremos:

{
"success": false,
"message": "La moneda no existe."
} 8. Algo importante: Repository vs API

Aquí estamos haciendo algo distinto a update_coin().

update_coin():

CoinGecko
↓
CoinService
↓
CoinRepository
↓
MySQL

Mientras que:

GET /coins

hace:

HTTP
↓
Controller
↓
Service
↓
Repository
↓
MySQL

Y:

GET /coins/bitcoin

hace:

HTTP
↓
Controller
↓
Service
↓
Repository
↓
MySQL

Esto es importante porque no queremos consultar CoinGecko cada vez que alguien hace GET /coins.

CoinGecko se utiliza para sincronizar/actualizar nuestros datos.

Nuestra API consulta nuestra propia base de datos.

9. Test del Controller

Puedes crear:

app/tests/coin_controller_get_test.py

Por ahora como test de integración:

from app.container import Container

def main():

    container = Container()

    result = container.coin_controller.get_all_coins()

    print(result)

if **name** == "**main**":
main()

Ejecutar:

python -m app.tests.coin_controller_get_test

Deberías obtener algo parecido a:

{
'success': True,
'message': 'Monedas obtenidas correctamente.',
'data': [...]
}
Arquitectura que estamos construyendo

Ya empieza a tomar esta forma:

                    ┌──────────────┐
                    │    FastAPI   │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Controllers │
                    └──────┬───────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Services   │
                    └──────┬───────┘
                           │
                ┌──────────┴──────────┐
                ▼                     ▼
        ┌──────────────┐      ┌──────────────┐
        │ Repositories │      │  CoinGecko   │
        └──────┬───────┘      └──────────────┘
               │
               ▼
        ┌──────────────┐
        │    MySQL     │
        └──────────────┘

Este módulo introduce una idea importante: la API HTTP no debería saber cómo se almacenan los datos ni cómo se consulta CoinGecko. Solo comunica la petición al Controller y devuelve el resultado.

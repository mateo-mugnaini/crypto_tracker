# Modulo 37 - Introduccion a FastAPI y API REST

> ### Objetivo:
>
> - Convertir nuestro backend en una aplicacion accesible mediante HTTP. EJ: GET /coins/bitcoin

La peticion deberia recorrer:

```text
HTTP Request
     ↓
FastAPI
     ↓
Controller
     ↓
Service
     ↓
Repository / CoinGecko
     ↓
HTTP Response
```

## 1. ¿Qué es FastAPI?

Vamos a utilizar FastAPI como framework HTTP.

FastAPI nos permite crear endpoints REST utilizand Python

```py
# Ejemplo:
# Crear un endpoint

@app.get("/coins/{coin_id}")
def get_coin(coin_id):
    ...
```

---

## 2. Instalar FastAPI

Desde: backend/

ejecuta:

```shell
pip install fastapi uvicorn
```

# Después actualiza:

```shell
pip freeze > requirements.txt
```

⚠️ Como ya vimos anteriormente, pip freeze guarda todas las dependencias del entorno virtual. Para este proyecto de aprendizaje está bien, pero más adelante podemos separar dependencias directas de transitivas.

Comprueba:

```shell
pip show fastapi
pip show uvicorn
```

---

## 3. Nuevas estructura

Vamos a agregar la carpeta `api` para las peticiones HTTP

```text
app/
│
├── api/
│   ├── __init__.py
│   ├── coingecko_client.py
│   └── app.py
│
├── controllers/
│   ├── coin_controller.py
│   ├── favorite_controller.py
│   └── price_history_controller.py
│
├── services/
├── repositories/
├── models/
├── database/
├── config/
├── exceptions/
│
├── container.py
└── main.py
```

Pero hay una consideracion importante:

`coingecko_client.py` y la `API HTTP` son conceptos diferentes.

Actualmente `app/api/coingecko_client.py` representa el cliente que consume CoinGecko

No debemos mezclar con FastAPI

Por eso podemos mantenerlo ahi inicialmente y crear otro modulo para nuestra aplicacion HTTP.

## 4. Crear `app/api/app.py`

CODIGO: [app.py](../backend/app/api/app.py)

5. Crear app/api/app.py

Crea:

app/api/app.py

con:

from fastapi import FastAPI

app = FastAPI(
title="Crypto Tracker API",
description="API para gestionar criptomonedas, favoritos e historial de precios.",
version="1.0.0"
)

Aquí estamos creando nuestra aplicación FastAPI.

6. ¿Por qué se llama app?

Tenemos:

app = FastAPI(...)

y luego podremos ejecutar:

uvicorn app.api.app:app --reload

La estructura:

app.api.app:app

significa:

app/
└── api/
└── app.py
└── app

Es decir:

<modulo>:<variable> 7. Probar FastAPI

Desde:

backend/

ejecuta:

uvicorn app.api.app:app --reload

Deberías ver algo similar a:

INFO: Uvicorn running on http://127.0.0.1:8000

Ahora abre:

http://127.0.0.1:8000

Todavía no tenemos ningún endpoint, por lo que veremos:

{
"detail": "Not Found"
}

Esto es correcto.

FastAPI está funcionando.

8. Crear nuestro primer endpoint

Modifica:

app/api/app.py

para:

from fastapi import FastAPI

app = FastAPI(
title="Crypto Tracker API",
description="API para gestionar criptomonedas, favoritos e historial de precios.",
version="1.0.0"
)

@app.get("/")
def root():

    return {
        "success": True,
        "message": "Crypto Tracker API funcionando."
    }

Ahora reinicia automáticamente gracias a --reload.

Visita:

http://127.0.0.1:8000/

Deberías obtener:

{
"success": true,
"message": "Crypto Tracker API funcionando."
} 9. Documentación automática

Una de las ventajas importantes de FastAPI es que genera documentación automáticamente.

Abre:

http://127.0.0.1:8000/docs

Ahí aparecerá Swagger UI.

También tenemos:

http://127.0.0.1:8000/redoc

Esto nos permite probar nuestros endpoints sin Postman inicialmente.

10. Primer endpoint real

Ahora podemos empezar a utilizar nuestro CoinController.

Actualmente tenemos:

CoinController
↓
CoinService
↓
CoinGeckoClient +
CoinRepository

Por lo tanto, FastAPI debería comunicarse con el Controller.

No debemos colocar SQL ni llamadas a CoinGecko directamente dentro del endpoint.

La dirección correcta es:

FastAPI
↓
Controller
↓
Service
↓
Repository / API 11. Inyección del Container

Ya tenemos:

container = Container()

El Container conoce todas nuestras dependencias.

Podemos aprovecharlo para crear el Controller.

Por ejemplo:

from fastapi import FastAPI

from app.container import Container

app = FastAPI(
title="Crypto Tracker API",
description="API para gestionar criptomonedas, favoritos e historial de precios.",
version="1.0.0"
)

container = Container()

Ahora nuestra aplicación HTTP tiene acceso al Container.

12. Endpoint para sincronizar una moneda

Suponiendo que nuestro Controller tiene:

update_coin(coin_id)

podemos crear:

@app.post("/coins/{coin_id}")
def update_coin(coin_id: str):

    return container.coin_controller.update_coin(coin_id)

Entonces:

POST /coins/bitcoin

terminará ejecutando:

FastAPI
↓
container.coin_controller
↓
CoinController.update_coin()
↓
CoinService.update_coin()
↓
CoinGeckoClient
↓
CoinRepository
↓
MySQL 13. Probar

Con el servidor ejecutándose:

uvicorn app.api.app:app --reload

podemos ir a:

http://127.0.0.1:8000/docs

Swagger debería mostrar:

POST /coins/{coin_id}

Seleccionamos:

Try it out

y:

coin_id = bitcoin

Ejecutamos.

La respuesta debería ser similar a:

{
"success": true,
"message": "Moneda sincronizada correctamente.",
"data": {
"id": "bitcoin",
"symbol": "btc",
"name": "Bitcoin",
"market_cap_rank": 1
}
}

Dependiendo de cómo esté implementado actualmente tu Controller, data podría aparecer con otra representación.

14. Algo importante que acabamos de descubrir

Aquí aparece un problema que hasta ahora no era relevante.

Nuestro Controller devuelve:

{
"success": True,
"message": "...",
"data": coin
}

pero coin es un objeto:

Coin(...)

FastAPI necesita convertir ese objeto a JSON.

Por eso no vamos a solucionar esto metiendo lógica de serialización dentro del Service.

En los siguientes módulos introduciremos modelos de respuesta / schemas para controlar correctamente:

Python Object
↓
Response Schema
↓
JSON

Esto será importante cuando empecemos a construir una API REST más seria.

15. Arquitectura después del módulo 37

Ahora tenemos:

                    HTTP
                     │
                     ▼
                ┌─────────┐
                │ FastAPI │
                └────┬────┘
                     │
                     ▼
              ┌─────────────┐
              │ Controllers │
              └──────┬──────┘
                     │
                     ▼
               ┌──────────┐
               │ Services │
               └────┬─────┘
                    │
             ┌──────┴──────┐
             ▼             ▼
       Repositories    CoinGecko
             │
             ▼
           MySQL

Esto ya se parece mucho más a un backend real.

16. Qué NO hacemos todavía

No vamos a introducir todavía:

JWT
autenticación
bcrypt
middleware
CORS
paginación
schemas complejos
Docker
async/await
tests HTTP avanzados

Primero queremos conseguir una API REST básica funcionando correctamente.

17. Resultado esperado

Al terminar este módulo deberíamos poder ejecutar:

uvicorn app.api.app:app --reload

y acceder a:

http://127.0.0.1:8000/

y:

http://127.0.0.1:8000/docs

Además:

POST /coins/bitcoin

deberá pasar por:

FastAPI
→ Controller
→ Service
→ CoinGecko
→ Repository
→ MySQL

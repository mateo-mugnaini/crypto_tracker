# Módulo 37 - Introducción a FastAPI y API REST

## Objetivo

Introducir una capa HTTP en el backend utilizando **FastAPI** y **Uvicorn**, permitiendo acceder a la lógica existente mediante endpoints REST.

Hasta este módulo, el proyecto funcionaba principalmente mediante scripts Python y `main.py`.

A partir de este módulo, el backend puede recibir peticiones HTTP.

---

# 1. FastAPI

FastAPI es un framework de Python utilizado para construir APIs HTTP.

Permite definir endpoints mediante decoradores:

```python
@app.get("/")
def root():
    ...
```

o:

```python
@app.post("/coins/{coin_id}")
def update_coin(coin_id: str):
    ...
```

FastAPI también genera documentación automática mediante OpenAPI.

---

# 2. Uvicorn

Uvicorn es el servidor ASGI utilizado para ejecutar nuestra aplicación FastAPI.

El backend se inicia mediante:

```powershell
uvicorn app.api.app:app --reload
```

La opción:

```text
--reload
```

hace que el servidor se reinicie automáticamente cuando detecta cambios en el código durante el desarrollo.

---

# 3. Aplicación FastAPI

Se creó:

```text
app/api/app.py
```

Este archivo contiene la instancia principal de FastAPI:

```python
from fastapi import FastAPI

app = FastAPI(
    title="Crypto Tracker API",
    description="API para gestionar criptomonedas, favoritos e historial de precios.",
    version="1.0.0"
)
```

La variable:

```python
app
```

es la aplicación que posteriormente utiliza Uvicorn.

---

# 4. Primer endpoint

Se creó un endpoint raíz:

```python
@app.get("/")
def root():

    return {
        "success": True,
        "message": "Crypto Tracker API funcionando."
    }
```

Permite comprobar rápidamente que la API está funcionando.

Petición:

```http
GET /
```

Respuesta:

```json
{
    "success": true,
    "message": "Crypto Tracker API funcionando."
}
```

---

# 5. Documentación automática

FastAPI genera automáticamente documentación interactiva.

Swagger UI:

```text
http://127.0.0.1:8000/docs
```

ReDoc:

```text
http://127.0.0.1:8000/redoc
```

Estas herramientas permiten consultar y probar los endpoints de la aplicación.

---

# 6. Integración con Container

El proyecto ya disponía de un `Container` encargado de construir las dependencias:

```text
Container
│
├── API Client
├── Repositories
├── Services
└── Controllers
```

La aplicación FastAPI utiliza el Container para acceder a los Controllers.

Conceptualmente:

```python
container = Container()
```

Esto evita crear manualmente todas las dependencias dentro de cada endpoint.

---

# 7. Endpoint de sincronización de monedas

Se agregó un endpoint para sincronizar una criptomoneda:

```http
POST /coins/{coin_id}
```

Por ejemplo:

```http
POST /coins/bitcoin
```

El endpoint delega la operación al:

```text
CoinController
```

El flujo completo es:

```text
HTTP Request
     ↓
FastAPI
     ↓
CoinController
     ↓
CoinService
     ↓
CoinGeckoClient
     ↓
CoinMapper
     ↓
CoinRepository
     ↓
MySQL
```

Esto mantiene separadas las responsabilidades de cada capa.

---

# 8. Controller

El Controller continúa siendo responsable de recibir la operación y delegarla al Service.

No contiene:

* SQL
* llamadas directas a MySQL
* lógica de CoinGecko
* lógica de negocio compleja

Su responsabilidad es actuar como intermediario entre HTTP y la capa de servicios.

---

# 9. Resultado probado

La aplicación se levantó correctamente mediante:

```powershell
uvicorn app.api.app:app --reload
```

Posteriormente se realizó una petición al endpoint:

```http
POST /coins/bitcoin
```

La respuesta obtenida fue:

```json
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
```

Esto confirma que la integración HTTP está funcionando correctamente.

---

# 10. Serialización

El Controller devuelve un objeto `Coin` dentro de:

```python
{
    "success": True,
    "message": "...",
    "data": coin
}
```

FastAPI consiguió convertir el objeto a una representación JSON:

```json
{
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "market_cap_rank": 1
}
```

En módulos posteriores se introducirá una solución más explícita mediante **schemas de respuesta**, para definir exactamente qué estructura puede devolver cada endpoint.

---

# 11. Arquitectura actual

Después de este módulo, la arquitectura queda:

```text
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
```

---

# 12. Responsabilidades

## FastAPI

Gestiona:

* Peticiones HTTP
* Rutas
* Métodos HTTP
* Respuestas HTTP
* Documentación OpenAPI

## Controllers

Gestionan:

* Entrada procedente de HTTP
* Delegación hacia Services
* Respuesta al cliente

## Services

Gestionan:

* Lógica de negocio
* Reglas de aplicación
* Coordinación entre repositories y APIs externas

## Repositories

Gestionan:

* Acceso a MySQL
* Consultas SQL
* Persistencia

## CoinGeckoClient

Gestiona:

* Comunicación con CoinGecko
* Peticiones HTTP externas

---

# 13. Dependencias nuevas

Se agregaron:

```text
fastapi
uvicorn
```

Estas dependencias deben quedar registradas en:

```text
requirements.txt
```

mediante:

```powershell
pip freeze > requirements.txt
```

---

# 14. Estado del proyecto

Antes del módulo:

```text
Python
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
MySQL
```

Después del módulo:

```text
HTTP
  ↓
FastAPI
  ↓
Controllers
  ↓
Services
  ↓
Repositories
  ↓
MySQL
```

El backend ya dispone de una primera capa HTTP funcional.

---

# 15. Próximo paso

El siguiente paso será mejorar la estructura de entrada y salida de la API.

Actualmente devolvemos directamente nuestros modelos de dominio.

Esto funciona, pero no es la solución ideal para una API profesional.

El siguiente concepto será introducir **schemas de API / response models**, permitiendo definir explícitamente:

```text
Request
   ↓
Schema
   ↓
Controller
   ↓
Service
   ↓
Schema
   ↓
JSON Response
```

Esto permitirá validar entradas y controlar exactamente la estructura de las respuestas.

---

## Estado del módulo

**Módulo 37: COMPLETADO**

Se consiguió:

* FastAPI funcionando.
* Uvicorn funcionando.
* Aplicación HTTP creada.
* Endpoint raíz creado.
* Swagger disponible.
* ReDoc disponible.
* Container integrado.
* CoinController conectado.
* Endpoint `POST /coins/{coin_id}` funcionando.
* CoinGecko integrado con la API HTTP.
* MySQL integrado con el flujo HTTP.
* Respuesta JSON verificada correctamente.

# Módulo 38 - Endpoints de consulta de monedas

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

En este módulo integramos los métodos de consulta de monedas con la API HTTP utilizando FastAPI.

El objetivo es exponer mediante endpoints REST las funcionalidades que ya existen en:

- CoinController
- CoinService
- CoinRepository
- CoinGeckoClient

De esta forma, el proyecto deja de depender únicamente de scripts Python y comienza a ofrecer una API HTTP funcional.

---

## 1. Flujo de una petición HTTP

La arquitectura utilizada es:

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

Cuando la información necesita actualizarse desde CoinGecko:

    Cliente HTTP
          ↓
       FastAPI
          ↓
      Controller
          ↓
       Service
          ↓
    CoinGeckoClient
          ↓
      CoinGecko API
          ↓
       Service
          ↓
      Repository
          ↓
        MySQL

---

## 2. Endpoint GET /coins

Se creó un endpoint para consultar las monedas:

    GET /coins

Este endpoint utiliza:

    CoinController.get_all_coins()

El Controller delega la operación al:

    CoinService.get_all_coins()

El Service obtiene las monedas desde CoinGecko mediante:

    CoinGeckoClient.get_market_coins()

Posteriormente cada moneda se transforma mediante:

    CoinMapper.to_coin()

y se sincroniza con MySQL.

---

## 3. Respuesta del endpoint

Una respuesta exitosa tiene la siguiente estructura:

```json
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
```

La propiedad data contiene una lista de objetos Coin.

4. Endpoint GET /coins/{coin_id}

También se implementó la consulta de una moneda específica:

GET /coins/{coin_id}

Ejemplo:

GET /coins/bitcoin

Este endpoint permite consultar una moneda concreta utilizando su identificador.

5. Flujo de GET /coins/{coin_id}

El flujo es:

GET /coins/bitcoin
↓
CoinController
↓
CoinService
↓
CoinRepository
↓
MySQL
↓
Coin model
↓
JSON response

La respuesta obtenida fue:

{
"success": true,
"message": "Moneda encontrada correctamente.",
"data": {
"id": "bitcoin",
"symbol": "btc",
"name": "Bitcoin",
"market_cap_rank": 1
}
} 6. Diferencia entre consultar y sincronizar

El proyecto actualmente tiene dos operaciones relacionadas con monedas.

Consultar una moneda
GET /coins/{coin_id}

Consulta la información almacenada en MySQL.

Ejemplo:

GET /coins/bitcoin
Sincronizar una moneda
POST /coins/{coin_id}

Ejemplo:

POST /coins/bitcoin

Esta operación consulta CoinGecko y posteriormente actualiza o inserta la moneda en MySQL.

El flujo es:

CoinGecko
↓
CoinMapper
↓
CoinRepository
↓
MySQL

Si la moneda ya existe:

repository.update()

Si no existe:

repository.save() 7. Endpoints actuales

Al finalizar este módulo tenemos:

Método Endpoint Función
GET / Comprobar que la API funciona
GET /coins Obtener monedas
GET /coins/{coin_id} Obtener una moneda
POST /coins/{coin_id} Sincronizar una moneda 8. Pruebas realizadas
GET /coins

Se realizó una petición:

GET http://127.0.0.1:8000/coins

Resultado:

{
"success": true,
"message": "Monedas obtenidas correctamente.",
"data": [
{
"id": "bitcoin",
"symbol": "btc",
"name": "Bitcoin",
"market_cap_rank": 1
}
]
}

La API devolvió correctamente las monedas obtenidas desde CoinGecko y sincronizadas con MySQL.

GET /coins/bitcoin

Se realizó:

GET http://127.0.0.1:8000/coins/bitcoin

Resultado:

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

La consulta funcionó correctamente.

9. Arquitectura actual

La aplicación comienza a tener una arquitectura HTTP completa:

FastAPI
↓
Controllers
↓
Services
↓
Repositories
↓
MySQL

Y para las operaciones que requieren información externa:

FastAPI
↓
Controllers
↓
Services
↓
CoinGeckoClient
↓
CoinGecko API

Esto mantiene separadas las responsabilidades.

10. Responsabilidad de cada capa
    FastAPI

Responsable de:

Recibir peticiones HTTP.
Definir rutas.
Devolver respuestas HTTP.
Gestionar parámetros de las peticiones.
Controllers

Responsables de:

Recibir los parámetros.
Invocar Services.
Construir la respuesta de la aplicación.
Manejar excepciones conocidas.

No deben ejecutar SQL.

Services

Responsables de:

Contener la lógica de negocio.
Coordinar APIs externas.
Coordinar repositories.
Decidir si una moneda debe insertarse o actualizarse.
Repositories

Responsables de:

Ejecutar consultas SQL.
Guardar información.
Buscar información.
Actualizar información.
Eliminar información. 11. Estado del proyecto

Después del módulo 38:

Implementado
Arquitectura por capas.
Models.
Repositories.
Services.
Controllers.
Container para Dependency Injection.
CoinGeckoClient.
FastAPI.
Endpoint raíz.
Consulta de monedas.
Consulta individual de monedas.
Sincronización de monedas.
Persistencia en MySQL.
Manejo básico de respuestas exitosas y errores.
Pendiente
Query parameters.
Paginación HTTP.
Validación de parámetros.
Endpoints de favoritos.
Endpoints de historial de precios.
Autenticación.
Manejo HTTP más completo.
Tests de endpoints FastAPI.
Documentación OpenAPI más detallada. 12. Conclusión

El proyecto ya no es únicamente una aplicación Python ejecutada desde consola.

Ahora dispone de una API HTTP funcional mediante FastAPI.

El flujo completo es:

HTTP Request
↓
FastAPI
↓
Controller
↓
Service
↓
Repository / API Client
↓
MySQL / CoinGecko
↓
Controller
↓
HTTP Response

Los endpoints de monedas fueron probados correctamente.

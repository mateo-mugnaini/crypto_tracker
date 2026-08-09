# Módulo 38 - Endpoints de consulta de monedas

## Objetivo

En este módulo integramos los métodos de consulta de monedas con la API HTTP utilizando FastAPI.

El objetivo es exponer mediante endpoints REST las funcionalidades que ya existen en:

- CoinController
- CoinService
- CoinRepository
- CoinGeckoClient

De esta forma, el proyecto deja de depender únicamente de scripts Python y comienza a ofrecer una API HTTP funcional.

---

# 1. Flujo de una petición HTTP

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

# 2. Endpoint GET /coins

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

# 3. Respuesta del endpoint

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

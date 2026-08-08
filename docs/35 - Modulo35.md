# Modulo 35 - PriceHistoryController

En este modulo vamos acompletar la capa de controllers con el flujo de historial de precios, reutilizdno lo que ya tenemos implementado.

La arquitectura sera:

```shell
Test
  ↓
PriceHistoryController
  ↓
PriceHistoryService
  ↓
CoinGeckoClient
  ↓
PriceHistoryRepository
  ↓
MySQL
```

## 1. Creamos `price_history_controller.py`


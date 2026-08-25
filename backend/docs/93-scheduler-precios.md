# Módulo 93 — Scheduler de actualización automática de precios

> **Estado:** IMPLEMENTADO Y VERIFICADO LOCALMENTE
> **Dependencia nueva:** ninguna

## Objetivo

Generar periódicamente registros de precio para las monedas almacenadas
localmente, de modo que el historial y el polling del frontend puedan recibir
datos nuevos sin una acción manual.

## Configuración

```dotenv
PRICE_UPDATE_ENABLED=false
PRICE_UPDATE_INTERVAL_SECONDS=300
```

El scheduler está desactivado por defecto. Para activarlo en un entorno local:

```dotenv
PRICE_UPDATE_ENABLED=true
PRICE_UPDATE_INTERVAL_SECONDS=300
```

Después de cambiar `.env`, hay que reiniciar Uvicorn.

## Flujo

```text
FastAPI lifespan
  ↓
PriceUpdateScheduler
  ↓ cada N segundos
CoinRepository.find_all()
  ↓ por cada moneda local
PriceHistoryService.update_current_price()
  ↓
CoinGecko /simple/price
  ↓
price_history
```

El primer ciclo se ejecuta al iniciar la tarea y los siguientes después del
intervalo configurado.

## Decisiones técnicas

- Se utiliza una tarea asyncio integrada al `lifespan` de FastAPI.
- Las operaciones bloqueantes de MySQL y `requests` se ejecutan mediante
  `asyncio.to_thread` para no bloquear el event loop.
- Un fallo individual se registra y no impide actualizar las demás monedas.
- El apagado cancela la tarea y espera su finalización.
- No se agregó APScheduler porque el caso actual es un ciclo simple y el
  proyecto recomienda un único worker.

## Limitaciones operativas

Con múltiples workers, cada proceso ejecutaría su propio scheduler y podría
duplicar registros. Para producción multiworker se deberá mover esta tarea a
un worker externo, cron, cola o scheduler distribuido.

## Verificación

```powershell
.\.venv\Scripts\python.exe -m pytest app/tests/unit/test_settings.py app/tests/unit/test_price_update_scheduler.py -q
```

Resultado: tests de configuración y scheduler correctos.

## Integración frontend

El frontend puede usar `VITE_MARKET_REFRESH_INTERVAL_MS` para releer el estado
del backend. Esa lectura no crea precios; los registros son responsabilidad de
este scheduler.

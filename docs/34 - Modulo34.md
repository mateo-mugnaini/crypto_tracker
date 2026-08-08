# Módulo 34 - CoinController

### Hasta ahora tenemos:

```shell
API
 ↓
Services
 ↓
Repositories
 ↓
Database
```

En el [modulo 33](33%20-%20Modulo33.md) introdujimos:

```shell
Controller
 ↓
Service
 ↓
Repository
 ↓
Database
```

Ahora vamos a aplicar el mismo concepto al dominio de `Coin`

> ### Objetivo
>
> Crear `coin_controller.py`
>
> El CoinController será responsonsable de recibir una solicitud
> relacionada con una moneda y delegar el trabajo a `CoinService`
>
> ⛔No debe:⛔
>
> - Ejecutar SQL.
> - Acceder directamente al repository.
> - Llamar directamente a CoinGecko.
> - Contener lógica de negocio.

Su responsabilidad será coordinar la operacion y devolver un resultado apropiado.

## 1. Estado actual

Ya tenemos `CoinService`:

VER CODIGO: [coin_service.py](../backend/app/services/coin_service.py)

## 2. Crear CoinController

VER CODIGO: [coin_controller.py](../backend/app/services/coin_service.py)

### ¿Qué está pasando?

El controller recibe solamente el service:

```py
def __init__(self, service):
    self.service = service
```

Por lo tanto:

```shell
CoinController
      ↓
CoinService
```

El controller no necesita saber cómo funciona MySQL ni CoinGecko.


## 3. Crear el test

CODIGO: [coin_controller.py](../backend/app/controllers/)

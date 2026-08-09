# Módulo 33 - Capa de Controllers

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

Introducir la capa de Controllers en la arquitectura del proyecto.

Hasta este punto, el proyecto contaba con:

- Models
- Repositories
- Services
- API Client
- Database
- Configuración
- Exceptions

La carpeta `app/controllers/` existía, pero estaba vacía.

En este módulo incorporamos los Controllers como una capa intermedia entre la entrada de datos y los Services.

---

## ¿Qué es un Controller?

Un Controller es responsable de recibir una operación, preparar los datos necesarios y delegar la ejecución al Service correspondiente.

Su responsabilidad principal es coordinar la interacción entre:

```text
Entrada
   ↓
Controller
   ↓
Service
   ↓
Repository
   ↓
Database
```

El Controller NO debe:

Ejecutar SQL.
Acceder directamente a MySQL.
Contener lógica de negocio.
Consultar directamente CoinGecko.
Manipular conexiones de base de datos.

La lógica de negocio continúa perteneciendo a los Services.

Arquitectura actual

La arquitectura del proyecto ahora queda:

                    ┌─────────────────┐
                    │     Entrada     │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   Controller   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │     Service    │
                    └────────┬────────┘
                             │
                  ┌──────────┴──────────┐
                  ▼                     ▼
          ┌──────────────┐      ┌──────────────┐
          │ Repository   │      │  API Client  │
          └──────┬───────┘      └──────────────┘
                 │
                 ▼
          ┌──────────────┐
          │    MySQL     │
          └──────────────┘

FavoriteController

Se comenzó utilizando Favorites como primera implementación de Controller porque es actualmente uno de los Services con mayor cantidad de lógica de negocio.

El Controller recibe:

FavoriteService

y delega las operaciones al Service.

Ejemplo conceptual:

class FavoriteController:

    def __init__(self, service):
        self.service = service

Responsabilidad del Controller

Para agregar un favorito:

FavoriteController
↓
FavoriteService.add_favorite()
↓
Validar usuario
↓
Validar moneda
↓
Validar duplicado
↓
FavoriteRepository.save()
↓
MySQL

El Controller no realiza ninguna de esas validaciones.

Simplemente delega.

Resultado del Controller

Para facilitar una futura integración HTTP, el Controller puede transformar el resultado del Service en una estructura sencilla:

{
"success": True,
"message": "Favorito agregado correctamente."
}

Esto permitirá posteriormente conectar el Controller con una API REST sin tener que modificar la lógica de negocio.

Integración con CoinService

Durante este módulo se detectó que la base de datos solamente contenía algunas monedas previamente sincronizadas.

Esto permitió comprobar la diferencia entre:

CoinGecko API

y

MySQL

CoinGecko puede devolver monedas que todavía no existen en nuestra base de datos.

Por eso se utilizó el flujo:

CoinGecko
↓
CoinGeckoClient
↓
CoinService
↓
CoinMapper
↓
CoinRepository
↓
MySQL

El método CoinService.update_coin() permite sincronizar una moneda individual.

Sincronización de monedas

Se comprobó también que la API de CoinGecko funciona correctamente mediante:

python -m app.tests.coingecko_market_test

Resultado:

Monedas obtenidas: 10

bitcoin | btc | Bitcoin
ethereum | eth | Ethereum
tether | usdt | Tether
binancecoin | bnb | BNB
usd-coin | usdc | USDC
ripple | xrp | XRP
solana | sol | Solana
tron | trx | TRON
figure-heloc | figr_heloc | Figure Heloc
hyperliquid | hype | Hyperliquid

Posteriormente se creó/probó la sincronización de monedas:

python -m app.tests.sync_coins_test

Resultado:

Monedas sincronizadas: 10

Esto permitió comprobar que las monedas obtenidas desde CoinGecko pueden persistirse en MySQL.

CoinMapper

El CoinMapper transforma la respuesta de CoinGecko en un objeto Coin.

class CoinMapper:

    @staticmethod
    def to_coin(data: dict) -> Coin:

        return Coin(
            id=data["id"],
            symbol=data["symbol"],
            name=data["name"],
            market_cap_rank=data.get("market_cap_rank"),
        )

El flujo es:

CoinGecko response
↓
CoinMapper
↓
Coin
↓
CoinRepository
Pruebas realizadas
Agregar favorito

Se verificó que una moneda previamente sincronizada puede agregarse a favoritos.

Resultado:

{
'success': True,
'message': 'Favorito agregado correctamente.'
}
Favorito duplicado

También se comprobó que el sistema detecta cuando el favorito ya existe.

Resultado:

La moneda ya está en favoritos.

Esto evita el error de clave primaria compuesta:

Duplicate entry '1-bitcoin' for key 'favorites.PRIMARY'

La tabla favorites utiliza:

PRIMARY KEY (user_id, coin_id)

Por lo tanto, un usuario no puede tener dos veces la misma moneda como favorita.

Eliminación de favoritos

Se actualizó el test de eliminación para utilizar la arquitectura actual:

FavoriteController
↓
FavoriteService
↓
FavoriteRepository
↓
MySQL

El test verifica tres escenarios:

1. Intentar agregar un favorito existente

Resultado:

La moneda ya está en favoritos. 2. Eliminar el favorito

Resultado:

Favorito eliminado correctamente. 3. Intentar eliminarlo nuevamente

Resultado:

La moneda no está en favoritos.

Esto demuestra que remove_favorite() no intenta eliminar registros inexistentes silenciosamente.

FavoriteService

El Service actual recibe tres repositories:

FavoriteService(
favorite_repository,
user_repository,
coin_repository
)

Esto permite validar:

Que el usuario exista.
Que la moneda exista.
Que la moneda no esté ya en favoritos.
Guardar el favorito.
Verificar la existencia antes de eliminar.
Eliminar el favorito.
Responsabilidades por capa
Capa Responsabilidad
Controller Coordinar la operación
Service Lógica de negocio
Repository Acceso a MySQL
Model Representación de entidades
API Client Comunicación con CoinGecko
Database Conexión con MySQL
Flujo completo de agregar favorito
Usuario
↓
FavoriteController
↓
FavoriteService
↓
¿Existe usuario?
↓
¿Existe moneda?
↓
¿Ya es favorito?
↓
FavoriteRepository
↓
MySQL
Flujo completo de eliminar favorito
Usuario
↓
FavoriteController
↓
FavoriteService
↓
¿Existe el favorito?
↓
FavoriteRepository.delete()
↓
MySQL

Si no existe:

No tienes esta moneda en favoritos.

Si existe:

Favorito eliminado correctamente.

Estado del módulo
Completado
Introducción de Controllers.
Creación de FavoriteController.
Integración Controller → Service.
Separación de responsabilidades.
Prueba de agregado de favoritos.
Validación de duplicados.
Prueba de eliminación.
Validación de favorito inexistente.
Verificación de sincronización CoinGecko → MySQL.
Verificación de CoinMapper.
Verificación de CoinService.
Confirmación de funcionamiento de la clave primaria compuesta de favorites.
Resultado

El proyecto ahora cuenta con una primera capa de Controllers funcional.

La arquitectura principal queda:

Controller
↓
Service
↓
Repository
↓
Database

y para datos externos:

Service
↓
CoinGeckoClient
↓
CoinGecko API

El backend continúa funcionando sin una capa HTTP real.

Los Controllers se ejecutan actualmente mediante scripts de prueba.

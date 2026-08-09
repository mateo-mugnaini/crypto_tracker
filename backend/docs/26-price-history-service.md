# Módulo 26 - Price History Service

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

En este módulo incorporamos un servicio dedicado a registrar el historial de precios de las criptomonedas.

A diferencia de la tabla `coins`, donde se almacena información relativamente estable de cada moneda, la tabla `price_history` conserva un registro histórico de todos los precios obtenidos a lo largo del tiempo.

---

## ¿Por qué existe `price_history`?

El precio de una criptomoneda cambia constantemente.

Si actualizáramos siempre el mismo registro, perderíamos el historial de su evolución.

Por ejemplo, en lugar de sobrescribir el precio:

```text
Bitcoin
65000
```

queremos conservar cada medición:

```text
08:00 → 65000

09:00 → 65120

10:00 → 64980

11:00 → 65230
```

Cada fila representa un instante diferente.

---

## Arquitectura

El flujo para registrar un precio queda así:

```text
CoinGecko API

↓

CoinGeckoClient

↓

PriceHistoryService

↓

PriceHistoryRepository

↓

MySQL
```

Cada componente mantiene una única responsabilidad.

---

## PriceHistoryService

El servicio recibe sus dependencias mediante el constructor.

```python
class PriceHistoryService:

    def __init__(self, repository, api_client):
        self.repository = repository
        self.api_client = api_client
```

Esto mantiene el código desacoplado y facilita las pruebas.

---

## Método `update_price()`

El método realiza los siguientes pasos:

1. Solicita la información de la moneda a CoinGecko.
2. Verifica que la respuesta sea válida.
3. Obtiene el precio actual en USD.
4. Crea un objeto `PriceHistory`.
5. Lo guarda mediante el Repository.
6. Devuelve el objeto creado.

El flujo es:

```text
Coin ID

↓

CoinGeckoClient

↓

Respuesta JSON

↓

Extraer current_price.usd

↓

Crear PriceHistory

↓

Repository.save()

↓

MySQL
```

---

## Manejo de errores

Si la API no devuelve información para la moneda solicitada, el servicio lanza una excepción.

Ejemplo:

```python
raise CoinGeckoException(
    f"No se pudo obtener la moneda '{coin_id}'."
)
```

De esta forma la aplicación puede manejar correctamente el error sin finalizar inesperadamente.

---

## El campo `id`

La tabla `price_history` utiliza un `AUTO_INCREMENT`.

Por ese motivo, al crear el objeto desde Python se utiliza:

```python
PriceHistory(
    id=None,
    coin_id=coin_id,
    price=price,
    recorded_at=datetime.now()
)
```

MySQL será el encargado de generar el identificador automáticamente durante el `INSERT`.

---

## Diferencia entre `coins` y `price_history`

La tabla `coins` representa el estado actual de cada criptomoneda.

La tabla `price_history` representa una serie temporal de precios.

```text
coins

bitcoin
ethereum
solana
```

↓

```text
price_history

bitcoin 65000

bitcoin 65150

bitcoin 64980

ethereum 3800

ethereum 3812
```

Mientras que una moneda existe una sola vez en `coins`, puede tener miles de registros en `price_history`.

---

## Restricción importante

La tabla `price_history` posee una clave foránea (`FOREIGN KEY`) hacia la tabla `coins`.

Esto significa que no es posible guardar el historial de una moneda que todavía no exista en `coins`.

Por ejemplo:

```text
coins

bitcoin
ethereum
```

Intentar guardar:

```text
price_history

usdt
```

producirá un error de integridad referencial si `usdt` aún no fue registrada en la tabla `coins`.

Esta restricción garantiza la consistencia de la base de datos.

---

## Responsabilidades

Cada componente mantiene una única función.

- **CoinGeckoClient:** obtiene información desde la API.
- **PriceHistoryService:** coordina la lógica de negocio.
- **PriceHistoryRepository:** guarda y consulta registros.
- **MySQL:** persiste los datos.

Esta separación facilita el mantenimiento y la evolución del proyecto.

---

## Estado del proyecto

Después de este módulo el backend ya dispone de:

- Configuración mediante `.env`.
- Cliente para la API de CoinGecko.
- Modelos del dominio.
- Repositories.
- Services.
- Persistencia en MySQL.
- Historial de precios.
- Arquitectura por capas.

La aplicación ya es capaz de consultar el precio actual de una criptomoneda y almacenar cada consulta como un nuevo registro histórico.

---

## Próximo módulo

En el siguiente módulo continuaremos ampliando la lógica de negocio, integrando nuevos servicios y mejorando la coordinación entre las distintas capas de la aplicación.

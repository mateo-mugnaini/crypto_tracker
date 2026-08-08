# Módulo 34 - CoinController

## Objetivo

Introducir la capa **Controllers** en la arquitectura del proyecto.

El Controller actúa como intermediario entre la entrada de una operación y la capa de Services.

Su responsabilidad es:

- Recibir los parámetros necesarios.
- Delegar la operación al Service.
- Capturar errores de negocio conocidos.
- Devolver una respuesta estructurada.
- No ejecutar SQL.
- No acceder directamente a la API externa.
- No contener lógica de negocio.

---

## Arquitectura

El flujo implementado es:

```text
Test / futura API
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

El Controller no conoce los detalles de implementación de las capas inferiores.

---

## CoinController

Archivo:

```text
app/controllers/coin_controller.py
```

Implementación:

```python
from app.exceptions.api_exception import CoinGeckoException


class CoinController:

    def __init__(self, service):
        self.service = service

    def update_coin(self, coin_id):

        try:
            coin = self.service.update_coin(coin_id)

            return {
                "success": True,
                "message": "Moneda sincronizada correctamente.",
                "data": coin
            }

        except CoinGeckoException as error:

            return {
                "success": False,
                "message": str(error),
                "data": None
            }
```

---

## Inyección de dependencias

El Controller recibe el Service mediante su constructor:

```python
def __init__(self, service):
    self.service = service
```

Esto evita que el Controller cree directamente un `CoinService`.

Por ejemplo:

```python
controller = CoinController(service)
```

Esta estrategia permite cambiar o sustituir el Service fácilmente durante los tests.

---

## Responsabilidad del Controller

El método:

```python
update_coin(coin_id)
```

no implementa la lógica para consultar CoinGecko.

Simplemente delega:

```python
coin = self.service.update_coin(coin_id)
```

El Service continúa siendo responsable de:

1. Consultar CoinGecko.
2. Transformar los datos mediante `CoinMapper`.
3. Comprobar si la moneda existe.
4. Actualizarla o crearla.
5. Devolver el objeto `Coin`.

El Controller solamente transforma el resultado en una respuesta estructurada.

---

## Manejo de errores

El Controller captura:

```python
CoinGeckoException
```

Cuando ocurre un error:

```python
return {
    "success": False,
    "message": str(error),
    "data": None
}
```

Cuando la operación tiene éxito:

```python
return {
    "success": True,
    "message": "Moneda sincronizada correctamente.",
    "data": coin
}
```

Esto establece un formato consistente para las respuestas.

---

## Test

Archivo:

```text
app/tests/coin_controller_test.py
```

El test instancia las dependencias necesarias y ejecuta el Controller.

Resultado obtenido:

```text
{
    'success': True,
    'message': 'Moneda sincronizada correctamente.',
    'data': <app.models.coin.Coin object at ...>
}
```

Esto confirma que el flujo completo funciona correctamente.

---

## Observación sobre `data`

Actualmente `data` contiene directamente un objeto:

```text
<app.models.coin.Coin object at ...>
```

Esto es correcto para esta etapa del proyecto.

Posteriormente, cuando se implemente una API HTTP/REST, será necesario transformar el objeto a una estructura serializable, por ejemplo:

```python
{
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "market_cap_rank": 1
}
```

Ese problema pertenece a una etapa posterior y no forma parte todavía de este módulo.

---

## Conceptos aprendidos

- Controller.
- Separación de responsabilidades.
- Inyección de dependencias.
- Delegación hacia Services.
- Manejo de excepciones.
- Respuestas estructuradas.
- Integración Controller → Service.
- Preparación de la arquitectura para una futura API HTTP.

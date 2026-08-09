# Módulo 35 - PriceHistoryController

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

Crear el Controller encargado de gestionar las operaciones relacionadas con el historial de precios.

El Controller actúa como intermediario entre la entrada de datos y el Service.

La arquitectura utilizada es:

```text
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

---

## 1. ¿Qué es un Controller?

Un Controller es una capa encargada de recibir una petición, delegar el trabajo correspondiente a un Service y devolver una respuesta estructurada.

Su responsabilidad no es ejecutar SQL ni contener la lógica de negocio.

En nuestro proyecto:

```text
Controller
    ↓
Service
    ↓
Repository
```

El Controller conoce al Service, pero no necesita conocer cómo se almacenan los datos en MySQL.

---

## 2. PriceHistoryController

Archivo:

```text
app/controllers/price_history_controller.py
```

Implementación:

```python
from app.exceptions.api_exception import CoinGeckoException


class PriceHistoryController:

    def __init__(self, service):
        self.service = service

    def update_price(self, coin_id):

        try:
            history = self.service.update_price(coin_id)

            return {
                "success": True,
                "message": "Precio actualizado correctamente",
                "data": history
            }

        except CoinGeckoException as error:

            return {
                "success": False,
                "message": str(error),
                "data": None
            }
```

---

## 3. Inyección del Service

El Controller recibe el Service mediante su constructor:

```python
def __init__(self, service):
    self.service = service
```

Esto permite mantener desacopladas las capas.

El Controller no crea directamente:

```python
PriceHistoryService(...)
```

sino que recibe una instancia preparada desde fuera.

Esto facilita posteriormente realizar testing y reemplazar implementaciones.

---

## 4. Actualizar precio

El método principal es:

```python
def update_price(self, coin_id):
```

Recibe el identificador de la moneda.

Ejemplo:

```python
controller.update_price("bitcoin")
```

El Controller delega la operación:

```python
history = self.service.update_price(coin_id)
```

El Service se encarga entonces de:

1. Consultar CoinGecko.
2. Obtener el precio actual.
3. Crear un `PriceHistory`.
4. Guardar el registro mediante `PriceHistoryRepository`.
5. Devolver el objeto creado.

El Controller no participa en ninguna de estas operaciones internas.

---

## 5. Respuesta exitosa

Cuando el Service completa correctamente la operación, el Controller devuelve:

```python
{
    "success": True,
    "message": "Precio actualizado correctamente",
    "data": history
}
```

Esto establece una estructura común para las respuestas del Controller.

---

## 6. Manejo de errores

El Controller captura:

```python
CoinGeckoException
```

y transforma la excepción en una respuesta estructurada:

```python
{
    "success": False,
    "message": str(error),
    "data": None
}
```

Esto permite que una futura capa HTTP pueda convertir fácilmente esta respuesta en JSON.

---

## 7. Test

Archivo:

```text
app/tests/price_history_controller_test.py
```

El test utiliza las implementaciones reales:

```python
api_client = CoinGeckoClient()

repository = PriceHistoryRepository()

service = PriceHistoryService(
    repository,
    api_client
)

controller = PriceHistoryController(service)
```

Después ejecuta:

```python
result = controller.update_price("bitcoin")
```

---

## 8. Resultado de la prueba

Comando ejecutado:

```powershell
python -m app.tests.price_history_controller_test
```

Resultado:

```text
{
    'success': True,
    'message': 'Precio actualizado correctamente',
    'data': <app.models.price_history.PriceHistory object at ...>
}
```

Esto confirma que el flujo completo funciona correctamente:

```text
PriceHistoryController
        ↓
PriceHistoryService
        ↓
CoinGeckoClient
        ↓
PriceHistory
        ↓
PriceHistoryRepository
        ↓
MySQL
```

---

## 9. Responsabilidades

### Controller

Responsable de:

- Recibir parámetros.
- Invocar Services.
- Manejar excepciones de aplicación.
- Construir respuestas estructuradas.

### Service

Responsable de:

- Contener la lógica de negocio.
- Consultar la API.
- Crear entidades.
- Coordinar Repository y API Client.

### Repository

Responsable de:

- Ejecutar SQL.
- Guardar información.
- Consultar MySQL.

---

## 10. Estado del módulo

**Módulo 35: TERMINADO**

Implementado:

- `PriceHistoryController`.
- Método `update_price()`.
- Inyección de `PriceHistoryService`.
- Manejo de `CoinGeckoException`.
- Respuesta estructurada.
- Test de integración.
- Verificación contra CoinGecko.
- Persistencia del historial en MySQL.

Resultado:

```text
Módulo 35
    ↓
PriceHistoryController
    ↓
FUNCIONAL Y PROBADO
```

---

## 11. Arquitectura actual

Después de este módulo, la estructura de Controllers queda:

```text
app/
├── controllers/
│   ├── __init__.py
│   ├── coin_controller.py
│   ├── favorite_controller.py
│   └── price_history_controller.py
│
├── services/
│   ├── coin_service.py
│   ├── favorite_service.py
│   ├── price_history_service.py
│   ├── coin_mapper.py
│   └── coingecko_service.py
│
├── repositories/
│   ├── coin_repository.py
│   ├── user_repository.py
│   ├── favorite_repository.py
│   └── price_history_repository.py
│
├── models/
│   ├── coin.py
│   ├── user.py
│   ├── favorite.py
│   └── price_history.py
│
├── api/
│   └── coingecko_client.py
│
├── database/
│   └── connection.py
│
└── config/
    └── settings.py
```

La capa de Controllers queda completa para las tres operaciones principales del dominio:

- Coins.
- Favorites.
- Price History.

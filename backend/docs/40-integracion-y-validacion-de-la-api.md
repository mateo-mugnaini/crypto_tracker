# Módulo 40 - Historial de precios (`Price History`)

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

Implementar el módulo de **historial de precios** del proyecto Crypto Tracker.

El objetivo es permitir:

- Obtener el precio actual de una criptomoneda desde CoinGecko.
- Registrar ese precio en la base de datos.
- Asociar cada registro con una criptomoneda.
- Guardar la fecha y hora en la que se registró el precio.
- Consultar posteriormente el historial de precios de una criptomoneda.
- Exponer estas funcionalidades mediante la API de FastAPI.

---

## 1. Arquitectura

El módulo sigue la arquitectura utilizada en el resto del proyecto:

```text
FastAPI
   │
   ▼
Controller
   │
   ▼
Service
   │
   ├──────► CoinGeckoClient
   │
   ▼
Repository
   │
   ▼
MySQL
```

Cada capa tiene una responsabilidad concreta:

### Controller

Recibe la petición HTTP y devuelve una respuesta apropiada.

### Service

Contiene la lógica de negocio relacionada con el historial de precios.

### Repository

Se encarga de persistir y consultar los registros en MySQL.

### CoinGeckoClient

Se comunica con la API externa de CoinGecko.

---

## 2. Modelo `PriceHistory`

El historial utiliza el modelo:

```python
PriceHistory(
    id=None,
    coin_id=coin_id,
    price=price,
    recorded_at=datetime.now()
)
```

Cada registro representa el precio de una criptomoneda en un momento determinado.

Los datos principales son:

- `id`: identificador del registro.
- `coin_id`: ID de CoinGecko de la criptomoneda.
- `price`: precio registrado.
- `recorded_at`: fecha y hora del registro.

Esto permite construir posteriormente una serie temporal:

```text
Bitcoin

2026-08-01 10:00 → 110000
2026-08-01 11:00 → 110500
2026-08-01 12:00 → 109800
2026-08-01 13:00 → 111200
```

---

## 3. `CoinGeckoClient`

El cliente existente fue reutilizado para obtener la información actual de una moneda.

El método utilizado es:

```python
get_coin(coin_id)
```

Este método consulta:

```text
GET /coins/{coin_id}
```

y devuelve la información proporcionada por CoinGecko.

El precio se obtiene posteriormente desde:

```python
data["market_data"]["current_price"]["usd"]
```

De esta forma, el módulo Price History no necesita conocer los detalles HTTP de CoinGecko.

---

## 4. `PriceHistoryService`

Archivo:

```text
app/services/price_history_service.py
```

El servicio recibe:

```python
def __init__(self, repository, api_client):
    self.repository = repository
    self.api_client = api_client
```

Tiene dos dependencias:

- `PriceHistoryRepository`
- `CoinGeckoClient`

La operación principal es:

```python
update_price(coin_id)
```

El flujo es:

```text
coin_id
   │
   ▼
CoinGeckoClient
   │
   ▼
Obtener información de CoinGecko
   │
   ▼
Extraer current_price.usd
   │
   ▼
Crear PriceHistory
   │
   ▼
Repository.save()
   │
   ▼
MySQL
```

El precio se obtiene mediante:

```python
price = data["market_data"]["current_price"]["usd"]
```

Después se crea:

```python
history = PriceHistory(
    id=None,
    coin_id=coin_id,
    price=price,
    recorded_at=datetime.now()
)
```

Finalmente:

```python
self.repository.save(history)
```

y se devuelve el objeto creado.

---

## 5. `PriceHistoryRepository`

Archivo:

```text
app/repositories/price_history_repository.py
```

El repository contiene dos operaciones principales.

## `save()`

Guarda un nuevo registro:

```sql
INSERT INTO price_history
(
    coin_id,
    price,
    recorded_at
)
VALUES
(
    %s,
    %s,
    %s
)
```

Después realiza:

```python
connection.commit()
```

para confirmar la transacción.

---

## `find_by_coin()`

Permite recuperar el historial de una criptomoneda:

```python
find_by_coin(coin_id)
```

La consulta utilizada es:

```sql
SELECT *
FROM price_history
WHERE coin_id = %s
ORDER BY recorded_at DESC
```

Los resultados se devuelven como diccionarios gracias a:

```python
cursor = connection.cursor(dictionary=True)
```

El resultado tiene una estructura similar a:

```python
[
    {
        "id": 3,
        "coin_id": "bitcoin",
        "price": 110500,
        "recorded_at": "2026-08-01 12:00:00"
    },
    {
        "id": 2,
        "coin_id": "bitcoin",
        "price": 109800,
        "recorded_at": "2026-08-01 11:00:00"
    }
]
```

El orden descendente permite obtener primero los registros más recientes.

---

## 6. `PriceHistoryController`

Archivo:

```text
app/controllers/price_history_controller.py
```

El controller recibe el servicio mediante inyección:

```python
def __init__(self, service):
    self.service = service
```

Su operación principal es:

```python
update_price(coin_id)
```

El controller llama:

```python
history = self.service.update_price(coin_id)
```

y devuelve una respuesta consistente:

```python
{
    "success": True,
    "message": "Precio actualizado correctamente",
    "data": history
}
```

También maneja:

```python
CoinGeckoException
```

para devolver:

```python
{
    "success": False,
    "message": str(error),
    "data": None
}
```

---

## 7. Integración en `Container`

El módulo fue agregado al sistema de dependencias.

Se crea el repository:

```python
self.price_history_repository = PriceHistoryRepository()
```

Después el service:

```python
self.price_history_service = PriceHistoryService(
    self.price_history_repository,
    self.api_client
)
```

Finalmente el controller:

```python
self.price_history_controller = PriceHistoryController(
    self.price_history_service
)
```

La dependencia completa queda:

```text
CoinGeckoClient
       │
       ├──────────────┐
       │              │
       ▼              ▼
CoinService     PriceHistoryService
       │              │
       ▼              ▼
CoinController  PriceHistoryController
                      │
                      ▼
              PriceHistoryRepository
```

---

## 8. Endpoints

El módulo expone dos endpoints principales.

## Actualizar precio

```http
POST /coins/{coin_id}/price
```

Ejemplo:

```http
POST /coins/bitcoin/price
```

Flujo:

```text
FastAPI
   ↓
PriceHistoryController
   ↓
PriceHistoryService
   ↓
CoinGeckoClient
   ↓
CoinGecko
   ↓
PriceHistoryRepository
   ↓
MySQL
```

---

## Obtener historial

```http
GET /coins/{coin_id}/price-history
```

Ejemplo:

```http
GET /coins/bitcoin/price-history
```

Devuelve:

```json
{
  "success": true,
  "message": "Historial obtenido correctamente",
  "data": []
}
```

El historial se obtiene mediante:

```python
container.price_history_repository.find_by_coin(coin_id)
```

---

## 9. Validación de parámetros

Los endpoints utilizan `Path`:

```python
coin_id: str = Path(
    ...,
    min_length=1,
    description="ID de la criptomoneda en CoinGecko"
)
```

Esto garantiza que:

- `coin_id` sea obligatorio.
- Sea de tipo `str`.
- No pueda ser una cadena vacía.
- FastAPI genere automáticamente documentación para Swagger.

---

## 10. Tests manuales

Se crearon dos scripts de prueba.

## Service

Archivo:

```text
app/tests/price_history_service_test.py
```

El test crea manualmente:

```python
repository = PriceHistoryRepository()
api_client = CoinGeckoClient()

service = PriceHistoryService(
    repository,
    api_client
)
```

y ejecuta:

```python
history = service.update_price("bitcoin")
```

Esto permite comprobar:

```text
CoinGecko → Service → Repository → MySQL
```

---

## Controller

Archivo:

```text
app/tests/price_history_controller_test.py
```

El test construye:

```text
API Client
    ↓
Repository
    ↓
Service
    ↓
Controller
```

y ejecuta:

```python
result = controller.update_price("bitcoin")
```

Esto permite verificar la respuesta generada por la capa Controller.

---

## 11. Corrección importante en `app.py`

Durante la integración se detectó que los endpoints de Price History estaban duplicados.

Debe existir solamente una definición de:

```python
@app.post("/coins/{coin_id}/price")
```

y una definición de:

```python
@app.get("/coins/{coin_id}/price-history")
```

La versión final debe quedar conceptualmente así:

```python
@app.post("/coins/{coin_id}/price")
def update_coin_price(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda en CoinGecko",
    )
):
    return container.price_history_controller.update_price(coin_id)


@app.get("/coins/{coin_id}/price-history")
def get_price_history(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda en CoinGecko",
    )
):
    return container.price_history_controller.get_history(coin_id)
```

No deben coexistir dos handlers con el mismo método HTTP y path.

---

## 12. Flujo completo del módulo

El flujo para registrar un precio es:

```text
POST /coins/bitcoin/price
             │
             ▼
      FastAPI Endpoint
             │
             ▼
 PriceHistoryController
             │
             ▼
   PriceHistoryService
             │
       ┌─────┴─────┐
       ▼           ▼
CoinGeckoClient  Repository
       │
       ▼
   CoinGecko API
       │
       ▼
 current_price.usd
       │
       ▼
   PriceHistory
       │
       ▼
 Repository.save()
       │
       ▼
      MySQL
```

Para consultar:

```text
GET /coins/bitcoin/price-history
             │
             ▼
      FastAPI Endpoint
             │
             ▼
 PriceHistoryController
             │
             ▼
 PriceHistoryRepository
             │
             ▼
          MySQL
             │
             ▼
       Price history
```

---

## 13. Conceptos aprendidos

Con este módulo se incorporaron varios conceptos importantes:

### Series temporales

Un historial de precios es una colección de valores asociados a momentos concretos.

### Persistencia histórica

El precio actual obtenido de una API externa puede almacenarse para poder analizarlo posteriormente.

### Separación de responsabilidades

La API externa, la lógica de negocio y la persistencia permanecen separadas.

### Dependency Injection

El `Container` continúa centralizando la creación de dependencias.

### Repository Pattern

El acceso a MySQL queda encapsulado dentro de `PriceHistoryRepository`.

### Service Layer

La lógica de transformación de los datos de CoinGecko a `PriceHistory` pertenece al service.

### API REST

Se agregaron endpoints específicos para actualizar y consultar información histórica.

---

## 14. Estado del módulo

```text
[✓] PriceHistory model
[✓] CoinGecko integration
[✓] PriceHistoryService
[✓] PriceHistoryRepository
[✓] PriceHistoryController
[✓] Container integration
[✓] Save price history
[✓] Retrieve price history
[✓] FastAPI endpoints
[✓] Service test
[✓] Controller test
[✓] Duplicate endpoints removed
```

## Resultado

El proyecto ahora puede consultar el precio actual de una criptomoneda mediante CoinGecko y convertir cada consulta en un registro histórico persistido en MySQL.

Esto deja preparada la base para funcionalidades posteriores como:

- gráficos de precios;
- análisis de variación;
- máximos y mínimos;
- evolución temporal;
- estadísticas;
- alertas de precio;
- integración con un frontend.

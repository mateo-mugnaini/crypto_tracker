# Módulo 17 - Capa de Servicios (Service Layer)

Actualmente el flujo es algo parecido a:

```
Test
 |
 |
Repository
 |
 |
MySQL
```

Pero falta una capa importante:

```
Test
 |
 |
Service
 |
 |
Repository
 |
 |
MySQL
```

¿Por qué?

Porque el Repository solo debería sabes: `Cómo guardar y obtener datos de la base de datos`

El REPOSITORY no debe saber:

- Cuándo llamar a CoinGecko.
- Qué monedas buscar.
- Cómo transformar datos externos.
- Qué reglas aplicar.

Eso pertenece a la capa `Service`

---

### ¿Qué es im Service?

Un Service contiene la **lógica de negocio**

### Ejemplo

La aplicación deberia hacer

```shell
CryptoService
        |
        |
CoinGecko API
        |
        |
Convierte respuesta JSON
        |
        |
Crea objeto Coin
        |
        |
CoinRepository
        |
        |
Guarda en MySQL
```

### Nueva estructura:

```shell
backend
│
├── app
│   │
│   ├── config
│   │   └── settings.py
│   │
│   ├── database
│   │   └── connection.py
│   │
│   ├── models
│   │   └── coin.py
│   │
│   ├── repositories
│   │   └── coin_repository.py
│   │
│   ├── services
│   │   └── coin_service.py   <-- NUEVO
│   │
│   ├── api
│   │   └── coingecko_client.py
│   │
│   └── tests
│       └── service_test.py
```

---

### Crear los services

**¿Qué responsabilidad tendrá CoinService?**

Por ahora:

- Pedir datos a CoinGecko.
- Convertirlos en objetos `Coin`.
- Guardarlos usando CoinRepository.

Archivo: [Ver codigo](../backend/app/services/coin_service.py)

Analicemos el código:

```py
# Constructor
def __init__(self, repository, api_client):

# Recibe dependencias externas

#⛔No hacemos:⛔
self.repository = CoinRepository()
# PORQUE?
# Porque el Service no debe crear sus dependencias.
# Deve recibirlas.
# Esto se llama: Dependency Injection

# EJEMPLO DE MALA PRACTICA
class CoinService:

    def __init__(self):
        self.repository = CoinRepository()

# Problemas:
# - Difícil de testear.
# - Mucho acoplamiento.
# - No podemos cambiar MySQL por otra base fácilmente.

# MEJOR HACER
CoinService(
    repository,
    api_client
)
```

Ahora podemos cambiar: `MySQL Repository` por: `Mock Repository` en los tests.

---

### Método update_coin

```py
data = self.api_client.get_coin(coin_id)
```

Obtiene información externa.

Ejemplo:

```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin",
  "market_cap_rank": 1
}
```

Luego:

```py
coin = Coin(...)
```

Convertimos datos externos en nuestro modelo interno.

Esto es importante.

Nunca deberíamos guardar directamente JSON externo en nuestra base.

### EJEMPLO:

```json
// API:
{
  "market_cap_rank": 1
}
```

AHORA:

```py
# Nuestro sistema:

Coin(
    market_cap_rank=1
)

# DESPUES
self.repository.save(coin)

```
El Service delega la persistencia.

No sabe SQL.

No sabe MySQL

Solo dice: `OK guardo la moneda.`
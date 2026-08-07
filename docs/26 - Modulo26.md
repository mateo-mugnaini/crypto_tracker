# Módulo 26 - Historial de precios (Price History)

Objetivo

Hasta ahora guardamos información de las monedas:

bitcoin
ethereum
solana

Pero falta algo importante.

El precio cambia constantemente.

Si modificamos siempre el mismo registro:

bitcoin

65000

↓

bitcoin

66000

↓

bitcoin

67000

Perdemos el historial.

Por eso creamos la tabla:

price_history
¿Por qué existe esta tabla?

La tabla coins almacena información relativamente estable:

id

symbol

name

market_cap_rank

Mientras que:

price_history

almacena datos que cambian continuamente.

Ejemplo:

coin_id price recorded_at
bitcoin 65000 10:00
bitcoin 65120 10:05
bitcoin 64980 10:10
bitcoin 65250 10:15

De esta forma nunca perdemos información histórica.

Flujo
CoinGecko

↓

Precio actual

↓

PriceHistoryService

↓

PriceHistoryRepository

↓

price_history
Crear PriceHistoryService

Archivo:

app/services/price_history_service.py

Constructor:

class PriceHistoryService:

    def __init__(self, repository, api_client):
        self.repository = repository
        self.api_client = api_client

Observa que seguimos utilizando inyección de dependencias.

Método update_price()
from datetime import datetime

def update_price(self, coin_id):

    data = self.api_client.get_coin(coin_id)

    price = data["market_data"]["current_price"]["usd"]

    history = PriceHistory(
        coin_id=coin_id,
        price=price,
        recorded_at=datetime.now()
    )

    self.repository.save(history)

    return history

Cada ejecución crea un nuevo registro.

No actualiza uno existente.

¿Por qué no usamos UPDATE?

Porque el historial representa una serie temporal.

Queremos conservar todos los valores.

08:00 → 65000

09:00 → 65150

10:00 → 64980

11:00 → 65300

Cada fila representa una medición diferente.

Consultar el historial

Ya tenemos:

find_by_coin()

Podemos hacer:

history = repository.find_by_coin("bitcoin")

for item in history:
print(item)

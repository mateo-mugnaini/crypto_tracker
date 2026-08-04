# Módulo 10 - Obtener datos reales de CoinGecko

> ### Objetivos
>
> Al terminar este módulo tenemos:
>
> - Un método para consultar criptomonedas realies.
> - Datos de Bitcoin, Ethereum, etc.
> - Manojo basico de parámetros.
> - Conversión de JSON → Objetos Python.
> - Nuestro primer flujo completo.

### 1. Revisando el endpoint que utilizaremos

CoinGecko tiene un endpoint:

La URL completa: [URL](https://api.coingecko.com/api/v3/coins/markets)

```
https://api.coingecko.com/api/v3/coins/markets

```

Este endpoint devuelve una lista de monedas con información como:

- id
- símbolo
- nombre
- precio actual
- capitalización
- ranking
- variación porcentual

---

Ejemplo de respuesta:

```json
[
  {
    "id": "bitcoin",
    "symbol": "btc",
    "name": "Bitcoin",
    "current_price": 100000,
    "market_cap_rank": 1
  }
]
```

**Observa algo:**

Esto ya no es un objeto simple.

Es una lista

### 2. Nuestro modelo Coin

Actualmente tenemos algo parecido:

```bash
models/
    └── coin.py

```

Vamos a mejorarlo.

[VER CODIGO](../backend/app/models/coin.py)

### ¿Qué agregamos?

```py
# Antes:

Coin(name,symbol)

# Ahora:
Coin(id,name,symbol,price,rank)
```

Porque CoinGecko nos entrega más información.

---

### 3. Actualizar CoinGeckoService

Ahora vamos al servicio.

Archivo: [VER CODIGO](../backend/app/services/coingecko_service.py)

#### Analicemos

```bash
# URL
url = f"{self.BASE_URL}/coins/markets"
```

#### Construimos:

```bash
https://api.coingecko.com/api/v3/coins/markets
```

#### Parámetros

```json
params = {
"vs_currency": "usd",
}
```

> Significa:
>
> - Quiero los precios en dólares.
> - "order": "market_cap_desc"

> Ordenar:
>
> - Mayor capitalización primero.
> - "per_page": 10

> Traer:
>
> - 10 monedas.
> - "page": 1

> Primera página.

### 4. Probar el endpoint

Veamos `main.py`

Ejecutamos

```bash
python app/main.py
# o
python -m app.main
```

Resultado esperado:

```bash
Bitcoin 64271
Ethereum 1875.68
Tether 0.999333
BNB 593.57
USDC 0.999694
XRP 1.079
Solana 74.14
TRON 0.328867
Figure Heloc 1.005
Hyperliquid 55.3
```

### 5. Problema actual

Ahora estamos haciendo esto:

```py
coin["name"]
```

Es decir:

Estamos trabajando con diccionarios.

Funciona.

Pero recuerda nuestro objetivo:

Queremos trabajar con objetos.

Queremos:

```py
coin.name
```

No:

```py
coin["name"]
```

---

Entonces necesitamos transformar:

```
JSON
 |
 |
dict
 |
 |
Coin Object
```

### 6. Crear un conversor

Vamos a crear: [COIN_MAPPER](../backend/app/services/coin_mapper.py)

Este archivo tendrá una responsabilidad:

Convertir datos externos en nuestro modelo.

CÓDIGO: [VER CODIGO](../backend/app/services/coin_mapper.py)

---

Ahora podemos transformar:

Entrada:

```py
{
  "name": "Bitcoin",
  "symbol": "btc"
}
```

Salida:

```py
Coin(
 name="Bitcoin",
 symbol="btc"
)
```

### 7. Actualizar main

Ahora:

```py
from services.coingecko_service import CoinGeckoService
from services.coin_mapper import map_coin


def main():

    service = CoinGeckoService()


    coins_data = service.get_market_coins()


    coins = []


    for coin_data in coins_data:

        coin = map_coin(coin_data)

        coins.append(coin)


    for coin in coins:

        coin.show()



if __name__ == "__main__":
    main()
```

### 8. ¿Por qué crear un mapper?

Buena pregunta.

Podríamos hacer:

```py
Coin(data["name"], data["price"])
```

directamente en el service.

> Pero entonces:
> CoinGeckoService tendría dos responsabilidades:
>
> 1. Comunicarse con la API.
> 2. Crear objetos.

Eso rompe el principio:

> Una clase debería tener una responsabilidad clara.

Nuestro diseño:

```bash
CoinGeckoService

"Obtengo datos"

CoinMapper

"Transformo datos"

Coin

"Represento una moneda"
```

Cada pieza tiene un objetivo.

# Módulo 5 - Tipos de datos, variables y funciones en Python

Objetivos

> ### Al finalizar este módulo entenderás:
>
> - Cómo funcionan las variables en Python.
> - Los tipos de datos principales.
> - Diferencias con JavaScript.
> - Cómo trabajar con listas y diccionarios.
> - Qué son los type hints.
> - Por qué son importantes en proyectos profesionales.

## Clase 1 - Variables en Python

En JavaScript probablemente harías:

```js
const name = "Bitcoin";
let price = 50000;
```

En Python:

```py
name = "Bitcoin"
price = 50000
```

No existe:

- const
- let
- var

Python determina el tipo automáticamente.

```py
# Ejemplo:
name = "Bitcoin"

price = 50000

active = True

# Python entiende:
name → string

price → integer

active → boolean
```

> ¿Python es dinámicamente tipado? <br/>
> **Sí**

Esto funciona:

```py
value = 10
value = "Bitcoin"
```

Python permite cambiar el tipo.

Pero en proyectos profesionales usamos una herramienta llamada:`Type hints`

## Clase 2 - Type hints

Los type hints permiten indicar qué tipo de dato esperamos.

```py
# Ejemplo:
# Sin type hints:
def sumar(a, b):
return a + b

# No sabemos:

# ¿a es número?
# ¿string?
# ¿lista?

# Con type hints:

def sumar(a: int, b: int) -> int:
return a + b
Ahora estamos diciendo:

a debe ser int

b debe ser int

la función devuelve int
```

### Importante:

Python no obliga a cumplirlo.

Esto:

```py
sumar("hola", "mundo")
```

puede ejecutarse.

> Los type hints sirven para:
>
> - documentación;
> - autocompletado del editor;
> - detectar errores antes;
> - facilitar mantenimiento.
> - Comparación con TypeScript

Como vienes de React/Next, esto será familiar.

```js
// JavaScript:
function sumar(a, b) {
  return a + b;
}

// TypeScript:

function sumar(a:number,b:number):number{
return a+b;
}
```

```py
# Python:

def sumar(a:int,b:int)->int:
return a+b
```

La filosofía es muy parecida.

## Clase 3 - Tipos básicos

```
Tipo: String
 str
coin = "Bitcoin"

Tipo: Integer
int
Float (Números enteros).

market_cap = 500000

Tipo: Integer
float (Números decimales)

price = 108543.55


Tipo: Boolean
bool

active = True || False

```

## Clase 4 - Listas

Una lista es una colección ordenada.

```js
// JavaScript:
const coins = ["bitcoin", "ethereum"];
```

```py
# Python:
coins = ["bitcoin", "ethereum"]
```

Tipo:
list

```py
# Ejemplo:

coins = [
"bitcoin",
"ethereum",
"solana"
]

print(coins[0])

Resultado:

bitcoin

```

### Listas con tipos

Aquí aparece otro type hint:

coins: list[str] = [
"bitcoin",
"ethereum"
]

Significa:

Esta lista solamente debería contener strings.

## Clase 5 - Diccionarios

Este será uno de los más importantes.

`¿Por qué?`

Porque las APIs devuelven JSON.

Ejemplo CoinGecko:

```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "current_price": 100000
}
```

En Python eso se convierte en:

```py
coin = {
"id": "bitcoin",
"symbol": "btc",
"current_price": 100000
}
```

Esto es un: `dict`

Acceder datos:

print(coin["id"])

Resultado:

bitcoin

Agregar datos:

coin["rank"] = 1

Ahora:

```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "current_price": 100000,
  "rank": 1
}
```

Diccionarios con type hints

Podemos indicar:

coin: dict[str, str]

Pero hay un problema.

Nuestro diccionario tiene:

**id**: `str`

**symbol**: `str`

**current_price**: `int`

**Tiene diferentes tipos.**

> Para estructuras más complejas más adelante usaremos:
>
> `Pydantic Models`
>
> cuando trabajemos con FastAPI.

## Clase 6 - Tuplas

Una tupla es como una lista que no cambia.

```py
Ejemplo:

coordinates = (10,20)
```

### ⛔No podemos hacer:

```py
coordinates[0] = 30
```

No será algo muy usado en Crypto Tracker.

## Clase 7 - Sets

Un set almacena valores únicos.

Ejemplo:

```py
coins = {
"btc",
"eth",
"btc"
}
```

Resultado:

```py
{
"btc",
"eth"
}
```

**Elimina duplicados**

```py
# Aplicándolo a Crypto Tracker
# Imagina que CoinGecko devuelve:

coins = [
{
"id": "bitcoin",
"price": 100000
},
{
"id": "ethereum",
"price": 5000
}
]
```

Observa la estructura:

```
lista
  ↓
diccionarios
  ↓
datos
```

Esto será nuestro día a día.

```py
# Ejercicio práctico

# Crea un archivo:

    app/
     └── crypto_test.py

# Dentro crea:

coin = {
"name": "Bitcoin",
"symbol": "BTC",
"price": 100000,
"active": True
}

# Después imprime:
Nombre: Bitcoin
Símbolo: BTC
Precio: 100000
Activo: True


# Después crea una función:

def show_coin(coin):
pass

# Y mueve la impresión dentro.

# Finalmente agrega type hints:

def show_coin(coin: dict) -> None:
pass
```

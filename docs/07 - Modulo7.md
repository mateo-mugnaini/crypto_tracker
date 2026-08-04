# Módulo 7 - Programación Orientada a Objetos (POO)

> ## Objetivo
>
> Entender qué es una clase, qué es un objeto y cuándo realmente debemos utilizarlos.

Y hago énfasis en cuándo, porque un error muy común es creer que _creer_ que _todo_ debe ser una `clase`

---

#### ANTES DE EMPEZAR

Si te muestro este código:

```py
def sumar(a,b):
    return a+b
```

Todo bien.

Ahora vamos a trabajar con CoinGecko(Api de cryptos)

> Necesitamos:
>
> - Obtener el Top 10
> - Buscar una moneda.
> - Obtener el detalle de una moneda.
> - Obtener los mercados.
> - Obtener las tendencias.

Una opcion es:

```py
def get_top_coins():
    ...

def get_coins():
    ...

def get_markets():
    ...

def search_coins():
    ...
```

Y la app funcionaría perfectamnete.

Estonces...

### ¿Por qué existen las clases?

La respuesta es:

> Porque muchas veces varias funciones pertenecen a la misma "_cosa_"

Y queremos agruparlas

---

### Tomemos de ejemplo un AUTO 🏎️

¿Qué propiedades tiene un auto?

```py
Marca="Ford"
Modelo="Fiesta"
Color="Verde"
VelocidadMax=250
```

¿Y qué puede hacer?

```py
Arrancar= True
Frenar= True
Acelerar= True
```

Oberserva algo `interesante`.

Hay datos.

Y hay comportamientos

---

### Esa es la idea de un objeto

Un objeto agrupa:

- Información (atributos)
- comportamientos (métodos)

### Clases vs Objetos

Esta diferencia es probablemente la más importantes

**UNA CLASE**

- Es un plano:
  - Como el plano de una casa
  - Todavia no existe la casa
  - Solo existe el diseño

  ```py
  class Car:
  pass
  ```

  - Todavía no existe ningún auto.

**UN OBJETO**

Es una instancia de esa clase.

```py
my_car = Car()
```

Ahora si existe el auto

---

ANALOGÍA

```shell
Clase
  ↓
Plano de una casa
  ↓
Objeto
  ↓
Casa construida
```

---

### Nuestra primera clase

Vamos a crear un archivo nuevo.

```shell
app/
models/
    __init__.py
    coin.py
```

Sí.

Acabamos de crear nuestra primera carpeta pensando en arquitectura.

¿Por qué `models`?

Porque una moneda es un **modelo de datos**.

No es un servicio.

No es un controlador.

**Es una entidad**

---

Clase `Coin`<br/>
Dentro de coin.py escribe:

```py
class Coin:

    pass
```

Pregunta.

**¿Hace algo?**

No.

Pero ya definimos una nueva clase.

---

### Crear un objeto

Ahora en `main.py`:

```py
from models.coin import Coin

def main():

    coin = Coin()

    print(coin)

if **name** == "**main**":
main()
```

¿Qué esperas que imprima?

Algo parecido a:

```shell
<models.coin.Coin object at 0x000001A2B8...>
```

Muchos principiantes dicen:<br/>

> "No funciona."

Pero sí funciona.

Lo que pasa es que Python está diciendo:

> "Creé un objeto."

Todavía no sabe cómo mostrarlo.

---

### El método **`__init__`**

Aquí aparece el primer método especial.

```py
class Coin:

    def __init__(self):
        print("Se creó una moneda")

# Ahora:
coin = Coin()

# Resultado:
Se creó una moneda
```

---

### ¿Qué es **`__init__`**?

Es un método que Python ejecuta automáticamente cuando creas un objeto.

No tienes que llamarlo.

Python lo hace por ti.

### `self`

Ahora viene otra palabra que suele generar miedo.

```py
class Coin:

    def __init__(self):

        self.name = "Bitcoin"
```

¿Qué es `self`?

Piensa que Python traduce esto internamente de forma parecida a:

```py
coin.name = "Bitcoin"
```

`self` significa:

> "Este objeto".

No significa:

> la clase.

No significa:

> Python.

Significa:

> este objeto específico que se está creando.

### Probemos

```py
class Coin:

    def __init__(self):

        self.name = "Bitcoin"

        self.symbol = "BTC"
```

Ahora:

```py
coin = Coin()

print(coin.name)

print(coin.symbol)
```

Resultado:

```shell
Bitcoin
BTC
```

---

### Ahora hagámoslo bien

No queremos que todas las monedas sean Bitcoin.

Queremos construir cualquier moneda.

```py
class Coin:

    def __init__(self, name, symbol):

        self.name = name

        self.symbol = symbol
```

Y en main.py:

```py
bitcoin = Coin("Bitcoin", "BTC")

ethereum = Coin("Ethereum", "ETH")
```

Ahora tenemos dos objetos distintos.

```
bitcoin

↓

name

Bitcoin

↓

symbol

BTC
```

y

```
ethereum

↓

name

Ethereum

↓

symbol

ETH
```

---

### Type Hints

Aquí empiezan a cobrar mucho sentido.

```py
class Coin:

    def __init__(self, name: str, symbol: str):

        self.name = name

        self.symbol = symbol
```

Esto ya se parece mucho a TypeScript.

---

### Métodos

Una clase no solo guarda datos.

También tiene comportamiento.

```py
class Coin:

    def __init__(self, name: str, symbol: str):

        self.name = name

        self.symbol = symbol

    def show(self):

        print(self.name)

        print(self.symbol)
```

Ahora:

```py
bitcoin = Coin("Bitcoin", "BTC")
bitcoin.show()
```

Resultado:

```shell
Bitcoin

BTC
```

---

### ¿Por qué hacemos esto?

Porque más adelante recibiremos este JSON:

```json
{
  "id": "bitcoin",
  "symbol": "btc",
  "name": "Bitcoin"
}
```

Podríamos trabajar con un diccionario.

O podríamos convertirlo en un objeto:

```py
bitcoin = Coin(
name="Bitcoin",
symbol="BTC"
)
```

Y acceder de forma mucho más clara:

```py
bitcoin.name
bitcoin.symbol
```

en lugar de:

```py
coin["name"]
coin["symbol"]
```

---

### ¿Usaremos clases para todo?

No.

Y esta es una decisión importante para este proyecto.

Vamos a seguir una regla sencilla:

| Si...                                                | Usaremos...       |
| ---------------------------------------------------- | ----------------- |
| Representa una entidad (Moneda, Usuario, Favorito)   | Clase             |
| Es una utilidad simple (`sumar`, `formatear_precio`) | Función           |
| Agrupa lógica de negocio (consultar CoinGecko)       | Clase de servicio |
| Solo transforma datos pequeños                       | Funciones         |

Es un equilibrio. No vamos a convertir absolutamente todo en clases porque eso haría el código más complejo de lo necesario.

# Módulo 7 - Programación Orientada a Objetos (POO)

## ¿Qué es la Programación Orientada a Objetos?

La Programación Orientada a Objetos (POO) es una forma de organizar el código agrupando datos y comportamientos relacionados dentro de estructuras llamadas clases.

En lugar de tener muchas variables y funciones separadas, podemos crear objetos que representan elementos reales de nuestra aplicación.

Ejemplo:

En Crypto Tracker una moneda puede ser representada como un objeto que contiene:

- Nombre.
- Símbolo.
- Precio.
- Métodos para mostrar o modificar información.

---

# ¿Qué es una clase?

Una clase es una plantilla o modelo que define cómo será un objeto.

Una clase no representa un elemento real todavía, sino que describe qué atributos y comportamientos tendrá.

Ejemplo:

```python
class Coin:
    pass
```

Esta clase define que existe una entidad llamada `Coin`, pero todavía no tiene información.

Es similar al plano de una casa. El plano describe cómo será la casa, pero todavía no existe una casa construida.

---

# ¿Qué es un objeto?

Un objeto es una instancia creada a partir de una clase.

Cuando utilizamos una clase para crear un elemento real, estamos creando un objeto.

Ejemplo:

```python
bitcoin = Coin()
```

Aquí creamos un objeto llamado `bitcoin` basado en la clase `Coin`.

Podemos crear muchos objetos diferentes usando la misma clase:

```python
bitcoin = Coin()

ethereum = Coin()
```

Ambos objetos pertenecen a la misma clase, pero pueden tener diferentes datos.

---

# Diferencia entre clase y objeto

## Clase

Es la definición.

Ejemplo:

```python
class Coin:
    pass
```

Representa la estructura que tendrán las monedas.

## Objeto

Es una instancia concreta.

Ejemplo:

```python
bitcoin = Coin()
```

Representa una moneda específica creada utilizando esa estructura.

Una forma sencilla de recordarlo:

```
Clase
↓
Modelo o plantilla

Objeto
↓
Elemento creado a partir del modelo
```

---

# ¿Qué es `__init__`?

`__init__` es un método especial que Python ejecuta automáticamente cuando se crea un objeto.

Se utiliza normalmente para inicializar los valores del objeto.

Ejemplo:

```python
class Coin:

    def __init__(self, name, symbol):
        self.name = name
        self.symbol = symbol
```

Cuando creamos:

```python
bitcoin = Coin("Bitcoin", "BTC")
```

Python ejecuta automáticamente:

```python
__init__()
```

y guarda esos valores dentro del objeto.

---

# ¿Qué es `self`?

`self` representa al objeto actual.

Permite acceder a los atributos y métodos pertenecientes a ese objeto.

Ejemplo:

```python
class Coin:

    def __init__(self, name):
        self.name = name
```

Cuando hacemos:

```python
bitcoin = Coin("Bitcoin")
```

Internamente podemos imaginarlo como:

```python
bitcoin.name = "Bitcoin"
```

`self` permite que cada objeto tenga sus propios valores.

---

# ¿Qué es un atributo?

Un atributo es una característica o dato almacenado dentro de un objeto.

Ejemplo:

```python
class Coin:

    def __init__(self, name, price):
        self.name = name
        self.price = price
```

En este caso:

```python
name
price
```

son atributos de la clase `Coin`.

Un objeto podría tener:

```python
bitcoin.name
```

con el valor:

```
Bitcoin
```

y:

```python
bitcoin.price
```

con el valor:

```
100000
```

---

# ¿Qué es un método?

Un método es una función que pertenece a una clase.

Los métodos representan acciones que puede realizar un objeto.

Ejemplo:

```python
class Coin:

    def show(self):
        print(self.name)
```

Luego:

```python
bitcoin.show()
```

ejecuta el comportamiento definido dentro de la clase.

---

# Ejemplo aplicado a Crypto Tracker

Una moneda puede representarse así:

```python
class Coin:

    def __init__(self, name, symbol, price):

        self.name = name
        self.symbol = symbol
        self.price = price


    def show(self):

        print(f"Nombre: {self.name}")
        print(f"Símbolo: {self.symbol}")
        print(f"Precio: ${self.price}")
```

Crear una moneda:

```python
bitcoin = Coin(
    "Bitcoin",
    "BTC",
    100000
)
```

Mostrar información:

```python
bitcoin.show()
```

Resultado:

```
Nombre: Bitcoin
Símbolo: BTC
Precio: $100000
```

---

# ¿Cuándo utilizar una clase?

No todo debe ser una clase.

Debemos utilizar clases cuando tenemos una entidad con:

- datos propios;
- comportamientos relacionados;
- una representación clara dentro del sistema.

Ejemplos en Crypto Tracker:

Usaremos clases para:

- Coin.
- Usuario.
- Favorito.
- Cliente de API.
- Conexión a base de datos.

---

# ¿Cuándo utilizar una función?

Una función es mejor cuando necesitamos realizar una acción simple que no necesita guardar estado.

Ejemplo:

```python
def format_price(price):
    return f"${price}"
```

No necesitamos una clase porque solamente transforma un dato.

---

# Regla utilizada en el proyecto

Para Crypto Tracker seguiremos esta organización:

| Elemento           | Uso                                    |
| ------------------ | -------------------------------------- |
| Funciones simples  | Transformaciones pequeñas y utilidades |
| Clases modelo      | Representar entidades del sistema      |
| Clases servicio    | Manejar lógica de negocio              |
| Clases repositorio | Acceder a base de datos                |

---

# Relación con JavaScript

La POO existe también en JavaScript.

Ejemplo JavaScript:

```javascript
class Coin {
  constructor(name) {
    this.name = name;
  }
}
```

Python:

```python
class Coin:

    def __init__(self, name):
        self.name = name
```

Ambos conceptos son similares:

- clase;
- constructor;
- atributos;
- métodos.

La diferencia está principalmente en la sintaxis.

---

# Importancia para Crypto Tracker

La POO nos permitirá crear una arquitectura más organizada.

En lugar de trabajar con datos sueltos:

```python
coin["name"]
coin["price"]
```

podremos trabajar con objetos:

```python
coin.name
coin.price
```

Esto hará que el proyecto sea más fácil de mantener y escalar cuando agreguemos:

- CoinGecko API.
- Base de datos MySQL.
- Backend API.
- Frontend en React.

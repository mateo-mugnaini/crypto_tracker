# Módulo 13 - Diseño de la Base de Datos

> ### Objetivos
>
> - Comprender como es una base de datos relacional.
> - Aprender a identificar entidades.
> - Diseñar la tabla antes de crearlas.
> - Entender las relaciones entre tablas.
> - Tener listo el diseño para implementarlo en MYSQL (#Módulo 14)

## Clase 1 - ¿Qué es una base de datos?

Hasta ahora los datos vienen de variables.

```python
# Ejemplo
coin = Coin(
    id:str = "bitcoin",
    name:str = "Bitcoin",
    price:int = 118000
    )
```

Este objeto existe solamente cuando se está ejecutando el programa.

Una Base de datos (DB) Permite almacenar esa info de forma permanente.

## Clase 2 - ¿Por qué MySQL?

Existen muchas base de datos:

| Base de datos | Tipo          |
| ------------- | ------------- |
| MySQL         | Relacional    |
| PostgreSQL    | Relacional    |
| SQLite        | Relacional    |
| MongoDB       | No relacional |
| Redis         | Clave - Valor |

Elegimos MySQL porque:

- Es muy utilizada en empresas.
- Tiene excelente docu.
- Es gratuita.
- Funciona muy bien con python.
- Más adelante aprender los conceptos hará muy sencillo pasar a PostgreSQL.

## Clase 3 - ¿Qué significa que sea `Relacional`?

Una base de datos relacional organiza la información en tablas.

Por ejemplo:

Usuarios

| id  | nombre |
| --- | ------ |
| 1   | Mateo  |

otra tabla:

Favoritos

| id  | coin_id |
| --- | ------- |
| 1   | bitcoin |

Luego anbas pueden relacionarse

## Clase 4 - ¿Qué entidades tiene Crypto Tracker?

Antes de crear tablas:

> $¿Qué cosas existen dentro del sistema?$

No se habla de pantallas, ni de código... Se hable de `NEGOCIO`

---

Hoy ya conocemos algunas.

Coin

Representa una criptomoneda.

> ### Ejemplos:
>
> - Bitcoin
> - Ethereum
> - Solana

---

### User

Representa un usuario registrado.

Ejemplo: `Mateo`

---

Favorite

Relaciona usuarios con criptomonedas.

```shell
# Ejemplo:
Mateo
↓
Bitcoin
Ethereum
```

PriceHistory

Guarda el historial de precios.

```shell
# Ejemplo:

Bitcoin
  ↓
100000
  ↓
101500
  ↓
99800

```

---

## Clase 5 - ¿Qué tablas necesitamos?

En una primer vista rápida:

- Users
- Coins
- Favorites
- Prince_history

Más adelante pueden surguir nuevas con nuevas relaciones

### TABLA 1 - USERS

¿Qué podemos guardar?

| Columna    | Tipo         | Descripción           |
| ---------- | ------------ | --------------------- |
| id         | INT          | Identificador         |
| username   | VARCHAR(50)  | Nombre de usuario     |
| email      | VARCHAR(255) | Correo electrónico    |
| password   | VARCHAR(255) | Contraseña (hasheada) |
| created_at | DATETIME     | Fecha de creación     |

**¿Por qué VARCHAR(255) para la contraseña?**

Porque nunca guardaremos la contraseña en texto plano.

Guardaremos un hash.

---

### TABLA 2 - COINS

CoinGecko ya nos da información.

Pero queremos guardar una copia local.

| Columna         | Tipo         |
| --------------- | ------------ |
| id              | VARCHAR(50)  |
| symbol          | VARCHAR(20)  |
| name            | VARCHAR(100) |
| market_cap_rank | INT          |

**Observa que aquí no guardamos el precio**

¿PORQUÉ?

Porque cambia constantemente

---

### TABLA 3 - PRICE_HISTORY

Aquí se almacena el precio en distintos momentos.

| Columna     | Tipo          |
| ----------- | ------------- |
| id          | INT           |
| coin_id     | VARCHAR(50)   |
| price       | DECIMAL(18,8) |
| recorded_at | DATETIME      |

**¿PORQUÉ LA DESICIÓN DE SEPARAR EL PRECIO?**

Imagina: El bitcoint vale `120000` y mañana pasa a `12100`. Si actualizamos siempre el mismo registro

Se pierde el registro historico

```shell
Bitcoin
  ↓
120000
  ↓
121000
  ↓
122500
  ↓
119800
```

### TABLA 4 - FAVORITES

Relacion entre usuarios con monedas.

| Columna | Tipo        |
| ------- | ----------- |
| id      | INT         |
| user_id | INT         |
| coin_id | VARCHAR(50) |

## Clase 6 - Relaciones

```shell
   Users
     1
     ↓
     ∞
  Favorites
     ∞
     ↓
     1
   Coins
     1
     ↓
     ∞
PriceHistory
```

Hablando en criollo

> Un usuario puede tener muchos favoritos
>
> Una moneda puede ser favorita de muchos usuarios
>
> Una moneda tiene muchos registros hístoricos

## Clase 7 - ¿Por qué no guardamos todo en una sola tabla?

Pensemos esto:

```
coin

name

price

username

email

favorite
```

Cada vez que Bitcoin cambie de precio..

tendriamos que modificar todas las filas donde aparezca Bitcoin.

Eso genera:

- Duplicados.
- Inconsistencias.
- Errores.

Por eso normalizamos los datos.

---

## Clase 8 - Primera aproximación al modelo

```
users
---------
id
username
email
password
created_at


coins
---------
id
symbol
name
market_cap_rank


favorites
---------
id
user_id
coin_id


price_history
---------
id
coin_id
price
recorded_at
```

Este será nuestro punto de partida.

Más adelante podremos añadir:

- imagenes
- volumen
- market cap
- cambios porcentuales
- watchlists
- alertas

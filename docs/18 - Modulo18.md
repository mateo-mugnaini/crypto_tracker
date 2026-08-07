# Módulo 18 - Diseño completo de la Base de Datos

### ¿Qué funcionalidades tendrá Crypto Tracker?

Pensemos en un producto final.

Un USUARIO podrá:

- Buscar criptomonedas.
- Guardar monedas en favoritos.
- Consultar el gistoral de precios.
- Iniciar Sesión.
- Ver información de una moneda.

Eso nos obliga a pensar qué información necesitamos almacenar.

---

### Entidades del sistema

Por el momento tendremos 4 entidades principales.

### 1. Users

> REPRESENTAA A LOS USUARIOS DE LA APP.

Campos:

| Campo         | Tipo     | Descripción         |
| ------------- | -------- | ------------------- |
| id            | INT      | Identificador       |
| username      | VARCHAR  | Nombre de usuario   |
| email         | VARCHAR  | Email               |
| password_hash | VARCHAR  | Contraseña hasheada |
| created_at    | DATETIME | Fecha de creación   |

### 2. Coins

> YA LA CONOCEMOS REPRESENTA CADA MONEDA.

Campos:

| Campo           | Tipo    |
| --------------- | ------- |
| id              | VARCHAR |
| symbol          | VARCHAR |
| name            | VARCHAR |
| market_cap_rank | INT     |

### 3. Favirites

> Relaciona usuarios con monedas.
> Un Usuario puede tener muchas favoritas.
> Una moneda puede ser favorita de muchos usuarios.
> POR ESO ESTA ES UNA TABLA INTERMEDIA.

Campos:

| Campo   | Tipo    |
| ------- | ------- |
| id      | INT     |
| user_id | INT     |
| coin_id | VARCHAR |

### 4. Price History

> No queremos perder el historial de precios.
> Si actualizamos Bitcoin cada hora:
> 10:00 → 117000
> 11:00 → 118500
> 12:00 → 116900
> No queremos sobrescribir el precio en la tabla de coins.
> QUEREMOS ALMACENARLO

Campo:

| Campo     | Tipo     |
| --------- | -------- |
| id        | BIGINT   |
| coin_id   | VARCHAR  |
| price     | DECIMAL  |
| timestamp | DATETIME |

RELACIONES:

```shell
Users
   │
   │ 1
   │
   │ N
Favorites
   │
   │ N
   │
   │ 1
Coins
   │
   │ 1
   │
   │ N
PriceHistory
```

### ¿Por qué existe FAVIRITES?

Muchos principiantes intentan hacer esto

```shell
Users
favorite_coin_1
favorite_coin_2
favorite_coin_3
```

¿Qué sucede si un usuario quiere guardar 20 monedas?

Tendríamos que agregar una columna por cada moneda

**Eso rompe el diseño**

La solución correcta es:

Users:

| id  | nombre   | ... |
| --- | -------- | --- |
| 1   | usuario1 | ... |
| 2   | usuario2 | ... |
| 3   | usuario3 | ... |
| 4   | usuario4 | ... |

↓

Favorites:

| id  | user_id | coin_id  |
| --- | ------- | -------- |
| 1   | 1       | Bitcoin  |
| 2   | 1       | Ethereum |
| 3   | 1       | Solana   |
| 4   | 2       | Bitcoin  |

Una fila representa una relación.

### ¿Por qué PriceHistory es otra tabla?

Podríamos pensar:

Coins --> price

Pero el precio cambia contantemente.

Si guardamos

| coin_id | price  | hora  |
| ------- | ------ | ----- |
| Bitcoin | 117000 | 10:00 |
| Bitcoin | 118000 | 11:00 |
| Bitcoin | 117500 | 12:00 |

Ahora sí tenemos un historial.

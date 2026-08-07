# Módulo 20 - Creación de modelos restantes

> ### Objetivo
>
> Crear los modelos que representan nuestras tablas restantes:
>
> - User
> - Favorite
> - PriceHistory

La idea es que Python tenga una representación de cada entidad de MySQL.

### 1. User

[VER CODIGO](../backend/app/models/user.py)

**Explicacion**

Nuestra tabla: `users`

tenia:

| id  | username | email | password_hash | created_at |
| --- | -------- | ----- | ------------- | ---------- |

Cada columna se transforma en un atributo del objeto.

```py
# Ejemplo:

user = User(
    1,
    "mateo",
    "correo@test.com",
    "hash123!",
    "2026-08-07 12:12:12"
)

```

Ahora tenemos un usuario representado dentro de Python.

### 2. Favorite

[VER CODIGO](../backend/app/models/favorite.py)

**Algo importante aquí**

Esta tabla: `favorites`.

No tiene un objeto independiente. ES UNA RELACIÓN

USER <--> Favorite <--> Coin

ejemplo:

Mateo <--> Bitcoin

La tabla solo guarda

el user_id ("Mateo") y
el coin_id ("bitcoin")

### 3. PriceHistory

[VER CODIGO](../backend/app/models/price_history.py)


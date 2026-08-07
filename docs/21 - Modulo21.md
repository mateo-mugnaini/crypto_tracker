# Módulo 21 - Repositories para Users, Favorites y PriceHistory

### ¿Qué hace un Repository?

Un repository contiene operaciones como:

- guardar
- buscar
- actualizar
- eliminar

```py
# Ejemplo:
repository.save(user)

# Internamente hace:
INSERT INTO users (...)
VALUES (...)
```

### 1. UserRepository

[VER CODIGO](../backend/app/repositories/user_repository.py)

**EXPLICACION**

```py
# cuando hacemos:
repository.save(user)
# recibimos un objeto:
User(
    "mateo",
    "email@test.com",
    "hash"
)
# El repository lo transforma en SQL:INSERT INTO users
```

### 2. FavoriteRepository

[VER CODIGO](../backend/app/repositories/favorite_repository.py)

**EXPLICACION**

**_¡PUNTO IMPORTANTE!_**

Nuestra tabla: `favorites`

tiene:

```py
PRIMARY KEY(user_id, coin_id)

# Entonces esto:

Favorite(
1,
"bitcoin"
)

# puede existir una vez.
# por lo que esto:

Favorite(
    1,
    "bitcoin"
)

# otra vez dará error.

# La base de datos protege la integridad.
```

### 3. PriceHistoryRepository

[VER CODIGO](../backend/app/repositories/price_history_repository.py)



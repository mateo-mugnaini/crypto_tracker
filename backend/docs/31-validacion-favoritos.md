# Módulo 31 — Validación de favoritos

## Objetivo

Mejorar la lógica de `FavoriteService` para validar los datos antes de guardar un favorito en la base de datos.

Antes de insertar un favorito debemos comprobar:

1. Que el usuario exista.
2. Que la moneda exista.
3. Que el usuario no tenga ya esa moneda en favoritos.

Esto evita depender exclusivamente de los errores y restricciones de MySQL.

---

# 1. Repositories utilizados

Para realizar las validaciones utilizamos tres repositories:

```text
UserRepository
CoinRepository
FavoriteRepository
```

Cada uno es responsable de consultar su propia tabla.

---

## UserRepository

Ya disponíamos del método:

```python
def exists(self, user_id):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
    SELECT 1
    FROM users
    WHERE id = %s
    LIMIT 1
    """

    cursor.execute(query, (user_id,))

    result = cursor.fetchone()

    cursor.close()
    connection.close()

    return result is not None
```

Este método devuelve:

```text
True
```

si el usuario existe.

Y:

```text
False
```

si no existe.

### Importante

La ejecución correcta utiliza una tupla:

```python
(user_id,)
```

y no:

```python
(user_id)
```

---

# 2. CoinRepository

También ya disponíamos de:

```python
def exists(self, coin_id):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
    SELECT COUNT(*)
    FROM coins
    WHERE id = %s
    """

    cursor.execute(query, (coin_id,))

    count = cursor.fetchone()[0]

    cursor.close()
    connection.close()

    return count > 0
```

Este método comprueba si la moneda existe en la tabla `coins`.

---

# 3. FavoriteRepository

`FavoriteRepository` ya disponía de:

```python
def exists(self, user_id, coin_id):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
    SELECT 1
    FROM favorites
    WHERE user_id = %s
    AND coin_id = %s
    LIMIT 1
    """

    cursor.execute(query, (user_id, coin_id))

    result = cursor.fetchone()

    cursor.close()
    connection.close()

    return result is not None
```

Este método comprueba si una determinada combinación:

```text
user_id + coin_id
```

ya existe.

Esto es especialmente importante porque la tabla `favorites` tiene una clave primaria compuesta:

```sql
PRIMARY KEY (user_id, coin_id)
```

---

# 4. Validación en FavoriteService

El `FavoriteService` ahora recibe los tres repositories:

```python
class FavoriteService:

    def __init__(
        self,
        favorite_repository,
        user_repository,
        coin_repository
    ):
        self.favorite_repository = favorite_repository
        self.user_repository = user_repository
        self.coin_repository = coin_repository
```

Esto permite que el Service coordine las validaciones.

---

# 5. add_favorite()

La implementación es:

```python
def add_favorite(self, favorite):

    if not self.user_repository.exists(favorite.user_id):
        return False, "El usuario no existe."

    if not self.coin_repository.exists(favorite.coin_id):
        return False, "La moneda no existe."

    if self.favorite_repository.exists(
        favorite.user_id,
        favorite.coin_id
    ):
        return False, "La moneda ya está en favoritos."

    self.favorite_repository.save(favorite)

    return True, "Favorito agregado correctamente."
```

El orden de las validaciones es:

```text
add_favorite()
      │
      ▼
¿Existe el usuario?
      │
   NO │ SÍ
      │
      ▼
  mensaje
         │
         ▼
¿Existe la moneda?
      │
   NO │ SÍ
      │
      ▼
  mensaje
         │
         ▼
¿Ya es favorito?
      │
   SÍ  │ NO
      │
      ▼
  mensaje
         │
         ▼
       SAVE
```

---

# 6. Valores de retorno

El método devuelve dos valores:

```python
return True, "Favorito agregado correctamente."
```

o:

```python
return False, "El usuario no existe."
```

o:

```python
return False, "La moneda no existe."
```

o:

```python
return False, "La moneda ya está en favoritos."
```

Por eso podemos hacer:

```python
success, message = service.add_favorite(favorite)

print(message)
```

---

# 7. FavoriteService completo

La versión actual queda:

```python
class FavoriteService:

    def __init__(
        self,
        favorite_repository,
        user_repository,
        coin_repository
    ):
        self.favorite_repository = favorite_repository
        self.user_repository = user_repository
        self.coin_repository = coin_repository

    def add_favorite(self, favorite):

        if not self.user_repository.exists(favorite.user_id):
            return False, "El usuario no existe."

        if not self.coin_repository.exists(favorite.coin_id):
            return False, "La moneda no existe."

        if self.favorite_repository.exists(
            favorite.user_id,
            favorite.coin_id
        ):
            return False, "La moneda ya está en favoritos."

        self.favorite_repository.save(favorite)

        return True, "Favorito agregado correctamente."

    def remove_favorite(self, user_id, coin_id):

        return self.favorite_repository.delete(user_id, coin_id)

    def get_favorites(self, user_id):

        return self.favorite_repository.find_all_by_user(user_id)

    def get_favorites_with_coin_data(self, user_id):

        return self.favorite_repository.find_all_with_coin_data(user_id)
```

---

# 8. Test

El test necesita crear los tres repositories:

```python
from app.models.favorite import Favorite
from app.repositories.favorite_repository import FavoriteRepository
from app.repositories.user_repository import UserRepository
from app.repositories.coin_repository import CoinRepository
from app.services.favorite_service import FavoriteService


def main():

    favorite_repository = FavoriteRepository()
    user_repository = UserRepository()
    coin_repository = CoinRepository()

    service = FavoriteService(
        favorite_repository,
        user_repository,
        coin_repository
    )

    favorite = Favorite(1, "bitcoin")

    success, message = service.add_favorite(favorite)

    print(message)


if __name__ == "__main__":
    main()
```

Se ejecuta mediante:

```powershell
python -m app.tests.favorite_service_test
```

---

# 9. Casos de prueba

## Usuario existente + moneda existente + favorito nuevo

Resultado:

```text
Favorito agregado correctamente.
```

---

## Usuario inexistente

Por ejemplo:

```python
favorite = Favorite(999, "bitcoin")
```

Resultado:

```text
El usuario no existe.
```

---

## Moneda inexistente

Por ejemplo:

```python
favorite = Favorite(1, "moneda-inexistente")
```

Resultado:

```text
La moneda no existe.
```

---

## Favorito duplicado

Por ejemplo:

```python
favorite = Favorite(1, "bitcoin")
```

cuando ya existe la relación:

```text
user_id = 1
coin_id = bitcoin
```

Resultado:

```text
La moneda ya está en favoritos.
```

Esto evita provocar:

```text
mysql.connector.errors.IntegrityError
```

por una clave primaria duplicada.

---

# 10. Responsabilidades

Este módulo refuerza la separación entre Repository y Service.

### Repository

Se encarga de:

```text
SQL
Conexión a MySQL
INSERT
SELECT
DELETE
```

### Service

Se encarga de:

```text
Validaciones
Reglas de negocio
Coordinación entre repositories
Mensajes/resultados de la operación
```

Por ejemplo:

```text
FavoriteService
      │
      ├── UserRepository
      │       └── ¿Existe el usuario?
      │
      ├── CoinRepository
      │       └── ¿Existe la moneda?
      │
      └── FavoriteRepository
              └── ¿Ya es favorito?
```

---

# 11. Corrección adicional

Durante la revisión se detectó un pequeño detalle en algunos métodos:

Incorrecto:

```python
cursor.execute(query, (user_id))
```

Correcto:

```python
cursor.execute(query, (user_id,))
```

La coma convierte el valor en una tupla de un elemento.

Este detalle fue corregido en:

```text
UserRepository.find_by_id()
UserRepository.exists()
CoinRepository.find_by_id()
```

cuando correspondía.

---

# Estado del módulo

**Módulo 31 — COMPLETADO**

Se implementó la validación de favoritos antes de persistirlos.

El flujo actual es:

```text
Favorite
    ↓
FavoriteService
    ↓
¿Usuario existe?
    ↓
¿Moneda existe?
    ↓
¿Ya es favorito?
    ↓
FavoriteRepository.save()
    ↓
MySQL
```

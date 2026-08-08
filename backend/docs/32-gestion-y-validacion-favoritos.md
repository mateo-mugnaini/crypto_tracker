# Módulo 32 - Gestión y validación de favoritos

## Objetivo

Completar la lógica de negocio relacionada con favoritos utilizando la arquitectura definida en el proyecto.

La arquitectura utilizada continúa siendo:

```text
Models
   ↓
Services
   ↓
Repositories
   ↓
Database
```

No se agregan nuevas capas.

---

## 1. Componentes utilizados

Para este módulo trabajamos con:

```text
app/
├── models/
│   └── favorite.py
│
├── repositories/
│   ├── favorite_repository.py
│   ├── user_repository.py
│   └── coin_repository.py
│
├── services/
│   └── favorite_service.py
│
└── tests/
    └── favorite_service_test.py
```

---

## 2. Modelo Favorite

El modelo representa la relación entre un usuario y una moneda favorita.

```python
class Favorite:

    def __init__(self, user_id, coin_id):
        self.user_id = user_id
        self.coin_id = coin_id

    def __str__(self):
        return f"User {self.user_id} favorite {self.coin_id}"
```

La tabla `favorites` utiliza:

```text
user_id
coin_id
```

como clave primaria compuesta.

No se utiliza un `id` independiente.

---

## 3. Validación del usuario

Antes de crear un favorito, el Service comprueba que el usuario exista.

Se utiliza:

```python
self.user_repository.exists(favorite.user_id)
```

Si no existe:

```text
El usuario no existe.
```

---

## 4. Validación de la moneda

También se comprueba que la moneda exista en la tabla `coins`.

Se utiliza:

```python
self.coin_repository.exists(favorite.coin_id)
```

Si no existe:

```text
La moneda no existe.
```

---

## 5. Validación de favoritos duplicados

Antes de insertar el favorito se comprueba:

```python
self.favorite_repository.exists(
    favorite.user_id,
    favorite.coin_id
)
```

Si la relación ya existe:

```text
La moneda ya está en favoritos.
```

Esto evita depender directamente del error de clave primaria de MySQL:

```text
Duplicate entry '1-bitcoin' for key 'favorites.PRIMARY'
```

---

## 6. FavoriteService

La lógica principal implementada es:

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

        if not self.favorite_repository.exists(user_id, coin_id):
            return False, "La moneda no está en favoritos."

        self.favorite_repository.delete(user_id, coin_id)

        return True, "Favorito eliminado correctamente."

    def get_favorites(self, user_id):

        if not self.user_repository.exists(user_id):
            return False, "El usuario no existe."

        return True, self.favorite_repository.find_all_by_user(user_id)

    def get_favorites_with_coin_data(self, user_id):

        if not self.user_repository.exists(user_id):
            return False, "El usuario no existe."

        return True, self.favorite_repository.find_all_with_coin_data(user_id)
```

---

## 7. Importante: tupla de un elemento en Python

Durante este módulo encontramos un detalle importante con los parámetros de MySQL.

Incorrecto:

```python
cursor.execute(query, (user_id))
```

Correcto:

```python
cursor.execute(query, (user_id,))
```

Lo mismo ocurre con `coin_id`:

```python
cursor.execute(query, (coin_id,))
```

La coma es la que convierte la expresión en una tupla de un elemento.

En cambio, cuando existen varios parámetros:

```python
cursor.execute(query, (user_id, coin_id))
```

no necesitamos una coma adicional.

---

## 8. Prueba realizada

El test utilizado fue:

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

Ejecutamos:

```powershell
python -m app.tests.favorite_service_test
```

Resultado:

```text
La moneda ya está en favoritos.
```

Esto confirma que:

```text
UserRepository.exists()
        ↓
CoinRepository.exists()
        ↓
FavoriteRepository.exists()
        ↓
FavoriteService
        ↓
Detecta favorito existente
```

está funcionando correctamente.

---

## 9. Casos contemplados

| Caso                          | Resultado esperado                  |
| ----------------------------- | ----------------------------------- |
| Usuario inexistente           | `El usuario no existe.`             |
| Moneda inexistente            | `La moneda no existe.`              |
| Favorito duplicado            | `La moneda ya está en favoritos.`   |
| Favorito nuevo                | `Favorito agregado correctamente.`  |
| Eliminar favorito existente   | `Favorito eliminado correctamente.` |
| Eliminar favorito inexistente | `La moneda no está en favoritos.`   |

---

## 10. Arquitectura respetada

El módulo mantiene la arquitectura establecida anteriormente:

```text
Model
  ↓
Service
  ↓
Repository
  ↓
Database
```

### Model

Representa los datos.

### Service

Contiene las reglas de negocio y validaciones.

### Repository

Se comunica con MySQL.

### Database

Gestiona la conexión con MySQL.

No se introducen nuevas capas ni patrones arquitectónicos.

---

## Estado del módulo

```text
Módulo 32
Estado: TERMINADO
```

### Conceptos aprendidos

- Validación de existencia de entidades.
- Validación de relaciones existentes.
- Prevención de duplicados.
- Uso de `exists()` desde los Services.
- Diferencia entre lógica de negocio y acceso a datos.
- Claves primarias compuestas.
- Tuplas de un elemento en Python.
- Coordinación entre diferentes Repositories desde un Service.

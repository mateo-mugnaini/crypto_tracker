# Módulo 29 - Consultar favoritos de un usuario

> **Estado**: TERMINADO
> **Proyecto**: Crypto Tracker - Backend
> **Capa**: Backend / API REST
> **Fecha**: 2026-08-09

---


## Objetivo

Implementar y probar la consulta de todas las monedas favoritas pertenecientes a un usuario.

---

## Arquitectura

El flujo utilizado es:

```text
Test
  ↓
FavoriteService
  ↓
FavoriteRepository
  ↓
MySQL
```

El `Service` solicita los favoritos y el `Repository` realiza la consulta SQL.

---

## FavoriteRepository

El método encargado de consultar los favoritos es:

```python
def find_all_by_user(self, user_id):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT *
    FROM favorites
    WHERE user_id = %s
    """

    cursor.execute(query, (user_id,))

    favorites = cursor.fetchall()

    cursor.close()
    connection.close()

    return favorites
```

La consulta utiliza `user_id` para obtener únicamente los favoritos pertenecientes al usuario indicado.

---

## FavoriteService

El Service expone esta operación:

```python
def get_favorites(self, user_id):
    return self.repository.find_all_by_user(user_id)
```

El Service no necesita conocer el SQL.

Su responsabilidad es utilizar el Repository para obtener los datos.

---

## `dictionary=True`

El cursor se crea utilizando:

```python
cursor = connection.cursor(dictionary=True)
```

Esto hace que cada fila obtenida de MySQL sea representada como un diccionario.

Por ejemplo:

```python
{
    "user_id": 1,
    "coin_id": "bitcoin"
}
```

En lugar de recibir una tupla:

```python
(1, "bitcoin")
```

Esto permite acceder directamente a las columnas:

```python
favorite["coin_id"]
```

---

## Test

Se creó:

```text
app/tests/get_favorites_test.py
```

Código:

```python
from app.repositories.favorite_repository import FavoriteRepository
from app.services.favorite_service import FavoriteService


def main():

    repository = FavoriteRepository()

    service = FavoriteService(repository)

    favorites = service.get_favorites(1)

    if not favorites:
        print("El usuario no tiene monedas favoritas.")
        return

    print("Favoritos del usuario:")

    for favorite in favorites:
        print(f"- {favorite['coin_id']}")


if __name__ == "__main__":
    main()
```

Se ejecuta mediante:

```powershell
python -m app.tests.get_favorites_test
```

---

## Usuario con favoritos

Si la base de datos contiene:

```text
user_id | coin_id
--------|---------
1       | bitcoin
1       | ethereum
1       | solana
2       | bitcoin
```

Al ejecutar:

```python
service.get_favorites(1)
```

el resultado debe contener:

```text
bitcoin
ethereum
solana
```

El `bitcoin` perteneciente al usuario `2` no debe aparecer.

---

## Usuario sin favoritos

Si el usuario no tiene favoritos:

```python
service.get_favorites(999)
```

`fetchall()` devuelve una lista vacía:

```python
[]
```

El test muestra:

```text
El usuario no tiene monedas favoritas.
```

---

## Estado de FavoriteService

Al finalizar este módulo:

```text
add_favorite()
remove_favorite()
get_favorites()
```

El Service permite:

- Agregar favoritos.
- Eliminar favoritos.
- Consultar favoritos.

---

## Estado de FavoriteRepository

Actualmente dispone de:

```text
save()
delete()
exists()
find_all_by_user()
```

### `save()`

Inserta un favorito.

### `exists()`

Comprueba si una combinación `user_id + coin_id` ya existe.

### `delete()`

Elimina un favorito específico.

### `find_all_by_user()`

Obtiene todos los favoritos de un usuario.

---

## CRUD de favoritos

La entidad `favorites` no necesita una operación `UPDATE`, porque el registro únicamente representa una relación entre un usuario y una moneda.

Tenemos:

| Operación | Implementación      |
| --------- | ------------------- |
| Create    | `add_favorite()`    |
| Read      | `get_favorites()`   |
| Update    | No aplica           |
| Delete    | `remove_favorite()` |

---

## Conceptos aprendidos

### Separación de responsabilidades

El Service maneja la lógica de negocio:

```text
FavoriteService
```

El Repository maneja el acceso a MySQL:

```text
FavoriteRepository
```

Esto evita colocar SQL directamente dentro del Service.

### Clave primaria compuesta

La tabla `favorites` utiliza:

```sql
PRIMARY KEY (user_id, coin_id)
```

Esto permite que:

- Un usuario tenga muchas monedas favoritas.
- Una misma moneda pueda ser favorita de muchos usuarios.
- Un usuario no pueda guardar dos veces la misma moneda.

Ejemplo:

```text
1 + bitcoin    → permitido
1 + ethereum   → permitido
2 + bitcoin    → permitido
1 + bitcoin    → duplicado
```

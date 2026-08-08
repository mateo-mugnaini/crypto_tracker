# Módulo 28 - Eliminación de favoritos

## Objetivo

Implementar la eliminación de una moneda de la lista de favoritos de un usuario.

---

## Arquitectura

El flujo utilizado es:

```text
FavoriteService

↓

FavoriteRepository

↓

MySQL
```

El Service solicita la eliminación y el Repository ejecuta la operación SQL.

---

## Método `remove_favorite()`

El `FavoriteService` contiene:

```python
def remove_favorite(self, user_id, coin_id):
    self.repository.delete(user_id, coin_id)
```

El Service no conoce los detalles de SQL.

---

## Método `delete()`

El Repository implementa:

```python
def delete(self, user_id, coin_id):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
    DELETE FROM favorites
    WHERE user_id = %s
    AND coin_id = %s
    """

    cursor.execute(query, (user_id, coin_id))

    connection.commit()

    cursor.close()
    connection.close()
```

---

## ¿Por qué usamos `user_id` y `coin_id`?

La tabla `favorites` utiliza una clave primaria compuesta:

```sql
PRIMARY KEY (user_id, coin_id)
```

Por lo tanto, ambos valores identifican de forma conjunta un favorito.

Esto permite que un mismo usuario tenga muchas monedas favoritas, pero evita que pueda guardar dos veces la misma moneda.

---

## ¿Por qué no usamos solamente `user_id`?

Porque un usuario puede tener múltiples favoritos.

Por ejemplo:

```text
user_id | coin_id
--------|--------
1       | bitcoin
1       | ethereum
1       | solana
```

Si utilizáramos solamente:

```sql
WHERE user_id = 1
```

eliminaríamos todos los favoritos del usuario.

Por eso utilizamos:

```sql
WHERE user_id = %s
AND coin_id = %s
```

---

## Responsabilidad de cada capa

### Service

Contiene la lógica de negocio:

```python
service.remove_favorite(1, "bitcoin")
```

### Repository

Contiene el acceso a la base de datos:

```sql
DELETE FROM favorites
WHERE user_id = %s
AND coin_id = %s
```

### Database

Almacena físicamente los favoritos.

---

## Estado del FavoriteService

Después de este módulo tenemos:

```text
add_favorite()
remove_favorite()
get_favorites()
```

El servicio ya puede agregar y eliminar favoritos y consultar los favoritos de un usuario.

---

## Concepto importante

La separación entre Service y Repository permite mantener las responsabilidades aisladas.

El Service no necesita saber si los datos se almacenan en MySQL, PostgreSQL u otra tecnología.

El Repository se encarga de esa implementación.

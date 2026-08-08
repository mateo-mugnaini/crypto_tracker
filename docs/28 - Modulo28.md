# Módulo 28 — Eliminar favoritos

Ahora vamos a completar la segunda operación del FavoriteService: eliminar una moneda de favoritos.

1. ¿Qué queremos conseguir?

Actualmente podemos hacer:

Usuario
↓
FavoriteService
↓
FavoriteRepository
↓
INSERT
↓
favorites

Ahora queremos poder hacer:

Usuario
↓
FavoriteService
↓
FavoriteRepository
↓
DELETE
↓
favorites

Por ejemplo, si tenemos:

| user_id | coin_id  |
| ------- | -------- |
| 1       | bitcoin  |
| 1       | ethereum |
| 1       | solana   |

Y ejecutamos:

service.remove_favorite(1, "bitcoin")

debería quedar:

| user_id | coin_id  |
| ------- | -------- |
| 1       | ethereum |
| 1       | solana   |

2. Implementar delete()

En:

app/repositories/favorite_repository.py

agrega:

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

Observa algo importante:

WHERE user_id = %s
AND coin_id = %s

No podemos eliminar simplemente por user_id, porque podríamos borrar todas las monedas favoritas del usuario.

La combinación:

user_id + coin_id

identifica exactamente qué favorito queremos eliminar.

3. Nuestro Service ya estaba preparado

Tu Service ya tiene:

def remove_favorite(self, user_id, coin_id):
self.repository.delete(user_id, coin_id)

Por lo tanto, no necesitamos modificarlo.

Esto es precisamente una ventaja de haber separado Service y Repository.

El Service dice:

"Quiero eliminar este favorito."

El Repository se encarga de saber cómo hacerlo en MySQL.

4. Modificar el test

Ahora vamos a comprobar tanto guardar como eliminar.

Tu test puede quedar:

from app.models.favorite import Favorite
from app.repositories.favorite_repository import FavoriteRepository
from app.services.favorite_service import FavoriteService

def main():

    repository = FavoriteRepository()

    service = FavoriteService(repository)

    favorite = Favorite(1, "bitcoin")

    service.add_favorite(favorite)

    print("Favorito agregado correctamente.")

    service.remove_favorite(1, "bitcoin")

    print("Favorito eliminado correctamente.")

if **name** == "**main**":
main()
Pero hay un detalle

Como ya tienes:

1 + bitcoin

posiblemente guardado en la base de datos, si ejecutas primero:

service.add_favorite(favorite)

volverás a recibir:

Duplicate entry '1-bitcoin'

Por eso, antes de ejecutar el test, puedes comprobar:

SELECT \*
FROM favorites;

Si ya existe:

1 | bitcoin

elimínalo manualmente:

DELETE FROM favorites
WHERE user_id = 1
AND coin_id = 'bitcoin';

Después ejecuta:

python -m app.tests.favorite_service_test

Deberías obtener:

Favorito agregado correctamente.
Favorito eliminado correctamente.

Y posteriormente:

SELECT \*
FROM favorites;

debería mostrar que bitcoin ya no está.

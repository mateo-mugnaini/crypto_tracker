# Módulo 29 — Consultar favoritos de un usuario

En este módulo vamos a completar la tercera operación de FavoriteService:

add_favorite()
remove_favorite()
get_favorites()

Ya tenemos las dos primeras. Ahora vamos a trabajar correctamente con:

get_favorites(user_id)
1. Nuestro Repository ya tiene este método

Actualmente tienes:

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

Esto devuelve todos los favoritos pertenecientes a un usuario.

Por ejemplo, si tenemos:

user_id | coin_id
--------|---------
1       | bitcoin
1       | ethereum
1       | solana
2       | bitcoin

y ejecutamos:

repository.find_all_by_user(1)

obtendremos solamente:

bitcoin
ethereum
solana

No aparecerá el bitcoin del usuario 2.

2. El Service

Tu Service ya tiene:

def get_favorites(self, user_id):
    return self.repository.find_all_by_user(user_id)

Por ahora no necesitamos modificarlo.

El flujo queda:

Test
  ↓
FavoriteService
  ↓
FavoriteRepository
  ↓
MySQL
3. Crear el test

Crea:

app/tests/get_favorites_test.py

Con:

from app.repositories.favorite_repository import FavoriteRepository
from app.services.favorite_service import FavoriteService


def main():

    repository = FavoriteRepository()

    service = FavoriteService(repository)

    favorites = service.get_favorites(1)

    print("Favoritos del usuario:")

    for favorite in favorites:
        print(f"- {favorite['coin_id']}")


if __name__ == "__main__":
    main()

Ejecuta:

python -m app.tests.get_favorites_test

Si el usuario 1 tiene:

bitcoin
ethereum
solana

deberías obtener:

Favoritos del usuario:
- bitcoin
- ethereum
- solana
4. ¿Por qué usamos dictionary=True?

En el Repository tienes:

cursor = connection.cursor(dictionary=True)

Esto hace que MySQL Connector devuelva cada fila como un diccionario.

Sin dictionary=True, podrías obtener algo parecido a:

(1, "bitcoin")

Con dictionary=True:

{
    "user_id": 1,
    "coin_id": "bitcoin"
}

Por eso podemos hacer:

favorite["coin_id"]

Esto es especialmente útil cuando trabajamos con varias columnas.

5. ¿Qué ocurre si el usuario no tiene favoritos?

El Repository utiliza:

favorites = cursor.fetchall()

Si no encuentra registros, fetchall() devuelve una lista vacía:

[]

Por lo tanto, nuestro test puede manejarlo:

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

Ahora tenemos dos posibles resultados.

Con favoritos
Favoritos del usuario:
- bitcoin
- ethereum
- solana
Sin favoritos
El usuario no tiene monedas favoritas.
6. Algo importante: no estamos creando Favorite todavía

Fíjate que find_all_by_user() devuelve diccionarios:

{
    "user_id": 1,
    "coin_id": "bitcoin"
}

No objetos:

Favorite(1, "bitcoin")

Por ahora está bien.

Más adelante podemos introducir una conversión:

Database
   ↓
Repository
   ↓
dict
   ↓
Model
   ↓
Service

pero no vamos a adelantarnos. El objetivo de este módulo es entender primero la consulta y el flujo.
Módulo 32 — Validación y gestión de favoritos
Objetivo

Continuar trabajando con la funcionalidad de favoritos utilizando la arquitectura definida en el proyecto:

app/
├── api/
├── config/
├── controllers/
├── database/
├── exceptions/
├── models/
├── repositories/
├── services/
└── tests/

En este módulo vamos a reforzar FavoriteService para que las operaciones de favoritos tengan validaciones antes de acceder al Repository.

La responsabilidad continúa estando separada de esta manera:

Model
↓
Representa los datos

Service
↓
Contiene la lógica de negocio

Repository
↓
Accede a MySQL

1. Estado actual

Ya tenemos los siguientes componentes.

Model
app/models/favorite.py
class Favorite:

    def __init__(self, user_id, coin_id):
        self.user_id = user_id
        self.coin_id = coin_id

    def __str__(self):
        return f"User {self.user_id} favorite {self.coin_id}"

No utilizamos @dataclass, de acuerdo con la decisión tomada para este proyecto.

2. FavoriteRepository

El Repository ya dispone de las operaciones necesarias:

save()
find_all_by_user()
exists()
delete()
find_all_with_coin_data()

Por ejemplo:

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

No necesitamos crear otro método exists().

3. UserRepository

También disponemos de:

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

Esto permite comprobar desde el Service si el usuario existe.

4. CoinRepository

También tenemos:

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

Por lo tanto podemos comprobar si la moneda existe antes de crear el favorito.

5. FavoriteService

El Service será el encargado de aplicar las reglas de negocio.

La versión del Service para este módulo es:

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

6. ¿Por qué esta lógica está en Service?

Porque estamos aplicando una regla de negocio.

Por ejemplo:

if self.favorite_repository.exists(
favorite.user_id,
favorite.coin_id
):

No queremos simplemente dejar que MySQL genere:

Duplicate entry '1-bitcoin' for key 'favorites.PRIMARY'

El Service conoce la regla:

Un usuario no puede tener dos veces la misma moneda en favoritos.

El Repository únicamente sabe consultar MySQL.

7. Agregar un favorito

El flujo es:

Favorite
↓
FavoriteService
↓
¿Existe usuario?
↓
¿Existe moneda?
↓
¿Ya está en favoritos?
↓
FavoriteRepository.save()

Por ejemplo:

favorite = Favorite(1, "bitcoin")

success, message = service.add_favorite(favorite)

print(message) 8. Eliminar un favorito

El flujo es:

user_id + coin_id
↓
FavoriteService
↓
¿Existe favorito?
↓ ↓
NO SÍ
↓ ↓
mensaje DELETE

Código:

success, message = service.remove_favorite(
1,
"bitcoin"
)

print(message)

Si existe:

Favorito eliminado correctamente.

Si no existe:

La moneda no está en favoritos. 9. Consultar favoritos

Para consultar:

success, favorites = service.get_favorites(1)

if success:

    for favorite in favorites:
        print(favorite)

else:

    print(favorites)

El Repository devuelve los registros obtenidos desde MySQL.

10. Test del módulo

Podemos utilizar:

app/tests/favorite_service_test.py
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

if **name** == "**main**":
main()

Ejecutamos:

python -m app.tests.favorite_service_test 11. Casos que debemos probar
Usuario inexistente
favorite = Favorite(999, "bitcoin")

Resultado:

El usuario no existe.
Moneda inexistente
favorite = Favorite(1, "moneda-inexistente")

Resultado:

La moneda no existe.
Favorito duplicado
favorite = Favorite(1, "bitcoin")

si ya existe:

La moneda ya está en favoritos.
Favorito nuevo

Si el usuario y la moneda existen y todavía no existe la relación:

Favorito agregado correctamente. 12. Arquitectura utilizada

La arquitectura continúa siendo exactamente la definida en el Módulo 8:

Models
↓
Services
↓
Repositories
↓
Database

Y los demás componentes mantienen sus responsabilidades:

app/
│
├── api/
│ └── Comunicación con APIs externas
│
├── config/
│ └── Configuración
│
├── controllers/
│ └── Entrada/salida de la aplicación
│
├── database/
│ └── Conexión MySQL
│
├── exceptions/
│ └── Excepciones personalizadas
│
├── models/
│ └── Entidades
│
├── repositories/
│ └── Acceso a datos
│
├── services/
│ └── Lógica de negocio
│
└── tests/
└── Pruebas

No estamos agregando ninguna capa nueva.

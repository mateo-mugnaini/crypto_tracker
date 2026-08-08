# Módulo 31 — Validación de favoritos

En este módulo vamos a mejorar la lógica de FavoriteService para que no dependa únicamente de las restricciones de MySQL.

La idea es que el Service pueda detectar situaciones inválidas antes de intentar guardar datos en la base de datos.

1. Problema actual

Actualmente tenemos:

def add_favorite(self, favorite):

    if self.repository.exists(
        favorite.user_id,
        favorite.coin_id
    ):
        return False

    self.repository.save(favorite)

    return True

Esto evita duplicados, pero todavía podemos intentar guardar:

user_id = 999
coin_id = "bitcoin"

aunque ese usuario no exista.

MySQL terminaría lanzando un error por la foreign key.

2. Validar que el usuario exista

Primero necesitamos que UserRepository tenga una operación para comprobar si existe un usuario.

En:

app/repositories/user_repository.py

agrega:

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

La lógica es exactamente la misma que utilizamos anteriormente con FavoriteRepository.

3. Validar que la moneda exista

También necesitamos comprobar que coin_id exista en coins.

En CoinRepository agrega:

def exists(self, coin_id):

    connection = get_connection()
    cursor = connection.cursor()

    query = """
    SELECT 1
    FROM coins
    WHERE id = %s
    LIMIT 1
    """

    cursor.execute(query, (coin_id,))

    result = cursor.fetchone()

    cursor.close()
    connection.close()

    return result is not None

Ahora podemos preguntar:

¿Existe el usuario?
↓
¿Existe la moneda?
↓
¿Ya es favorito?
↓
Guardar 4. Modificar FavoriteService

Ahora necesitamos inyectar los repositories que necesitamos.

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

Aquí aparece algo nuevo:

return True, "Favorito agregado correctamente."

Estamos devolviendo dos valores:

booleano
mensaje

Por ejemplo:

True, "Favorito agregado correctamente."

o:

False, "La moneda no existe."

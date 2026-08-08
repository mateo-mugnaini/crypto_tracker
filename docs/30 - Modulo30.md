# Módulo 30 — Integración entre favoritos y monedas

En este módulo vamos a dar un paso importante: hasta ahora favorites nos permite guardar: `user_id + coin_id`

pero tenemos una limitación: solo conocemos el ID de la moneda.

Ahora vamos a consultar los favoritos junto con la información de coins, utilizando un JOIN.

1. El problema

Actualmente:

SELECT \*
FROM favorites
WHERE user_id = %s;

devuelve algo como:

| user_id | coin_id  |
| ------- | -------- |
| 1       | bitcoin  |
| 1       | ethereum |

Pero sería más útil obtener:

| coin_id  | symbol | name     | market_cap_rank |
| -------- | ------ | -------- | --------------- |
| bitcoin  | btc    | Bitcoin  | 1               |
| ethereum | eth    | Ethereum | 2               |

Para eso utilizaremos:

JOIN coins 2. Modificar FavoriteRepository

Agrega un nuevo método:

def find_all_with_coin_data(self, user_id):

    connection = get_connection()
    cursor = connection.cursor(dictionary=True)

    query = """
    SELECT
        f.user_id,
        f.coin_id,
        c.symbol,
        c.name,
        c.market_cap_rank
    FROM favorites f
    INNER JOIN coins c
        ON f.coin_id = c.id
    WHERE f.user_id = %s
    """

    cursor.execute(query, (user_id,))

    favorites = cursor.fetchall()

    cursor.close()
    connection.close()

    return favorites

3. ¿Qué está pasando?

Tenemos:

favorites

con:

user_id
coin_id

y:

coins

con:

id
symbol
name
market_cap_rank

La relación es:

favorites.coin_id
│
▼
coins.id

Por eso:

INNER JOIN coins c
ON f.coin_id = c.id

El resultado combina ambas tablas.

4. Agregarlo al Service

En favorite_service.py:

class FavoriteService:

    def __init__(self, repository):
        self.repository = repository

    def add_favorite(self, favorite):

        if self.repository.exists(
            favorite.user_id,
            favorite.coin_id
        ):
            return False

        self.repository.save(favorite)

        return True

    def remove_favorite(self, user_id, coin_id):

        if not self.repository.exists(user_id, coin_id):
            return False

        return self.repository.delete(user_id, coin_id)

    def get_favorites(self, user_id):

        return self.repository.find_all_by_user(user_id)

    def get_favorites_with_coin_data(self, user_id):

        return self.repository.find_all_with_coin_data(user_id)

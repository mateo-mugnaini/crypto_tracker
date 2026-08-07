# import unittest
# from unittest.mock import patch

# from app.models.coin import Coin
# from app.repositories.coin_repository import CoinRepository


# class FakeCursor:
#     def __init__(self):
#         self.executed = None
#         self.closed = False

#     def execute(self, query, values):
#         self.executed = (query, values)

#     def close(self):
#         self.closed = True


# class FakeConnection:
#     def __init__(self, cursor):
#         self._cursor = cursor
#         self.committed = False
#         self.closed = False

#     def cursor(self):
#         return self._cursor

#     def commit(self):
#         self.committed = True

#     def close(self):
#         self.closed = True


# class CoinRepositoryTest(unittest.TestCase):
#     @patch("app.repositories.coin_repository.get_connection")
#     def test_save_executes_upsert_query(self, mock_get_connection):
#         cursor = FakeCursor()
#         connection = FakeConnection(cursor)
#         mock_get_connection.return_value = connection

#         repository = CoinRepository()
#         repository.save(
#             Coin(id="bitcoin", symbol="btc", name="Bitcoin", market_cap_rank=1)
#         )

#         self.assertTrue(connection.committed)
#         self.assertTrue(connection.closed)
#         self.assertTrue(cursor.closed)
#         self.assertIsNotNone(cursor.executed)

#         query, values = cursor.executed
#         self.assertIn("INSERT INTO coins", query)
#         self.assertIn("ON DUPLICATE KEY UPDATE", query)
#         self.assertEqual(values, ("bitcoin", "btc", "Bitcoin", 1))

from datetime import datetime

from app.models.user import User
from app.models.favorite import Favorite
from app.models.price_history import PriceHistory

from app.repositories.user_repository import UserRepository
from app.repositories.favorite_repository import FavoriteRepository
from app.repositories.price_history_repository import PriceHistoryRepository


def main():

    user = User(None, "mateo", "mateo@test.com", "hash123", datetime.now())

    user_repository = UserRepository()

    user_repository.save(user)

    favorite = Favorite(1, "bitcoin")

    favorite_repository = FavoriteRepository()

    favorite_repository.save(favorite)

    history = PriceHistory(None, "bitcoin", 60000, datetime.now())

    history_repository = PriceHistoryRepository()

    history_repository.save(history)

    print("Datos guardados correctamente")


if __name__ == "__main__":
    main()

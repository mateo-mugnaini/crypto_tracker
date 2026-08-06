import unittest
from unittest.mock import patch

from app.models.coin import Coin
from app.repositories.coin_repository import CoinRepository


class FakeCursor:
    def __init__(self):
        self.executed = None
        self.closed = False

    def execute(self, query, values):
        self.executed = (query, values)

    def close(self):
        self.closed = True


class FakeConnection:
    def __init__(self, cursor):
        self._cursor = cursor
        self.committed = False
        self.closed = False

    def cursor(self):
        return self._cursor

    def commit(self):
        self.committed = True

    def close(self):
        self.closed = True


class CoinRepositoryTest(unittest.TestCase):
    @patch("app.repositories.coin_repository.get_connection")
    def test_save_executes_upsert_query(self, mock_get_connection):
        cursor = FakeCursor()
        connection = FakeConnection(cursor)
        mock_get_connection.return_value = connection

        repository = CoinRepository()
        repository.save(
            Coin(id="bitcoin", symbol="btc", name="Bitcoin", market_cap_rank=1)
        )

        self.assertTrue(connection.committed)
        self.assertTrue(connection.closed)
        self.assertTrue(cursor.closed)
        self.assertIsNotNone(cursor.executed)

        query, values = cursor.executed
        self.assertIn("INSERT INTO coins", query)
        self.assertIn("ON DUPLICATE KEY UPDATE", query)
        self.assertEqual(values, ("bitcoin", "btc", "Bitcoin", 1))


import unittest
from unittest.mock import patch

from app.repositories.price_history_repository import PriceHistoryRepository


class FakeCursor:
    def __init__(self):
        self.executed = None
        self.closed = False

    def execute(self, query, params):
        self.executed = (query, params)

    def fetchone(self):
        return {
            "count": 3,
            "min_price": 64000,
            "max_price": 65000,
            "average_price": 64500,
        }

    def close(self):
        self.closed = True


class FakeConnection:
    def __init__(self, cursor):
        self.cursor_instance = cursor
        self.closed = False

    def cursor(self, dictionary=False):
        assert dictionary is True
        return self.cursor_instance

    def close(self):
        self.closed = True


class PriceHistoryStatisticsRepositoryTest(unittest.TestCase):
    @patch("app.repositories.price_history_repository.get_connection")
    def test_get_statistics_by_coin_id_executes_aggregate_query(
        self,
        mock_get_connection,
    ):
        cursor = FakeCursor()
        connection = FakeConnection(cursor)
        mock_get_connection.return_value = connection

        repository = PriceHistoryRepository()

        result = repository.get_statistics_by_coin_id("bitcoin")

        self.assertEqual(result["count"], 3)
        self.assertIn("COUNT(*) AS count", cursor.executed[0])
        self.assertIn("MIN(price) AS min_price", cursor.executed[0])
        self.assertIn("MAX(price) AS max_price", cursor.executed[0])
        self.assertIn("AVG(price) AS average_price", cursor.executed[0])
        self.assertIn("WHERE coin_id = %s", cursor.executed[0])
        self.assertEqual(cursor.executed[1], ("bitcoin",))
        self.assertTrue(cursor.closed)
        self.assertTrue(connection.closed)


if __name__ == "__main__":
    unittest.main()

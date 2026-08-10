import unittest
from datetime import datetime
from unittest.mock import patch

from app.repositories.price_history_repository import PriceHistoryRepository


class FakeCursor:
    def __init__(self):
        self.executed = []
        self.closed = False
        self.rows = [
            {"price": 100, "recorded_at": datetime(2026, 8, 1, 10, 0)},
            {"price": 125, "recorded_at": datetime(2026, 8, 10, 10, 0)},
        ]

    def execute(self, query, params):
        self.executed.append((query, params))

    def fetchone(self):
        return self.rows.pop(0)

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


class PriceHistoryVariationRepositoryTest(unittest.TestCase):
    @patch("app.repositories.price_history_repository.get_connection")
    def test_get_initial_and_final_prices_executes_ordered_queries(
        self,
        mock_get_connection,
    ):
        cursor = FakeCursor()
        connection = FakeConnection(cursor)
        mock_get_connection.return_value = connection

        repository = PriceHistoryRepository()

        result = repository.get_initial_and_final_prices(
            coin_id="bitcoin",
            start_date=datetime(2026, 8, 1, 0, 0),
            end_date=datetime(2026, 8, 10, 23, 59, 59),
        )

        self.assertEqual(result["initial_price"], 100)
        self.assertEqual(result["final_price"], 125)
        self.assertEqual(len(cursor.executed), 2)
        self.assertIn("ORDER BY recorded_at ASC, id ASC", cursor.executed[0][0])
        self.assertIn("ORDER BY recorded_at DESC, id DESC", cursor.executed[1][0])
        self.assertEqual(
            cursor.executed[0][1],
            (
                "bitcoin",
                datetime(2026, 8, 1, 0, 0),
                datetime(2026, 8, 10, 23, 59, 59),
            ),
        )
        self.assertEqual(cursor.executed[0][1], cursor.executed[1][1])
        self.assertTrue(cursor.closed)
        self.assertTrue(connection.closed)


if __name__ == "__main__":
    unittest.main()

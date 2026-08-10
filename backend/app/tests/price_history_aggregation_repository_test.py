import unittest
from datetime import datetime
from unittest.mock import patch

from app.repositories.price_history_repository import PriceHistoryRepository


class FakeCursor:
    def __init__(self):
        self.executed = None
        self.closed = False

    def execute(self, query, params):
        self.executed = (query, params)

    def fetchall(self):
        return [
            {
                "period": datetime(2026, 8, 1),
                "average_price": 105,
                "min_price": 100,
                "max_price": 110,
                "count": 2,
            }
        ]

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


class PriceHistoryAggregationRepositoryTest(unittest.TestCase):
    @patch("app.repositories.price_history_repository.get_connection")
    def test_get_price_aggregations_builds_daily_group_query(
        self,
        mock_get_connection,
    ):
        cursor = FakeCursor()
        connection = FakeConnection(cursor)
        mock_get_connection.return_value = connection

        repository = PriceHistoryRepository()

        result = repository.get_price_aggregations(
            coin_id="bitcoin",
            period="day",
            start_date=datetime(2026, 8, 1),
            end_date=datetime(2026, 8, 31, 23, 59, 59),
        )

        query, params = cursor.executed

        self.assertEqual(result[0]["count"], 2)
        self.assertIn("AVG(price) AS average_price", query)
        self.assertIn("MIN(price) AS min_price", query)
        self.assertIn("MAX(price) AS max_price", query)
        self.assertIn("COUNT(*) AS count", query)
        self.assertIn("DATE(recorded_at) AS period", query)
        self.assertIn("GROUP BY DATE(recorded_at)", query)
        self.assertIn("ORDER BY DATE(recorded_at) ASC", query)
        self.assertEqual(
            params,
            (
                "bitcoin",
                datetime(2026, 8, 1),
                datetime(2026, 8, 31, 23, 59, 59),
            ),
        )
        self.assertTrue(cursor.closed)
        self.assertTrue(connection.closed)

    @patch("app.repositories.price_history_repository.get_connection")
    def test_get_price_aggregations_rejects_invalid_period(
        self,
        mock_get_connection,
    ):
        repository = PriceHistoryRepository()

        with self.assertRaisesRegex(ValueError, "period"):
            repository.get_price_aggregations(
                coin_id="bitcoin",
                period="month",
            )

        mock_get_connection.assert_not_called()


if __name__ == "__main__":
    unittest.main()

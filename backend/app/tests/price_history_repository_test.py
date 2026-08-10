import unittest
from unittest.mock import patch

from app.repositories.price_history_repository import PriceHistoryRepository


class FakeCursor:
    def __init__(self):
        self.executed = None
        self.closed = False

    def execute(self, query, params):
        self.executed = (query, params)

    def fetchall(self):
        return []

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


class PriceHistoryRepositoryTest(unittest.TestCase):
    @patch("app.repositories.price_history_repository.get_connection")
    def test_find_by_coin_id_orders_by_price_desc_with_filters_and_pagination(
        self,
        mock_get_connection,
    ):
        cursor = FakeCursor()
        connection = FakeConnection(cursor)
        mock_get_connection.return_value = connection

        repository = PriceHistoryRepository()

        result = repository.find_by_coin_id(
            coin_id="bitcoin",
            min_price=64000,
            max_price=65000,
            limit=10,
            offset=20,
            sort_by="price",
            sort_order="desc",
        )

        self.assertEqual(result, [])
        self.assertIn("AND price >= %s", cursor.executed[0])
        self.assertIn("AND price <= %s", cursor.executed[0])
        self.assertIn("ORDER BY price DESC, id ASC", cursor.executed[0])
        self.assertIn("LIMIT %s", cursor.executed[0])
        self.assertIn("OFFSET %s", cursor.executed[0])
        self.assertEqual(
            cursor.executed[1],
            ["bitcoin", 64000, 65000, 10, 20],
        )
        self.assertTrue(cursor.closed)
        self.assertTrue(connection.closed)

    @patch("app.repositories.price_history_repository.get_connection")
    def test_find_by_coin_id_rejects_unknown_sort_field(self, mock_get_connection):
        repository = PriceHistoryRepository()

        with self.assertRaisesRegex(ValueError, "sort_by"):
            repository.find_by_coin_id(
                coin_id="bitcoin",
                sort_by="price; DROP TABLE price_history",
            )

        mock_get_connection.assert_not_called()

    @patch("app.repositories.price_history_repository.get_connection")
    def test_find_by_coin_id_rejects_unknown_sort_direction(
        self,
        mock_get_connection,
    ):
        repository = PriceHistoryRepository()

        with self.assertRaisesRegex(ValueError, "sort_order"):
            repository.find_by_coin_id(
                coin_id="bitcoin",
                sort_order="descending",
            )

        mock_get_connection.assert_not_called()


if __name__ == "__main__":
    unittest.main()

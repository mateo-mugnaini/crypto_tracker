import unittest
from unittest.mock import patch

from app.database import connection as connection_module


class GetConnectionTest(unittest.TestCase):
    @patch("app.database.connection.pooling.MySQLConnectionPool")
    def test_get_connection_uses_lazy_pool(self, mock_pool_class):
        expected_connection = object()
        mock_pool = mock_pool_class.return_value
        mock_pool.get_connection.return_value = expected_connection

        with patch.object(connection_module, "_connection_pool", None):
            connection = connection_module.get_connection()
            second_connection = connection_module.get_connection()

        self.assertIs(connection, expected_connection)
        self.assertIs(second_connection, expected_connection)
        mock_pool_class.assert_called_once_with(
            pool_name="crypto_tracker_app",
            pool_size=connection_module.settings.mysql_pool_size,
            pool_reset_session=True,
            host=connection_module.settings.mysql_host,
            port=connection_module.settings.mysql_port,
            user=connection_module.settings.mysql_user,
            password=connection_module.settings.mysql_password,
            database=connection_module.settings.mysql_database,
        )
        self.assertEqual(mock_pool.get_connection.call_count, 2)

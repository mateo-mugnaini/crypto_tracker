import unittest
from unittest.mock import patch

from app.database import connection as connection_module


class GetConnectionTest(unittest.TestCase):
    @patch("app.database.connection.mysql.connector.connect")
    def test_get_connection_uses_settings(self, mock_connect):
        expected_connection = object()
        mock_connect.return_value = expected_connection

        connection = connection_module.get_connection()

        self.assertIs(connection, expected_connection)
        mock_connect.assert_called_once_with(
            host=connection_module.settings.mysql_host,
            port=connection_module.settings.mysql_port,
            user=connection_module.settings.mysql_user,
            password=connection_module.settings.mysql_password,
            database=connection_module.settings.mysql_database,
        )


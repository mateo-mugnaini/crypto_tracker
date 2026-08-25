from unittest.mock import Mock, patch


def test_liveness_does_not_require_database(api_client):
    response = api_client.get("/health/live")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "crypto-tracker-api",
        "checks": {},
    }


@patch("app.api.health.get_connection")
def test_readiness_returns_ready_when_database_responds(mock_get_connection, api_client):
    connection = Mock()
    cursor = Mock()
    connection.cursor.return_value = cursor
    mock_get_connection.return_value = connection

    response = api_client.get("/health/ready")

    assert response.status_code == 200
    assert response.json()["status"] == "ready"
    assert response.json()["checks"] == {"database": "ok"}
    cursor.execute.assert_called_once_with("SELECT 1")
    cursor.close.assert_called_once_with()
    connection.close.assert_called_once_with()


@patch("app.api.health.get_connection")
def test_readiness_returns_503_without_database(mock_get_connection, api_client):
    mock_get_connection.side_effect = RuntimeError("database unavailable")

    response = api_client.get("/health/ready")

    assert response.status_code == 503
    assert response.json() == {
        "status": "not_ready",
        "service": "crypto-tracker-api",
        "checks": {"database": "unavailable"},
    }

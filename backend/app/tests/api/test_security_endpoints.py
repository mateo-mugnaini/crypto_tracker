from unittest.mock import Mock

import pytest

import app.api.app as api_app
from app.api.dependencies import get_user_controller, login_rate_limiter


pytestmark = pytest.mark.api


def test_cors_preflight_allows_configured_frontend_origin(api_client):
    response = api_client.options(
        "/users/login",
        headers={
            "Origin": "http://127.0.0.1:5173",
            "Access-Control-Request-Method": "POST",
            "Access-Control-Request-Headers": "authorization,content-type",
        },
    )

    assert response.status_code == 200
    assert response.headers["access-control-allow-origin"] == "http://127.0.0.1:5173"
    assert "POST" in response.headers["access-control-allow-methods"]
    assert "Authorization" in response.headers["access-control-allow-headers"]


def test_cors_does_not_allow_unknown_origin(api_client):
    response = api_client.get(
        "/",
        headers={"Origin": "https://malicious.example"},
    )

    assert response.status_code == 200
    assert "access-control-allow-origin" not in response.headers


def test_market_stream_requires_bearer_token(api_client):
    response = api_client.get("/market/stream")

    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "authentication_required"


def test_login_returns_429_after_configured_number_of_requests(api_client):
    controller = Mock()
    controller.login.return_value = "jwt-token"
    api_app.app.dependency_overrides[get_user_controller] = lambda: controller
    login_rate_limiter.reset()

    try:
        for _ in range(10):
            response = api_client.post(
                "/users/login",
                json={
                    "email": "mateo@example.test",
                    "password": "secure-pass",
                },
            )
            assert response.status_code == 200

        response = api_client.post(
            "/users/login",
            json={
                "email": "mateo@example.test",
                "password": "secure-pass",
            },
        )

        assert response.status_code == 429
        assert response.json()["detail"]["code"] == "rate_limit_exceeded"
        assert int(response.headers["retry-after"]) >= 1
    finally:
        login_rate_limiter.reset()

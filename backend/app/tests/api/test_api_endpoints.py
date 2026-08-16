from datetime import datetime
from unittest.mock import Mock

import pytest

import app.api.app as api_app
from app.api.dependencies import (
    get_coin_controller,
    get_favorite_controller,
    get_price_history_controller,
    get_user_controller,
    get_current_user,
)
from app.exceptions.domain_exception import EmailAlreadyExistsException

pytestmark = pytest.mark.api


def test_post_favorites_returns_201_and_normalizes_request_body(api_client):
    controller = Mock()
    controller.add_favorite.return_value = {
        "success": True,
        "message": "Favorito agregado correctamente.",
    }
    api_app.app.dependency_overrides[get_favorite_controller] = lambda: controller
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 1}

    response = api_client.post(
        "/favorites",
        json={"user_id": 1, "coin_id": " BITCOIN "},
    )

    assert response.status_code == 201
    assert response.json() == {
        "success": True,
        "message": "Favorito agregado correctamente.",
    }
    favorite = controller.add_favorite.call_args.args[0]
    assert favorite.user_id == 1
    assert favorite.coin_id == "bitcoin"


def test_post_favorites_returns_422_before_calling_controller_for_invalid_body(api_client):
    controller = Mock()
    api_app.app.dependency_overrides[get_favorite_controller] = lambda: controller
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 1}

    response = api_client.post(
        "/favorites",
        json={"user_id": 0, "coin_id": "bitcoin"},
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "user_id"]
    controller.add_favorite.assert_not_called()


def test_delete_favorites_returns_204_without_response_body(api_client):
    controller = Mock()
    controller.remove_favorite.return_value = {
        "success": True,
        "message": "Favorito eliminado correctamente.",
    }
    api_app.app.dependency_overrides[get_favorite_controller] = lambda: controller
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 1}

    response = api_client.delete("/favorites/bitcoin?user_id=1")

    assert response.status_code == 204
    assert response.content == b""
    controller.remove_favorite.assert_called_once_with(1, "bitcoin")


def test_favorites_returns_403_when_token_user_does_not_own_resource(api_client):
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 2}

    response = api_client.get("/favorites?user_id=1")

    assert response.status_code == 403
    assert response.json()["detail"]["code"] == "forbidden"


@pytest.mark.parametrize(
    ("method", "url", "kwargs"),
    [
        ("post", "/favorites", {"json": {"user_id": 1, "coin_id": "bitcoin"}}),
        ("delete", "/favorites/bitcoin?user_id=1", {}),
        ("get", "/favorites?user_id=1", {}),
        ("get", "/favorites/details?user_id=1", {}),
    ],
)
def test_all_favorite_endpoints_require_bearer_token(api_client, method, url, kwargs):
    response = getattr(api_client, method)(url, **kwargs)

    assert response.status_code == 401


def test_get_coins_returns_controller_contract(api_client):
    controller = Mock()
    controller.get_all_coins.return_value = {
        "success": True,
        "message": "Monedas obtenidas correctamente.",
        "data": [{"id": "bitcoin"}],
    }
    api_app.app.dependency_overrides[get_coin_controller] = lambda: controller

    response = api_client.get("/coins")

    assert response.status_code == 200
    assert response.json()["data"] == [{"id": "bitcoin"}]
    controller.get_all_coins.assert_called_once_with()


def test_get_price_history_serializes_response_and_passes_validated_filters(api_client):
    controller = Mock()
    controller.get_price_history.return_value = [
        {
            "id": 1,
            "coin_id": "bitcoin",
            "price": 65000,
            "recorded_at": datetime(2026, 8, 10, 12, 0),
        }
    ]
    api_app.app.dependency_overrides[get_price_history_controller] = lambda: controller

    response = api_client.get(
        "/coins/bitcoin/price-history?limit=10&offset=5&sort_by=PRICE&sort_order=DESC"
    )

    assert response.status_code == 200
    assert response.json() == [
        {
            "id": 1,
            "coin_id": "bitcoin",
            "price": 65000.0,
            "recorded_at": "2026-08-10T12:00:00",
        }
    ]
    controller.get_price_history.assert_called_once_with(
        coin_id="bitcoin",
        start_date=None,
        end_date=None,
        min_price=None,
        max_price=None,
        limit=10,
        offset=5,
        sort_by="price",
        sort_order="desc",
    )


def test_get_price_history_returns_422_for_invalid_query_before_controller(api_client):
    controller = Mock()
    api_app.app.dependency_overrides[get_price_history_controller] = lambda: controller

    response = api_client.get("/coins/bitcoin/price-history?limit=0")

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["query", "limit"]
    controller.get_price_history.assert_not_called()


def test_price_history_rejects_sql_injection_attempt_in_sorting(api_client):
    controller = Mock()
    api_app.app.dependency_overrides[get_price_history_controller] = lambda: controller

    response = api_client.get(
        "/coins/bitcoin/price-history?sort_by=price%3B%20DROP%20TABLE%20price_history"
    )

    assert response.status_code == 422
    controller.get_price_history.assert_not_called()


def test_register_user_returns_safe_response_without_password_hash(api_client):
    controller = Mock()
    controller.register_user.return_value = {
        "id": 1,
        "username": "mateo",
        "email": "mateo@example.test",
        "password_hash": "must-not-leak",
        "created_at": "2026-08-16T12:00:00",
    }
    api_app.app.dependency_overrides[get_user_controller] = lambda: controller

    response = api_client.post(
        "/users/register",
        json={"username": "mateo", "email": "MATEO@EXAMPLE.TEST", "password": "secure-pass"},
    )

    assert response.status_code == 201
    assert response.json()["email"] == "mateo@example.test"
    assert "password_hash" not in response.json()


def test_register_user_returns_409_for_duplicate_email(api_client):
    controller = Mock()
    controller.register_user.side_effect = EmailAlreadyExistsException("El email ya está registrado.")
    api_app.app.dependency_overrides[get_user_controller] = lambda: controller

    response = api_client.post(
        "/users/register",
        json={"username": "mateo", "email": "mateo@example.test", "password": "secure-pass"},
    )

    assert response.status_code == 409
    assert response.json()["detail"]["code"] == "email_already_exists"


def test_login_returns_bearer_access_token(api_client):
    controller = Mock()
    controller.login.return_value = "jwt-token"
    api_app.app.dependency_overrides[get_user_controller] = lambda: controller

    response = api_client.post(
        "/users/login",
        json={"email": "MATEO@EXAMPLE.TEST", "password": "secure-pass"},
    )

    assert response.status_code == 200
    assert response.json() == {"access_token": "jwt-token", "token_type": "bearer"}


def test_login_returns_401_for_invalid_credentials(api_client):
    from app.exceptions.domain_exception import InvalidCredentialsException

    controller = Mock()
    controller.login.side_effect = InvalidCredentialsException("Email o password incorrectos.")
    api_app.app.dependency_overrides[get_user_controller] = lambda: controller

    response = api_client.post(
        "/users/login",
        json={"email": "mateo@example.test", "password": "wrong-pass"},
    )

    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "invalid_credentials"


def test_users_me_returns_current_user_without_password_hash(api_client):
    api_app.app.dependency_overrides[get_current_user] = lambda: {
        "id": 1,
        "username": "mateo",
        "email": "mateo@example.test",
        "password_hash": "hidden",
        "created_at": "2026-08-16T12:00:00",
    }

    response = api_client.get("/users/me")

    assert response.status_code == 200
    assert response.json()["id"] == 1
    assert "password_hash" not in response.json()


def test_users_me_requires_bearer_token(api_client):
    response = api_client.get("/users/me")

    assert response.status_code == 401

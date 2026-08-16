from datetime import datetime
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

import app.api.app as api_app
from app.api.dependencies import (
    get_coin_controller,
    get_favorite_controller,
    get_price_history_controller,
)


@pytest.fixture
def client():
    with TestClient(api_app.app) as test_client:
        yield test_client

    api_app.app.dependency_overrides.clear()


def test_post_favorites_returns_201_and_normalizes_request_body(client):
    controller = Mock()
    controller.add_favorite.return_value = {
        "success": True,
        "message": "Favorito agregado correctamente.",
    }
    api_app.app.dependency_overrides[get_favorite_controller] = lambda: controller

    response = client.post(
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


def test_post_favorites_returns_422_before_calling_controller_for_invalid_body(client):
    controller = Mock()
    api_app.app.dependency_overrides[get_favorite_controller] = lambda: controller

    response = client.post(
        "/favorites",
        json={"user_id": 0, "coin_id": "bitcoin"},
    )

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["body", "user_id"]
    controller.add_favorite.assert_not_called()


def test_delete_favorites_returns_204_without_response_body(client):
    controller = Mock()
    controller.remove_favorite.return_value = {
        "success": True,
        "message": "Favorito eliminado correctamente.",
    }
    api_app.app.dependency_overrides[get_favorite_controller] = lambda: controller

    response = client.delete("/favorites/bitcoin?user_id=1")

    assert response.status_code == 204
    assert response.content == b""
    controller.remove_favorite.assert_called_once_with(1, "bitcoin")


def test_get_coins_returns_controller_contract(client):
    controller = Mock()
    controller.get_all_coins.return_value = {
        "success": True,
        "message": "Monedas obtenidas correctamente.",
        "data": [{"id": "bitcoin"}],
    }
    api_app.app.dependency_overrides[get_coin_controller] = lambda: controller

    response = client.get("/coins")

    assert response.status_code == 200
    assert response.json()["data"] == [{"id": "bitcoin"}]
    controller.get_all_coins.assert_called_once_with()


def test_get_price_history_serializes_response_and_passes_validated_filters(client):
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

    response = client.get(
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


def test_get_price_history_returns_422_for_invalid_query_before_controller(client):
    controller = Mock()
    api_app.app.dependency_overrides[get_price_history_controller] = lambda: controller

    response = client.get("/coins/bitcoin/price-history?limit=0")

    assert response.status_code == 422
    assert response.json()["detail"][0]["loc"] == ["query", "limit"]
    controller.get_price_history.assert_not_called()

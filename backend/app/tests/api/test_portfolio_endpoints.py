from unittest.mock import Mock

import pytest

import app.api.app as api_app
from app.api.dependencies import get_current_user, get_portfolio_controller


pytestmark = pytest.mark.api


def test_portfolio_requires_bearer_token(api_client):
    response = api_client.get("/portfolio")

    assert response.status_code == 401


def test_get_portfolio_returns_current_user_contract(api_client):
    controller = Mock()
    controller.get_portfolio.return_value = {
        "total_invested": 2000,
        "total_current_value": 2500,
        "total_profit_loss": 500,
        "total_profit_loss_percentage": 25,
        "holdings": [],
    }
    api_app.app.dependency_overrides[get_portfolio_controller] = lambda: controller
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 7}

    response = api_client.get("/portfolio")

    assert response.status_code == 200
    assert response.json()["total_current_value"] == 2500
    controller.get_portfolio.assert_called_once_with(7)


def test_post_portfolio_holding_normalizes_request(api_client):
    controller = Mock()
    controller.save_or_update_holding.return_value = {
        "total_invested": 20000,
        "total_current_value": None,
        "total_profit_loss": None,
        "total_profit_loss_percentage": None,
        "holdings": [],
    }
    api_app.app.dependency_overrides[get_portfolio_controller] = lambda: controller
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 7}

    response = api_client.post(
        "/portfolio/holdings",
        json={
            "coin_id": " BITCOIN ",
            "quantity": 0.5,
            "average_buy_price": 40000,
        },
    )

    assert response.status_code == 200
    request = controller.save_or_update_holding.call_args.args[1]
    assert request.coin_id == "bitcoin"
    assert request.quantity == 0.5
    controller.save_or_update_holding.assert_called_once()


def test_post_portfolio_holding_rejects_invalid_quantity(api_client):
    controller = Mock()
    api_app.app.dependency_overrides[get_portfolio_controller] = lambda: controller
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 7}

    response = api_client.post(
        "/portfolio/holdings",
        json={"coin_id": "bitcoin", "quantity": 0, "average_buy_price": 40000},
    )

    assert response.status_code == 422
    controller.save_or_update_holding.assert_not_called()


def test_delete_portfolio_holding_uses_authenticated_user(api_client):
    controller = Mock()
    controller.remove_holding.return_value = {
        "success": True,
        "message": "Posición eliminada de la cartera.",
    }
    api_app.app.dependency_overrides[get_portfolio_controller] = lambda: controller
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 7}

    response = api_client.delete("/portfolio/holdings/ BITCOIN ")

    assert response.status_code == 200
    controller.remove_holding.assert_called_once_with(7, "bitcoin")

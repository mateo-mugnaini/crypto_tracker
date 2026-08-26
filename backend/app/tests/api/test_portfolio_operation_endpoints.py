from unittest.mock import Mock

import pytest

import app.api.app as api_app
from app.api.dependencies import get_current_user, get_portfolio_controller


pytestmark = pytest.mark.api


def test_operations_require_bearer_token(api_client):
    response = api_client.get("/portfolio/operations")

    assert response.status_code == 401


def test_create_operation_uses_authenticated_user(api_client):
    controller = Mock()
    controller.create_operation.return_value = {
        "id": 9,
        "coin_id": "bitcoin",
        "symbol": "btc",
        "name": "Bitcoin",
        "operation_type": "buy",
        "quantity": 0.5,
        "price_usd": 40000,
        "fee_usd": 2,
        "executed_at": "2026-08-26T12:00:00",
        "note": "Compra",
    }
    api_app.app.dependency_overrides[get_portfolio_controller] = lambda: controller
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 7}

    response = api_client.post(
        "/portfolio/operations",
        json={
            "coin_id": " BITCOIN ",
            "operation_type": "buy",
            "quantity": 0.5,
            "price_usd": 40000,
            "fee_usd": 2,
            "executed_at": "2026-08-26T12:00:00",
            "note": "Compra",
        },
    )

    assert response.status_code == 201
    assert response.json()["id"] == 9
    request = controller.create_operation.call_args.args[1]
    assert request.coin_id == "bitcoin"
    controller.create_operation.assert_called_once()


def test_get_operation_summary_uses_authenticated_user(api_client):
    controller = Mock()
    controller.get_operations_summary.return_value = {
        "total_invested": 75,
        "total_current_value": 90,
        "realized_profit_loss": 12.5,
        "unrealized_profit_loss": 15,
        "total_profit_loss": 27.5,
    }
    api_app.app.dependency_overrides[get_portfolio_controller] = lambda: controller
    api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 7}

    response = api_client.get("/portfolio/operations/summary")

    assert response.status_code == 200
    assert response.json()["realized_profit_loss"] == 12.5
    controller.get_operations_summary.assert_called_once_with(7)

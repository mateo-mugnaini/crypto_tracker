from datetime import datetime
from unittest.mock import Mock

import pytest

from app.exceptions.domain_exception import (
    InsufficientPortfolioBalanceException,
    PortfolioOperationNotFoundException,
)
from app.schemas.portfolio import PortfolioOperationRequest
from app.services.portfolio_service import PortfolioService


pytestmark = pytest.mark.unit


def make_request(operation_type="buy", quantity=1):
    return PortfolioOperationRequest(
        coin_id="bitcoin",
        operation_type=operation_type,
        quantity=quantity,
        price_usd=40000,
        fee_usd=2,
        executed_at=datetime(2026, 8, 26, 12, 0),
        note="Compra de prueba",
    )


@pytest.fixture
def repositories():
    return Mock(), Mock(), Mock()


@pytest.fixture
def service(repositories):
    portfolio_repository, user_repository, coin_repository = repositories
    return PortfolioService(portfolio_repository, user_repository, coin_repository)


def test_create_operation_validates_and_persists_buy(service, repositories):
    portfolio_repository, user_repository, coin_repository = repositories
    user_repository.exists.return_value = True
    coin_repository.exists.return_value = True
    portfolio_repository.create_operation.return_value = 12
    portfolio_repository.find_operation.return_value = {
        "id": 12,
        "coin_id": "bitcoin",
        "operation_type": "buy",
    }

    result = service.create_operation(7, make_request())

    assert result["id"] == 12
    portfolio_repository.create_operation.assert_called_once()
    portfolio_repository.get_net_quantity.assert_not_called()


def test_create_operation_rejects_sale_above_available_balance(service, repositories):
    portfolio_repository, user_repository, coin_repository = repositories
    user_repository.exists.return_value = True
    coin_repository.exists.return_value = True
    portfolio_repository.get_net_quantity.return_value = 0.5

    with pytest.raises(InsufficientPortfolioBalanceException):
        service.create_operation(7, make_request(operation_type="sell", quantity=1))

    portfolio_repository.create_operation.assert_not_called()


def test_update_operation_rejects_unknown_operation(service, repositories):
    portfolio_repository, user_repository, coin_repository = repositories
    user_repository.exists.return_value = True
    portfolio_repository.find_operation.return_value = None

    with pytest.raises(PortfolioOperationNotFoundException):
        service.update_operation(7, 404, make_request())

    coin_repository.exists.assert_not_called()


def test_operations_summary_separates_realized_and_unrealized_result(service, repositories):
    portfolio_repository, user_repository, _ = repositories
    user_repository.exists.return_value = True
    portfolio_repository.find_operations_by_user.return_value = [
        {
            "coin_id": "bitcoin",
            "operation_type": "sell",
            "quantity": 0.25,
            "price_usd": 150,
            "fee_usd": 0,
            "current_price": 120,
        },
        {
            "coin_id": "bitcoin",
            "operation_type": "buy",
            "quantity": 1,
            "price_usd": 100,
            "fee_usd": 0,
            "current_price": 120,
        },
    ]

    result = service.get_operations_summary(7)

    assert result["total_invested"] == 75
    assert result["total_current_value"] == 90
    assert result["realized_profit_loss"] == 12.5
    assert result["unrealized_profit_loss"] == 15
    assert result["total_profit_loss"] == 27.5

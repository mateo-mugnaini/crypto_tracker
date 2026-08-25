from unittest.mock import Mock

import pytest

from app.exceptions.domain_exception import (
    CoinNotFoundException,
    PortfolioHoldingNotFoundException,
    UserNotFoundException,
)
from app.schemas.portfolio import PortfolioHoldingRequest
from app.services.portfolio_service import PortfolioService


pytestmark = pytest.mark.unit


@pytest.fixture
def repositories():
    return Mock(), Mock(), Mock()


@pytest.fixture
def service(repositories):
    portfolio_repository, user_repository, coin_repository = repositories
    return PortfolioService(portfolio_repository, user_repository, coin_repository)


def test_save_or_update_holding_validates_ownership_and_coin(service, repositories):
    portfolio_repository, user_repository, coin_repository = repositories
    user_repository.exists.return_value = True
    coin_repository.exists.return_value = True
    request = PortfolioHoldingRequest(
        coin_id=" BITCOIN ",
        quantity=0.5,
        average_buy_price=40000,
    )

    result = service.save_or_update_holding(7, request)

    assert result.user_id == 7
    assert result.coin_id == "bitcoin"
    portfolio_repository.save_or_update.assert_called_once_with(result)


def test_save_or_update_holding_rejects_unknown_user(service, repositories):
    _, user_repository, coin_repository = repositories
    user_repository.exists.return_value = False

    with pytest.raises(UserNotFoundException):
        service.save_or_update_holding(
            7,
            PortfolioHoldingRequest(
                coin_id="bitcoin",
                quantity=1,
                average_buy_price=100,
            ),
        )

    coin_repository.exists.assert_not_called()


def test_save_or_update_holding_rejects_unknown_coin(service, repositories):
    portfolio_repository, user_repository, coin_repository = repositories
    user_repository.exists.return_value = True
    coin_repository.exists.return_value = False

    with pytest.raises(CoinNotFoundException):
        service.save_or_update_holding(
            7,
            PortfolioHoldingRequest(
                coin_id="bitcoin",
                quantity=1,
                average_buy_price=100,
            ),
        )

    portfolio_repository.save_or_update.assert_not_called()


def test_get_portfolio_calculates_value_profit_and_allocation(service, repositories):
    portfolio_repository, user_repository, _ = repositories
    user_repository.exists.return_value = True
    portfolio_repository.find_all_by_user.return_value = [
        {
            "coin_id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "quantity": 0.5,
            "average_buy_price": 40000,
            "current_price": 50000,
        },
        {
            "coin_id": "ethereum",
            "symbol": "eth",
            "name": "Ethereum",
            "quantity": 2,
            "average_buy_price": 2000,
            "current_price": 2500,
        },
    ]

    result = service.get_portfolio(7)

    assert result["total_invested"] == 24000
    assert result["total_current_value"] == 30000
    assert result["total_profit_loss"] == 6000
    assert result["total_profit_loss_percentage"] == 25
    assert result["holdings"][0]["profit_loss"] == 5000
    assert result["holdings"][0]["allocation_percentage"] == pytest.approx(83.333333, rel=1e-5)
    assert result["holdings"][1]["allocation_percentage"] == pytest.approx(16.666666, rel=1e-5)


def test_remove_holding_requires_existing_position(service, repositories):
    portfolio_repository, user_repository, _ = repositories
    user_repository.exists.return_value = True
    portfolio_repository.exists.return_value = False

    with pytest.raises(PortfolioHoldingNotFoundException):
        service.remove_holding(7, "bitcoin")

    portfolio_repository.delete.assert_not_called()

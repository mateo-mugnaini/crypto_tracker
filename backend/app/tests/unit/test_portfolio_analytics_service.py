from datetime import datetime, timedelta
from unittest.mock import Mock

import pytest

from app.models.price_history import PriceHistory
from app.exceptions.domain_exception import CoinNotFoundException
from app.services.portfolio_analytics_service import PortfolioAnalyticsService


pytestmark = pytest.mark.unit


def test_analytics_builds_value_series_and_metrics():
    portfolio_repository = Mock()
    price_history_repository = Mock()
    user_repository = Mock()
    coin_repository = Mock()
    user_repository.exists.return_value = True
    operations = [
        {
            "id": 1,
            "coin_id": "bitcoin",
            "symbol": "btc",
            "name": "Bitcoin",
            "operation_type": "buy",
            "quantity": 1,
            "price_usd": 100,
            "fee_usd": 0,
            "executed_at": datetime.now() - timedelta(days=2),
        }
    ]
    portfolio_repository.find_operations_by_user.return_value = operations
    price_history_repository.find_by_coin_id.side_effect = [
        [
            PriceHistory(None, "bitcoin", 120, datetime.now() - timedelta(days=1)),
            PriceHistory(None, "bitcoin", 90, datetime.now()),
        ],
        [PriceHistory(None, "bitcoin", 90, datetime.now())],
    ]

    service = PortfolioAnalyticsService(
        portfolio_repository, price_history_repository, user_repository, coin_repository
    )
    result = service.get_analytics(7, days=7)

    assert [point["value"] for point in result["points"]] == [120.0, 90.0]
    assert result["total_return_percentage"] == pytest.approx(-25)
    assert result["max_drawdown_percentage"] == pytest.approx(25)
    assert result["assets"][0]["profit_loss"] == pytest.approx(-10)


def test_analytics_rejects_unknown_benchmark():
    user_repository = Mock()
    user_repository.exists.return_value = True
    coin_repository = Mock()
    coin_repository.exists.return_value = False
    service = PortfolioAnalyticsService(Mock(), Mock(), user_repository, coin_repository)

    with pytest.raises(CoinNotFoundException, match="benchmark"):
        service.get_analytics(7, benchmark_coin_id="solana")

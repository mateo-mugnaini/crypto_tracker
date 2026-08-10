from datetime import datetime

from app.models.price_history import PriceHistory
from app.schemas.favorite import FavoriteActionResponse
from app.schemas.price_history import (
    PriceHistoryAggregationResponse,
    PriceHistoryResponse,
    PriceHistoryStatisticsResponse,
    PriceHistoryVariationResponse,
)


def test_favorite_action_response_model_accepts_controller_result():
    response = FavoriteActionResponse.model_validate(
        {
            "success": True,
            "message": "Favorito agregado correctamente.",
        }
    )

    assert response.success is True
    assert response.message == "Favorito agregado correctamente."


def test_price_history_response_model_reads_internal_model_attributes():
    history = PriceHistory(
        id=1,
        coin_id="bitcoin",
        price=65000,
        recorded_at=datetime(2026, 8, 10, 12, 0),
    )

    response = PriceHistoryResponse.model_validate(history)

    assert response.id == 1
    assert response.coin_id == "bitcoin"
    assert response.price == 65000.0


def test_price_history_response_model_ignores_internal_extra_fields():
    response = PriceHistoryResponse.model_validate(
        {
            "id": 1,
            "coin_id": "bitcoin",
            "price": 65000,
            "recorded_at": datetime(2026, 8, 10, 12, 0),
            "internal_database_connection": "hidden",
        }
    )

    assert "internal_database_connection" not in response.model_dump()


def test_statistics_response_model_accepts_empty_statistics():
    response = PriceHistoryStatisticsResponse.model_validate(
        {
            "coin_id": "dogecoin",
            "count": 0,
            "min_price": None,
            "max_price": None,
            "average_price": None,
        }
    )

    assert response.count == 0
    assert response.average_price is None


def test_variation_response_model_validates_trend():
    response = PriceHistoryVariationResponse.model_validate(
        {
            "coin_id": "bitcoin",
            "initial_price": 100,
            "final_price": 125,
            "absolute_change": 25,
            "percentage_change": 25,
            "trend": "up",
        }
    )

    assert response.trend == "up"


def test_aggregation_response_model_accepts_period_result():
    response = PriceHistoryAggregationResponse.model_validate(
        {
            "period": "2026-08-10",
            "average_price": 105,
            "min_price": 100,
            "max_price": 110,
            "count": 2,
        }
    )

    assert response.period == "2026-08-10"
    assert response.count == 2


if __name__ == "__main__":
    test_favorite_action_response_model_accepts_controller_result()
    test_price_history_response_model_reads_internal_model_attributes()
    test_price_history_response_model_ignores_internal_extra_fields()
    test_statistics_response_model_accepts_empty_statistics()
    test_variation_response_model_validates_trend()
    test_aggregation_response_model_accepts_period_result()
    print("All response model tests passed.")

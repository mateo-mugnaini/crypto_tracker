from datetime import date

from fastapi import Depends, Query, Request
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError

from app.container import Container
from app.controllers.coin_controller import CoinController
from app.controllers.favorite_controller import FavoriteController
from app.controllers.price_history_controller import PriceHistoryController
from app.controllers.user_controller import UserController
from app.schemas.price_history import (
    PriceHistoryAggregationQueryParams,
    PriceHistoryDateRangeQueryParams,
    PriceHistoryQueryParams,
)


def get_container(request: Request) -> Container:
    """Obtiene el container creado durante el ciclo de vida de la API."""
    return request.app.state.container


def get_coin_controller(
    container: Container = Depends(get_container),
) -> CoinController:
    return container.coin_controller


def get_favorite_controller(
    container: Container = Depends(get_container),
) -> FavoriteController:
    return container.favorite_controller


def get_price_history_controller(
    container: Container = Depends(get_container),
) -> PriceHistoryController:
    return container.price_history_controller


def get_user_controller(
    container: Container = Depends(get_container),
) -> UserController:
    return container.user_controller


def _validated_query_model(model_class, values):
    try:
        return model_class(**values)
    except ValidationError as error:
        errors = []

        for item in error.errors():
            errors.append(
                {
                    **item,
                    "loc": ("query", *item["loc"]),
                }
            )

        raise RequestValidationError(errors) from error


def get_price_history_query_params(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
    min_price: float | None = Query(default=None),
    max_price: float | None = Query(default=None),
    limit: int = Query(default=20),
    offset: int = Query(default=0),
    sort_by: str = Query(default="recorded_at"),
    sort_order: str = Query(default="asc"),
) -> PriceHistoryQueryParams:
    return _validated_query_model(
        PriceHistoryQueryParams,
        {
            "start_date": start_date,
            "end_date": end_date,
            "min_price": min_price,
            "max_price": max_price,
            "limit": limit,
            "offset": offset,
            "sort_by": sort_by,
            "sort_order": sort_order,
        },
    )


def get_price_history_date_range_query_params(
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
) -> PriceHistoryDateRangeQueryParams:
    return _validated_query_model(
        PriceHistoryDateRangeQueryParams,
        {"start_date": start_date, "end_date": end_date},
    )


def get_price_history_aggregation_query_params(
    period: str = Query(default="day"),
    start_date: date | None = Query(default=None),
    end_date: date | None = Query(default=None),
) -> PriceHistoryAggregationQueryParams:
    return _validated_query_model(
        PriceHistoryAggregationQueryParams,
        {
            "period": period,
            "start_date": start_date,
            "end_date": end_date,
        },
    )

from fastapi import Body, Depends, FastAPI, Path, Response, status

from app.container import Container
from app.models.favorite import Favorite
from app.schemas.favorite import FavoriteActionResponse, FavoriteCreateRequest
from app.schemas.price_history import (
    PriceHistoryAggregationQueryParams,
    PriceHistoryAggregationResponse,
    PriceHistoryDateRangeQueryParams,
    PriceHistoryQueryParams,
    PriceHistoryResponse,
    PriceHistoryStatisticsResponse,
    PriceHistoryVariationResponse,
)

app = FastAPI(
    title="Crypto Tracker API",
    description="API para gestionar criptomonedas, favoritos y ver el historial de precios",
    version="1.0.0",
)


container = Container()


def _get_create_favorite_status_code(result: dict) -> int:

    message = str(result.get("message", "")).lower()

    if result.get("success"):
        return status.HTTP_201_CREATED

    if "usuario no existe" in message or "moneda no existe" in message:
        return status.HTTP_404_NOT_FOUND

    return status.HTTP_409_CONFLICT


def _get_delete_favorite_status_code(result: dict) -> int:

    message = str(result.get("message", "")).lower()

    if result.get("success"):
        return status.HTTP_204_NO_CONTENT

    if "favoritos" in message:
        return status.HTTP_404_NOT_FOUND

    return status.HTTP_404_NOT_FOUND


# ============================================================
# ROOT
# ============================================================


@app.get("/")
def root():

    # return {"success": True, "message": "Crypto Tracker API funcionando."}
    return {"success": True, "message": "Hola mundoâ™¥"}


# ============================================================
# COINS
# ============================================================


@app.get("/coins", status_code=status.HTTP_200_OK)
def get_all_coins():

    return container.coin_controller.get_all_coins()


@app.post("/coins/sync")
def sync_coins():

    return container.coin_controller.sync_coins()


@app.get("/coins/{coin_id}", status_code=status.HTTP_200_OK)
def get_coin(
    coin_id: str = Path(..., min_length=1, description="ID de la criptomoneda")
):

    return container.coin_controller.get_coin(coin_id)


@app.post("/coins/{coin_id}")
def update_coin(
    coin_id: str = Path(
        ..., min_length=1, description="ID de la criptomoneda en CoinGecko"
    )
):

    return container.coin_controller.update_coin(coin_id)


# ============================================================
# FAVORITES
# ============================================================


@app.post(
    "/favorites",
    response_model=FavoriteActionResponse,
    status_code=status.HTTP_201_CREATED,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "El usuario o la moneda no existe.",
        },
        status.HTTP_409_CONFLICT: {
            "description": "El favorito ya existe.",
        },
    },
)
def add_favorite(
    response: Response,
    request: FavoriteCreateRequest = Body(...),
):

    favorite = Favorite(request.user_id, request.coin_id)

    result = container.favorite_controller.add_favorite(favorite)
    response.status_code = _get_create_favorite_status_code(result)

    return result


@app.delete(
    "/favorites/{coin_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "El favorito no existe.",
        },
    },
)
def remove_favorite(user_id: int, coin_id: str, response: Response):

    result = container.favorite_controller.remove_favorite(user_id, coin_id)
    response.status_code = _get_delete_favorite_status_code(result)

    if result.get("success"):
        return None

    return result


@app.get("/favorites", status_code=status.HTTP_200_OK)
def get_favorites(user_id: int):

    return container.favorite_controller.get_favorites(user_id)


@app.get("/favorites/details", status_code=status.HTTP_200_OK)
def get_favorites_with_coin_data(user_id: int):

    return container.favorite_controller.get_favorites_with_coin_data(user_id)


# ============================================================
# PRICE HISTORY
# ============================================================


@app.post("/coins/{coin_id}/price")
def update_coin_price(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda en CoinGecko",
    )
):
    return container.price_history_controller.update_price(coin_id)


@app.get(
    "/coins/{coin_id}/price-history",
    status_code=status.HTTP_200_OK,
    response_model=list[PriceHistoryResponse],
)
def get_price_history(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
    ),
    filters: PriceHistoryQueryParams = Depends(),
):
    return container.price_history_controller.get_price_history(
        coin_id=coin_id,
        start_date=filters.start_date,
        end_date=filters.end_date,
        min_price=filters.min_price,
        max_price=filters.max_price,
        limit=filters.limit,
        offset=filters.offset,
        sort_by=filters.sort_by,
        sort_order=filters.sort_order,
    )


@app.get(
    "/coins/{coin_id}/price-history/statistics",
    status_code=status.HTTP_200_OK,
    response_model=PriceHistoryStatisticsResponse,
)
def get_price_statistics(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
    )
):
    return container.price_history_controller.get_price_statistics(coin_id)


@app.get(
    "/coins/{coin_id}/price-history/variation",
    status_code=status.HTTP_200_OK,
    response_model=PriceHistoryVariationResponse,
)
def get_price_variation(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
    ),
    filters: PriceHistoryDateRangeQueryParams = Depends(),
):
    return container.price_history_controller.get_price_variation(
        coin_id=coin_id,
        start_date=filters.start_date,
        end_date=filters.end_date,
    )


@app.get(
    "/coins/{coin_id}/price-history/aggregations",
    status_code=status.HTTP_200_OK,
    response_model=list[PriceHistoryAggregationResponse],
)
def get_price_aggregations(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
    ),
    filters: PriceHistoryAggregationQueryParams = Depends(),
):
    return container.price_history_controller.get_price_aggregations(
        coin_id=coin_id,
        period=filters.period,
        start_date=filters.start_date,
        end_date=filters.end_date,
    )

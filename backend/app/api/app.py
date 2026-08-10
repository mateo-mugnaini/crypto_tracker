from typing import Literal

from fastapi import FastAPI, Path, Query
from datetime import date

from app.container import Container
from app.models.favorite import Favorite

app = FastAPI(
    title="Crypto Tracker API",
    description="API para gestionar criptomonedas, favoritos y ver el historial de precios",
    version="1.0.0",
)


container = Container()


# ============================================================
# ROOT
# ============================================================


@app.get("/")
def root():

    # return {"success": True, "message": "Crypto Tracker API funcionando."}
    return {"success": True, "message": "Hola mundo♥"}


# ============================================================
# COINS
# ============================================================


@app.get("/coins")
def get_all_coins():

    return container.coin_controller.get_all_coins()


@app.post("/coins/sync")
def sync_coins():

    return container.coin_controller.sync_coins()


@app.get("/coins/{coin_id}")
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


@app.post("/favorites")
def add_favorite(user_id: int, coin_id: str):

    favorite = Favorite(user_id, coin_id)

    return container.favorite_controller.add_favorite(favorite)


@app.delete("/favorites/{coin_id}")
def remove_favorite(user_id: int, coin_id: str):

    return container.favorite_controller.remove_favorite(user_id, coin_id)


@app.get("/favorites")
def get_favorites(user_id: int):

    return container.favorite_controller.get_favorites(user_id)


@app.get("/favorites/details")
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


@app.get("/coins/{coin_id}/price-history")
def get_price_history(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
        ), 
    start_date: date | None = None,
    end_date: date | None = None,
    min_price: float | None = Query(default=None, ge=0),
    max_price: float | None = Query(default=None, ge=0),
    limit: int = Query(
        default=20,
        ge=1,
        le=100,
        description="Cantidad máxima de registros",
    ),
    offset: int = Query(
        default=0,
        ge=0,
        description="Cantidad de registros a omitir",
    ),
    sort_by: Literal["recorded_at", "price"] = Query(
        default="recorded_at",
        description="Campo de ordenamiento permitido",
    ),
    sort_order: Literal["asc", "desc"] = Query(
        default="asc",
        description="Dirección de ordenamiento permitida",
    ),
):
    return container.price_history_controller.get_price_history(
        coin_id=coin_id,
        start_date=start_date,
        end_date=end_date,
        min_price=min_price,
        max_price=max_price,
        limit=limit,
        offset=offset,
        sort_by=sort_by,
        sort_order=sort_order,
    )


@app.get("/coins/{coin_id}/price-history/statistics")
def get_price_statistics(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
    )
):
    return container.price_history_controller.get_price_statistics(coin_id)

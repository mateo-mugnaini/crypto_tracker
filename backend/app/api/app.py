from fastapi import FastAPI
from app.models.favorite import Favorite

from app.container import Container

app = FastAPI(
    title="Crypto Tracker API",
    description="API para gestionar criptomonedas, favoritos y ver el historial de precios",
    version="1.0.0",
)

container = Container()


@app.get("/")
def root():

    return {"success": True, "message": "Crypto Tracker API funcionando."}


# COINS
@app.get("/coins")
def get_all_coins():

    return container.coin_controller.get_all_coins()


@app.get("/coins/{coin_id}")
def get_coin(coin_id: str):

    return container.coin_controller.get_coin(coin_id)


@app.post("/coins/{coin_id}")
def update_coin(coin_id: str):

    return container.coin_controller.update_coin(coin_id)


@app.post("/coins/sync")
def sync_coins():

    return container.coin_controller.sync_coins()


# FAVORITE


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

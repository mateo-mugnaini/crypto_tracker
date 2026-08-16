from fastapi import Depends, Request

from app.container import Container
from app.controllers.coin_controller import CoinController
from app.controllers.favorite_controller import FavoriteController
from app.controllers.price_history_controller import PriceHistoryController


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

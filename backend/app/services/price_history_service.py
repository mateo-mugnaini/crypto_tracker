from datetime import datetime

from app.exceptions.api_exception import CoinGeckoException
from app.models.price_history import PriceHistory


class PriceHistoryService:

    def __init__(self, repository, api_client):
        self.repository = repository
        self.api_client = api_client

    def update_price(self, coin_id: str) -> PriceHistory:

        data = self.api_client.get_coin(coin_id)

        if not data:
            raise CoinGeckoException(f"No se pudo obtener la moneda '{coin_id}'.")

        try:
            price = data["market_data"]["current_price"]["usd"]
        except KeyError:
            raise CoinGeckoException(f"No se encontró el precio USD para '{coin_id}'.")

        history = PriceHistory(
            id=None,
            coin_id=coin_id,
            price=price,
            recorded_at=datetime.now(),
        )

        self.repository.save(history)

        return history

    def get_history(self, coin_id: str):
        return self.repository.find_by_coin(coin_id)

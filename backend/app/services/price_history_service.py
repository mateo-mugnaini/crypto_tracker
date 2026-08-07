from datetime import datetime

from app.models.price_history import PriceHistory


class PriceHistoryService:

    def __init__(self, repository, api_client):
        self.repository = repository
        self.api_client = api_client

    def update_price(self, coin_id: str) -> PriceHistory:

        data = self.api_client.get_coin(coin_id)

        if not data:
            raise Exception(f"No se pudo obtener la moneda '{coin_id}'.")

        price = data["market_data"]["current_price"]["usd"]

        history = PriceHistory(
            id=None, coin_id=coin_id, price=price, recorded_at=datetime.now()
        )

        self.repository.save(history)

        return history

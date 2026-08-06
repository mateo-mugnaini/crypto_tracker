from app.exceptions.api_exception import CoinGeckoException
from app.models.coin import Coin
from app.services.coin_mapper import CoinMapper


class CoinService:

    def __init__(self, repository, api_client):
        self.repository = repository
        self.api_client = api_client

    def update_coin(self, coin_id: str) -> Coin:

        data = self.api_client.get_coin(coin_id)

        if not data:
            raise CoinGeckoException(f"No se pudo obtener la moneda '{coin_id}'.")

        coin = CoinMapper.to_coin(data)

        self.repository.save(coin)

        return coin

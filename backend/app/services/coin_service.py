from app.models.coin import Coin


class CoinService:

    def __init__(self, repository, api_client):
        self.repository = repository
        self.api_client = api_client

    def update_coin(self, coin_id):

        data = self.api_client.get_coin(coin_id)

        coin = Coin(
            id=data["id"],
            symbol=data["symbol"],
            name=data["name"],
            market_cap_rank=data["market_cap_rank"],
        )

        self.repository.save(coin)

        return coin

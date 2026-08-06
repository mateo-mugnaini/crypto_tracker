import unittest

from app.exceptions.api_exception import CoinGeckoException
from app.services.coin_service import CoinService


class FakeRepository:
    def __init__(self):
        self.saved = []

    def save(self, coin):
        self.saved.append(coin)


class FakeApiClient:
    def __init__(self, payload):
        self.payload = payload
        self.requested_ids = []

    def get_coin(self, coin_id):
        self.requested_ids.append(coin_id)
        return self.payload


class CoinServiceTest(unittest.TestCase):
    def test_update_coin_maps_and_saves_coin(self):
        repository = FakeRepository()
        api_client = FakeApiClient(
            {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "market_cap_rank": 1,
            }
        )

        service = CoinService(repository, api_client)
        coin = service.update_coin("bitcoin")

        self.assertEqual(api_client.requested_ids, ["bitcoin"])
        self.assertEqual(len(repository.saved), 1)
        self.assertEqual(repository.saved[0], coin)
        self.assertEqual(coin.id, "bitcoin")
        self.assertEqual(coin.symbol, "btc")
        self.assertEqual(coin.name, "Bitcoin")
        self.assertEqual(coin.market_cap_rank, 1)

    def test_update_coin_raises_when_api_returns_empty_payload(self):
        repository = FakeRepository()
        api_client = FakeApiClient({})

        service = CoinService(repository, api_client)

        with self.assertRaises(CoinGeckoException):
            service.update_coin("bitcoin")


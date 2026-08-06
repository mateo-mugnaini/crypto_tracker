import unittest
from unittest.mock import patch

from app.api.coingecko_client import CoinGeckoClient


class FakeResponse:
    def __init__(self, payload):
        self.payload = payload

    def raise_for_status(self):
        return None

    def json(self):
        return self.payload


class CoinGeckoClientTest(unittest.TestCase):
    @patch("app.api.coingecko_client.requests.get")
    def test_get_coin_returns_coin_data(self, mock_get):
        mock_get.return_value = FakeResponse(
            {
                "id": "bitcoin",
                "symbol": "btc",
                "name": "Bitcoin",
                "market_cap_rank": 1,
            }
        )

        client = CoinGeckoClient(base_url="https://example.test", timeout=3)

        data = client.get_coin("bitcoin")

        self.assertEqual(data["id"], "bitcoin")
        self.assertEqual(data["symbol"], "btc")
        mock_get.assert_called_once_with(
            "https://example.test/coins/bitcoin",
            params=None,
            timeout=3,
        )

    @patch("app.api.coingecko_client.requests.get")
    def test_get_market_coins_returns_list(self, mock_get):
        mock_get.return_value = FakeResponse(
            [
                {
                    "id": "bitcoin",
                    "symbol": "btc",
                    "name": "Bitcoin",
                    "market_cap_rank": 1,
                }
            ]
        )

        client = CoinGeckoClient(base_url="https://example.test", timeout=5)

        data = client.get_market_coins(per_page=1)

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["id"], "bitcoin")
        mock_get.assert_called_once_with(
            "https://example.test/coins/markets",
            params={
                "vs_currency": "usd",
                "order": "market_cap_desc",
                "per_page": 1,
                "page": 1,
            },
            timeout=5,
        )


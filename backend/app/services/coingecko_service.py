# import requests


# class CoinGeckoService:
#     BASE_URL = "https://api.coingecko.com/api/v3"

#     def ping(self):
#         url = f"{self.BASE_URL}/ping"

#         response = requests.get(url)

#         return response.json()

# * MODULO 10
import requests


class CoinGeckoService:

    BASE_URL = "https://api.coingecko.com/api/v3"

    def get_market_coins(self):

        url = f"{self.BASE_URL}/coins/markets"

        params = {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": 10,
            "page": 1,
        }

        response = requests.get(url, params=params)

        return response.json()

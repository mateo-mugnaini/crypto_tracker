import requests


class CoinGeckoService:
    BASE_URL = "https://api.coingecko.com/api/v3"

    def ping(self):
        url = f"{self.BASE_URL}/ping"

        response = requests.get(url)

        return response.json()

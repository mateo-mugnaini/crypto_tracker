# import requests


# class CoinGeckoService:
#     BASE_URL = "https://api.coingecko.com/api/v3"

#     def ping(self):
#         url = f"{self.BASE_URL}/ping"

#         response = requests.get(url)

#         return response.json()

# # * MODULO 10
# import requests
# from config.settings import Settings


# class CoinGeckoService:

#     BASE_URL = "https://api.coingecko.com/api/v3"


#     def get_market_coins(self):

#         url = f"{self.BASE_URL}/coins/markets"

#         params = {
#             "vs_currency": "usd",
#             "order": "market_cap_desc",
#             "per_page": 10,
#             "page": 1,
#         }
#         response = requests.get(url, params=params)

#         return response.json()

# * MODULO 11

import requests

from config.settings import Settings


class CoinGeckoService:

    BASE_URL = Settings.COINGECKO_BASE_URL

    def get_market_coins(self):

        url = f"{self.BASE_URL}/coins/markets"

        params = {
            "vs_currency": "usd",
            "order": "market_cap_desc",
            "per_page": 10,
            "page": 1,
        }

        try:

            response = requests.get(
                url,
                params=params,
                timeout=Settings.REQUEST_TIMEOUT,
            )

            response.raise_for_status()

            return response.json()

        except requests.exceptions.Timeout:
            print("La petición excedió el tiempo máximo.")

        except requests.exceptions.ConnectionError:
            print("No fue posible conectarse a CoinGecko.")

        except requests.exceptions.HTTPError as error:
            print(f"Error HTTP: {error}")

        except requests.exceptions.RequestException as error:
            print(f"Error inesperado: {error}")

        return []

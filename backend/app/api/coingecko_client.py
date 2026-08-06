from __future__ import annotations

from typing import Any

import requests

from app.config.settings import settings
from app.exceptions.api_exception import CoinGeckoException


class CoinGeckoClient:
    def __init__(self, base_url: str | None = None, timeout: int | None = None):
        self.base_url = base_url or settings.coingecko_base_url
        self.timeout = timeout or settings.request_timeout

    def get_market_coins(
        self,
        vs_currency: str = "usd",
        per_page: int = 10,
        page: int = 1,
        order: str = "market_cap_desc",
    ) -> list[dict[str, Any]]:
        data = self._request_json(
            "/coins/markets",
            params={
                "vs_currency": vs_currency,
                "order": order,
                "per_page": per_page,
                "page": page,
            },
        )

        return data if isinstance(data, list) else []

    def get_coin(self, coin_id: str) -> dict[str, Any]:
        data = self._request_json(f"/coins/{coin_id}")

        return data if isinstance(data, dict) else {}

    def _request_json(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> Any:
        if not self.base_url:
            raise CoinGeckoException("COINGECKO_BASE_URL no está configurada.")

        url = f"{self.base_url}{path}"

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()

        except requests.exceptions.Timeout:
            print("La petición excedió el tiempo máximo.")

        except requests.exceptions.ConnectionError:
            print("No fue posible conectarse con CoinGecko.")

        except requests.exceptions.HTTPError as error:
            print(f"Error HTTP: {error}")

        except requests.exceptions.RequestException as error:
            print(f"Error inesperado: {error}")

        return None

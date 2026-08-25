from __future__ import annotations

import logging
from typing import Any

import requests

from app.config.settings import settings
from app.exceptions.api_exception import CoinGeckoException


logger = logging.getLogger("crypto_tracker.coingecko")


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

    def get_current_price(
        self,
        coin_id: str,
        vs_currency: str = "usd",
    ) -> float | None:
        data = self._request_json(
            "/simple/price",
            params={
                "ids": coin_id,
                "vs_currencies": vs_currency,
            },
        )

        if not isinstance(data, dict):
            return None

        coin_data = data.get(coin_id)
        if not isinstance(coin_data, dict):
            return None

        value = coin_data.get(vs_currency)
        if value is None:
            return None

        try:
            return float(value)
        except (TypeError, ValueError):
            return None

    def _request_json(
        self,
        path: str,
        params: dict[str, Any] | None = None,
    ) -> Any:
        if not self.base_url:
            logger.error(
                "CoinGecko base URL is not configured.",
                extra={"event": "coingecko_base_url_missing"},
            )
            raise CoinGeckoException("COINGECKO_BASE_URL no está configurada.")

        url = f"{self.base_url}{path}"

        try:
            response = requests.get(url, params=params, timeout=self.timeout)
            response.raise_for_status()
            return response.json()

        except requests.exceptions.Timeout:
            logger.warning(
                "CoinGecko request timed out.",
                extra={
                    "event": "coingecko_timeout",
                    "path": path,
                    "error_type": "Timeout",
                },
            )

        except requests.exceptions.ConnectionError:
            logger.warning(
                "CoinGecko connection failed.",
                extra={
                    "event": "coingecko_connection_error",
                    "path": path,
                    "error_type": "ConnectionError",
                },
            )

        except requests.exceptions.HTTPError as error:
            status_code = error.response.status_code if error.response else None
            logger.warning(
                "CoinGecko returned an HTTP error.",
                extra={
                    "event": "coingecko_http_error",
                    "path": path,
                    "status_code": status_code,
                    "error_type": "HTTPError",
                },
            )

        except requests.exceptions.RequestException:
            logger.warning(
                "CoinGecko request failed.",
                extra={
                    "event": "coingecko_request_error",
                    "path": path,
                    "error_type": "RequestException",
                },
            )

        return None

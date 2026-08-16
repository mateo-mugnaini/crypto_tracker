import unittest
from unittest.mock import Mock

from fastapi.routing import APIRoute
from fastapi.testclient import TestClient

import app.api.app as api_app
from app.api.dependencies import get_coin_controller, get_current_user, get_favorite_controller
from app.exceptions.api_exception import CoinGeckoException
from app.exceptions.domain_exception import (
    FavoriteAlreadyExistsException,
    FavoriteNotFoundException,
    UserNotFoundException,
)


def _find_route(path: str, method: str) -> APIRoute:
    for route in api_app.app.routes:
        if isinstance(route, APIRoute) and route.path == path and method in route.methods:
            return route

    raise AssertionError(f"Route not found: {method} {path}")


class HTTPStatusCodesTest(unittest.TestCase):
    def setUp(self):
        self.client = TestClient(api_app.app)
        api_app.app.dependency_overrides[get_current_user] = lambda: {"id": 1}

    def tearDown(self):
        api_app.app.dependency_overrides.clear()

    def test_routes_declare_expected_success_status_codes(self):
        self.assertEqual(_find_route("/favorites", "POST").status_code, 201)
        self.assertEqual(_find_route("/favorites/{coin_id}", "DELETE").status_code, 204)

    def test_user_not_found_is_a_consistent_404_response(self):
        controller = Mock()
        controller.add_favorite.side_effect = UserNotFoundException("El usuario no existe.")
        api_app.app.dependency_overrides[get_favorite_controller] = lambda: controller

        response = self.client.post(
            "/favorites",
            json={"user_id": 1, "coin_id": "bitcoin"},
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"]["code"], "user_not_found")

    def test_duplicate_favorite_is_a_consistent_409_response(self):
        controller = Mock()
        controller.add_favorite.side_effect = FavoriteAlreadyExistsException(
            "La moneda ya está en favoritos."
        )
        api_app.app.dependency_overrides[get_favorite_controller] = lambda: controller

        response = self.client.post(
            "/favorites",
            json={"user_id": 1, "coin_id": "bitcoin"},
        )

        self.assertEqual(response.status_code, 409)
        self.assertEqual(response.json()["detail"]["code"], "favorite_already_exists")

    def test_missing_favorite_is_a_consistent_404_response(self):
        controller = Mock()
        controller.remove_favorite.side_effect = FavoriteNotFoundException(
            "La moneda no se encuentra en favoritos."
        )
        api_app.app.dependency_overrides[get_favorite_controller] = lambda: controller

        response = self.client.delete("/favorites/bitcoin?user_id=1")

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json()["detail"]["code"], "favorite_not_found")

    def test_coingecko_failure_is_a_consistent_502_response(self):
        controller = Mock()
        controller.update_coin.side_effect = CoinGeckoException("CoinGecko no responde.")
        api_app.app.dependency_overrides[get_coin_controller] = lambda: controller

        response = self.client.post("/coins/bitcoin")

        self.assertEqual(response.status_code, 502)
        self.assertEqual(response.json()["detail"]["code"], "coingecko_unavailable")


if __name__ == "__main__":
    unittest.main()

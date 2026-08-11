import unittest
from unittest.mock import Mock

from fastapi import Response
from fastapi.routing import APIRoute

import app.api.app as api_app
from app.schemas.favorite import FavoriteCreateRequest


def _find_route(path: str, method: str) -> APIRoute:
    for route in api_app.app.routes:
        if isinstance(route, APIRoute) and route.path == path and method in route.methods:
            return route

    raise AssertionError(f"Route not found: {method} {path}")


def _replace_favorite_controller(mock_controller):
    previous = api_app.container.favorite_controller
    api_app.container.favorite_controller = mock_controller
    return previous


class HTTPStatusCodesTest(unittest.TestCase):
    def test_routes_declare_expected_status_codes(self):
        self.assertEqual(_find_route("/favorites", "POST").status_code, 201)
        self.assertEqual(_find_route("/favorites/{coin_id}", "DELETE").status_code, 204)
        self.assertEqual(_find_route("/favorites", "GET").status_code, 200)
        self.assertEqual(_find_route("/favorites/details", "GET").status_code, 200)
        self.assertEqual(
            _find_route("/coins/{coin_id}/price-history", "GET").status_code,
            200,
        )

    def test_add_favorite_sets_created_on_success(self):
        controller = Mock()
        controller.add_favorite.return_value = {
            "success": True,
            "message": "Favorito agregado correctamente.",
        }

        previous = _replace_favorite_controller(controller)
        response = Response()

        try:
            result = api_app.add_favorite(
                response=response,
                request=FavoriteCreateRequest(user_id=1, coin_id="bitcoin"),
            )
        finally:
            api_app.container.favorite_controller = previous

        self.assertTrue(result["success"])
        self.assertEqual(response.status_code, 201)

    def test_add_favorite_sets_not_found_for_missing_entities(self):
        controller = Mock()
        controller.add_favorite.return_value = {
            "success": False,
            "message": "El usuario no existe.",
        }

        previous = _replace_favorite_controller(controller)
        response = Response()

        try:
            result = api_app.add_favorite(
                response=response,
                request=FavoriteCreateRequest(user_id=1, coin_id="bitcoin"),
            )
        finally:
            api_app.container.favorite_controller = previous

        self.assertFalse(result["success"])
        self.assertEqual(response.status_code, 404)

    def test_add_favorite_sets_conflict_for_duplicates(self):
        controller = Mock()
        controller.add_favorite.return_value = {
            "success": False,
            "message": "La moneda ya esta en favoritos.",
        }

        previous = _replace_favorite_controller(controller)
        response = Response()

        try:
            result = api_app.add_favorite(
                response=response,
                request=FavoriteCreateRequest(user_id=1, coin_id="bitcoin"),
            )
        finally:
            api_app.container.favorite_controller = previous

        self.assertFalse(result["success"])
        self.assertEqual(response.status_code, 409)

    def test_remove_favorite_sets_no_content_on_success(self):
        controller = Mock()
        controller.remove_favorite.return_value = {
            "success": True,
            "message": "Favorito eliminado correctamente.",
        }

        previous = _replace_favorite_controller(controller)
        response = Response()

        try:
            result = api_app.remove_favorite(
                user_id=1,
                coin_id="bitcoin",
                response=response,
            )
        finally:
            api_app.container.favorite_controller = previous

        self.assertIsNone(result)
        self.assertEqual(response.status_code, 204)

    def test_remove_favorite_sets_not_found_when_missing(self):
        controller = Mock()
        controller.remove_favorite.return_value = {
            "success": False,
            "message": "La moneda no esta en favoritos.",
        }

        previous = _replace_favorite_controller(controller)
        response = Response()

        try:
            result = api_app.remove_favorite(
                user_id=1,
                coin_id="bitcoin",
                response=response,
            )
        finally:
            api_app.container.favorite_controller = previous

        self.assertFalse(result["success"])
        self.assertEqual(response.status_code, 404)


if __name__ == "__main__":
    unittest.main()

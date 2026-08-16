import unittest
from unittest.mock import Mock

from app.exceptions.api_exception import AppException
from app.exceptions.domain_exception import (
    FavoriteAlreadyExistsException,
    FavoriteNotFoundException,
    UserNotFoundException,
)
from app.models.favorite import Favorite
from app.services.favorite_service import FavoriteService


class DomainExceptionTest(unittest.TestCase):
    def setUp(self):
        self.favorite_repository = Mock()
        self.user_repository = Mock()
        self.coin_repository = Mock()
        self.service = FavoriteService(
            self.favorite_repository,
            self.user_repository,
            self.coin_repository,
        )

    def test_domain_exceptions_belong_to_the_application_hierarchy(self):
        self.assertTrue(issubclass(UserNotFoundException, AppException))

    def test_add_favorite_raises_when_user_does_not_exist(self):
        self.user_repository.exists.return_value = False

        with self.assertRaises(UserNotFoundException):
            self.service.add_favorite(Favorite(1, "bitcoin"))

    def test_add_favorite_raises_when_favorite_already_exists(self):
        self.user_repository.exists.return_value = True
        self.coin_repository.exists.return_value = True
        self.favorite_repository.exists.return_value = True

        with self.assertRaises(FavoriteAlreadyExistsException):
            self.service.add_favorite(Favorite(1, "bitcoin"))

    def test_remove_favorite_raises_when_favorite_does_not_exist(self):
        self.favorite_repository.exists.return_value = False

        with self.assertRaises(FavoriteNotFoundException):
            self.service.remove_favorite(1, "bitcoin")

    def test_get_favorites_raises_when_user_does_not_exist(self):
        self.user_repository.exists.return_value = False

        with self.assertRaises(UserNotFoundException):
            self.service.get_favorites(1)


if __name__ == "__main__":
    unittest.main()

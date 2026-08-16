from unittest.mock import Mock

import pytest

from app.exceptions.api_exception import AppException
from app.exceptions.domain_exception import (
    FavoriteAlreadyExistsException,
    FavoriteNotFoundException,
    UserNotFoundException,
)
from app.models.favorite import Favorite
from app.services.favorite_service import FavoriteService


@pytest.fixture
def repositories():
    return Mock(), Mock(), Mock()


@pytest.fixture
def favorite_service(repositories):
    favorite_repository, user_repository, coin_repository = repositories
    return FavoriteService(favorite_repository, user_repository, coin_repository)


def test_domain_exceptions_belong_to_the_application_hierarchy():
    assert issubclass(UserNotFoundException, AppException)


def test_add_favorite_raises_when_user_does_not_exist(favorite_service, repositories):
    _, user_repository, _ = repositories
    user_repository.exists.return_value = False

    with pytest.raises(UserNotFoundException):
        favorite_service.add_favorite(Favorite(1, "bitcoin"))


def test_add_favorite_raises_when_favorite_already_exists(
    favorite_service,
    repositories,
):
    favorite_repository, user_repository, coin_repository = repositories
    user_repository.exists.return_value = True
    coin_repository.exists.return_value = True
    favorite_repository.exists.return_value = True

    with pytest.raises(FavoriteAlreadyExistsException):
        favorite_service.add_favorite(Favorite(1, "bitcoin"))


def test_remove_favorite_raises_when_favorite_does_not_exist(
    favorite_service,
    repositories,
):
    favorite_repository, _, _ = repositories
    favorite_repository.exists.return_value = False

    with pytest.raises(FavoriteNotFoundException):
        favorite_service.remove_favorite(1, "bitcoin")


def test_get_favorites_raises_when_user_does_not_exist(
    favorite_service,
    repositories,
):
    _, user_repository, _ = repositories
    user_repository.exists.return_value = False

    with pytest.raises(UserNotFoundException):
        favorite_service.get_favorites(1)

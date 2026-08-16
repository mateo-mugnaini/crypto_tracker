from unittest.mock import Mock

import pytest

from app.exceptions.domain_exception import (
    CoinNotFoundException,
    FavoriteAlreadyExistsException,
    FavoriteNotFoundException,
    UserNotFoundException,
)
from app.models.favorite import Favorite
from app.services.favorite_service import FavoriteService


pytestmark = pytest.mark.unit


@pytest.fixture
def repositories():
    return Mock(), Mock(), Mock()


@pytest.fixture
def service(repositories):
    favorite_repository, user_repository, coin_repository = repositories
    return FavoriteService(favorite_repository, user_repository, coin_repository)


def test_add_favorite_saves_when_all_business_rules_are_satisfied(service, repositories):
    favorite_repository, user_repository, coin_repository = repositories
    favorite = Favorite(1, "bitcoin")
    user_repository.exists.return_value = True
    coin_repository.exists.return_value = True
    favorite_repository.exists.return_value = False

    result = service.add_favorite(favorite)

    assert result == (True, "Favorito agregado correctamente.")
    favorite_repository.save.assert_called_once_with(favorite)


def test_add_favorite_stops_when_user_does_not_exist(service, repositories):
    favorite_repository, user_repository, coin_repository = repositories
    user_repository.exists.return_value = False

    with pytest.raises(UserNotFoundException):
        service.add_favorite(Favorite(1, "bitcoin"))

    coin_repository.exists.assert_not_called()
    favorite_repository.exists.assert_not_called()
    favorite_repository.save.assert_not_called()


def test_add_favorite_stops_when_coin_does_not_exist(service, repositories):
    favorite_repository, user_repository, coin_repository = repositories
    user_repository.exists.return_value = True
    coin_repository.exists.return_value = False

    with pytest.raises(CoinNotFoundException):
        service.add_favorite(Favorite(1, "bitcoin"))

    favorite_repository.exists.assert_not_called()
    favorite_repository.save.assert_not_called()


def test_add_favorite_stops_when_favorite_already_exists(service, repositories):
    favorite_repository, user_repository, coin_repository = repositories
    user_repository.exists.return_value = True
    coin_repository.exists.return_value = True
    favorite_repository.exists.return_value = True

    with pytest.raises(FavoriteAlreadyExistsException):
        service.add_favorite(Favorite(1, "bitcoin"))

    favorite_repository.save.assert_not_called()


def test_remove_favorite_deletes_existing_relation(service, repositories):
    favorite_repository, _, _ = repositories
    favorite_repository.exists.return_value = True

    result = service.remove_favorite(1, "bitcoin")

    assert result == (True, "Favorito eliminado correctamente.")
    favorite_repository.delete.assert_called_once_with(1, "bitcoin")


def test_remove_favorite_raises_when_relation_does_not_exist(service, repositories):
    favorite_repository, _, _ = repositories
    favorite_repository.exists.return_value = False

    with pytest.raises(FavoriteNotFoundException):
        service.remove_favorite(1, "bitcoin")

    favorite_repository.delete.assert_not_called()


def test_get_favorites_reads_repository_after_validating_user(service, repositories):
    favorite_repository, user_repository, _ = repositories
    expected = [{"coin_id": "bitcoin"}]
    user_repository.exists.return_value = True
    favorite_repository.find_all_by_user.return_value = expected

    result = service.get_favorites(1)

    assert result == (True, expected)
    favorite_repository.find_all_by_user.assert_called_once_with(1)


def test_get_favorites_with_coin_data_raises_for_missing_user(service, repositories):
    favorite_repository, user_repository, _ = repositories
    user_repository.exists.return_value = False

    with pytest.raises(UserNotFoundException):
        service.get_favorites_with_coin_data(1)

    favorite_repository.find_all_with_coin_data.assert_not_called()

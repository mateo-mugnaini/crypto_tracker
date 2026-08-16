from datetime import datetime
from unittest.mock import Mock

import pytest

from app.exceptions.domain_exception import EmailAlreadyExistsException
from app.exceptions.domain_exception import InvalidCredentialsException
from app.models.user import User
from app.services.user_service import UserService


pytestmark = pytest.mark.unit


@pytest.fixture
def user():
    return User(
        id=None,
        username="mateo",
        email="mateo@example.test",
        password_hash="stored-hash",
        created_at=datetime(2026, 8, 16, 12, 0),
    )


def test_create_user_saves_when_email_is_available(user):
    repository = Mock()
    repository.exists_by_email.return_value = False
    repository.save.return_value = user
    service = UserService(repository)

    result = service.create_user(user)

    assert result is user
    repository.save.assert_called_once_with(user)


def test_create_user_rejects_duplicate_email_without_saving(user):
    repository = Mock()
    repository.exists_by_email.return_value = True
    service = UserService(repository)

    with pytest.raises(EmailAlreadyExistsException):
        service.create_user(user)

    repository.save.assert_not_called()


def test_register_user_hashes_password_before_persisting():
    repository = Mock()
    repository.exists_by_email.return_value = False
    repository.save.side_effect = lambda user: user
    hasher = Mock()
    hasher.hash.return_value = "scrypt-hash"
    service = UserService(repository, hasher)

    user = service.register_user("mateo", "mateo@example.test", "plain-password")

    assert user.password_hash == "scrypt-hash"
    hasher.hash.assert_called_once_with("plain-password")
    repository.save.assert_called_once_with(user)


def test_authenticate_returns_user_when_password_is_valid():
    repository = Mock()
    hasher = Mock()
    repository.find_by_email.return_value = {"id": 1, "password_hash": "hash"}
    hasher.verify.return_value = True
    service = UserService(repository, hasher)

    assert service.authenticate("mateo@example.test", "secure-pass")["id"] == 1


@pytest.mark.parametrize("user", [None, {"id": 1, "password_hash": "hash"}])
def test_authenticate_rejects_unknown_user_or_wrong_password(user):
    repository = Mock()
    hasher = Mock()
    repository.find_by_email.return_value = user
    hasher.verify.return_value = False
    service = UserService(repository, hasher)

    with pytest.raises(InvalidCredentialsException):
        service.authenticate("mateo@example.test", "wrong-pass")

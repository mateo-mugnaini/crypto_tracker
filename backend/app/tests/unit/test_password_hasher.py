import pytest

from app.security.password_hasher import PasswordHasher


pytestmark = pytest.mark.unit


def test_password_hasher_creates_verifiable_non_plaintext_hash():
    hasher = PasswordHasher()

    password_hash = hasher.hash("secure-password")

    assert password_hash != "secure-password"
    assert hasher.verify("secure-password", password_hash) is True
    assert hasher.verify("wrong-password", password_hash) is False

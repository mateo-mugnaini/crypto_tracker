import pytest

from app.security.password_hasher import PasswordHasher


pytestmark = pytest.mark.unit


def test_password_hasher_creates_verifiable_non_plaintext_hash():
    hasher = PasswordHasher()

    password_hash = hasher.hash("secure-password")

    assert password_hash != "secure-password"
    assert hasher.verify("secure-password", password_hash) is True
    assert hasher.verify("wrong-password", password_hash) is False


def test_password_hasher_uses_a_different_salt_for_each_hash():
    hasher = PasswordHasher()

    first_hash = hasher.hash("secure-password")
    second_hash = hasher.hash("secure-password")

    assert first_hash != second_hash
    assert hasher.verify("secure-password", first_hash) is True
    assert hasher.verify("secure-password", second_hash) is True


def test_password_hasher_rejects_malformed_or_unknown_hashes():
    hasher = PasswordHasher()

    assert hasher.verify("secure-password", "invalid") is False
    assert hasher.verify("secure-password", "bcrypt$invalid") is False

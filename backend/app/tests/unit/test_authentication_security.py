import base64

import pytest

from app.security.password_hasher import PasswordHasher
from app.security.token_service import TokenService


pytestmark = pytest.mark.unit


def test_password_hasher_rejects_invalid_base64_hash_parts():
    hasher = PasswordHasher()

    invalid_hash = "scrypt$16384$8$1$not-base64$not-base64"

    assert hasher.verify("secure-password", invalid_hash) is False


def test_password_hasher_accepts_valid_strict_base64_hash():
    hasher = PasswordHasher()
    password_hash = hasher.hash("secure-password")

    algorithm, n, r, p, salt, expected = password_hash.split("$")

    assert algorithm == "scrypt"
    assert int(n) == 2**14
    assert int(r) == 8
    assert int(p) == 1
    assert base64.b64decode(salt, validate=True)
    assert base64.b64decode(expected, validate=True)
    assert hasher.verify("secure-password", password_hash) is True


def test_token_service_rejects_missing_secret():
    with pytest.raises(RuntimeError, match="JWT_SECRET_KEY"):
        TokenService(None)


def test_token_service_rejects_non_positive_expiration():
    with pytest.raises(RuntimeError, match="JWT_ACCESS_TOKEN_MINUTES"):
        TokenService("a" * 32, expires_minutes=0)

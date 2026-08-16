import jwt
import pytest

from app.security.token_service import TokenService


pytestmark = pytest.mark.unit


def test_token_service_creates_jwt_with_user_subject():
    secret = "test-secret-key-with-at-least-thirty-two-bytes"
    service = TokenService(secret, expires_minutes=30)

    token = service.create_access_token(7)

    payload = jwt.decode(token, secret, algorithms=["HS256"])
    assert payload["sub"] == "7"

import pytest


pytestmark = pytest.mark.api


def test_missing_bearer_token_uses_consistent_error_contract(api_client):
    response = api_client.get("/users/me")

    assert response.status_code == 401
    assert response.json() == {
        "detail": {
            "code": "authentication_required",
            "message": "Token Bearer requerido.",
        }
    }
    assert response.headers["www-authenticate"] == "Bearer"


def test_invalid_bearer_token_uses_consistent_error_contract(api_client):
    response = api_client.get(
        "/users/me",
        headers={"Authorization": "Bearer invalid-token"},
    )

    assert response.status_code == 401
    assert response.json()["detail"]["code"] == "invalid_access_token"
    assert response.headers["www-authenticate"] == "Bearer"

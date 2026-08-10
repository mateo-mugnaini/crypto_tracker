from pydantic import ValidationError

from app.schemas.favorite import FavoriteCreateRequest


def test_favorite_request_model_accepts_valid_body():
    request = FavoriteCreateRequest(
        user_id=1,
        coin_id=" bitcoin ",
    )

    assert request.user_id == 1
    assert request.coin_id == "bitcoin"


def test_favorite_request_model_rejects_non_positive_user_id():
    try:
        FavoriteCreateRequest(
            user_id=0,
            coin_id="bitcoin",
        )
        assert False, "Expected ValidationError"

    except ValidationError as error:
        assert "greater than 0" in str(error)


def test_favorite_request_model_rejects_empty_coin_id():
    try:
        FavoriteCreateRequest(
            user_id=1,
            coin_id="",
        )
        assert False, "Expected ValidationError"

    except ValidationError as error:
        assert "at least 1 character" in str(error)


def test_favorite_request_model_requires_all_fields():
    try:
        FavoriteCreateRequest()
        assert False, "Expected ValidationError"

    except ValidationError as error:
        assert "user_id" in str(error)
        assert "coin_id" in str(error)


if __name__ == "__main__":
    test_favorite_request_model_accepts_valid_body()
    test_favorite_request_model_rejects_non_positive_user_id()
    test_favorite_request_model_rejects_empty_coin_id()
    test_favorite_request_model_requires_all_fields()
    print("All favorite request model tests passed.")

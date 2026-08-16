from datetime import datetime

import pytest

from app.models.user import User


pytestmark = pytest.mark.unit


def test_user_represents_a_new_entity_without_database_id():
    created_at = datetime(2026, 8, 16, 12, 0)

    user = User(
        id=None,
        username="mateo",
        email="mateo@example.test",
        password_hash="stored-hash",
        created_at=created_at,
    )

    assert user.id is None
    assert user.username == "mateo"
    assert user.email == "mateo@example.test"
    assert user.password_hash == "stored-hash"
    assert user.created_at == created_at


def test_user_string_representation_uses_username():
    user = User(
        id=1,
        username="mateo",
        email="mateo@example.test",
        password_hash="stored-hash",
        created_at=datetime(2026, 8, 16, 12, 0),
    )

    assert str(user) == "mateo"

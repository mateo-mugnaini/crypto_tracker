from datetime import datetime


class User:

    def __init__(
        self,
        id: int | None,
        username: str,
        email: str,
        password_hash: str,
        created_at: datetime,
    ):
        self.id = id
        self.username = username
        self.email = email
        self.password_hash = password_hash
        self.created_at = created_at

    def __str__(self):
        return self.username

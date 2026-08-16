from app.exceptions.domain_exception import EmailAlreadyExistsException
from datetime import datetime

from app.models.user import User


class UserService:
    def __init__(self, user_repository, password_hasher=None):
        self.user_repository = user_repository
        self.password_hasher = password_hasher

    def create_user(self, user: User) -> User:
        if self.user_repository.exists_by_email(user.email):
            raise EmailAlreadyExistsException("El email ya está registrado.")

        return self.user_repository.save(user)

    def register_user(self, username: str, email: str, password: str) -> User:
        if self.password_hasher is None:
            raise RuntimeError("PasswordHasher no está configurado.")

        user = User(
            id=None,
            username=username,
            email=email,
            password_hash=self.password_hasher.hash(password),
            created_at=datetime.now(),
        )
        return self.create_user(user)

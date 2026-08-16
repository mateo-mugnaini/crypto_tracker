from app.exceptions.domain_exception import (
    EmailAlreadyExistsException,
    InvalidCredentialsException,
)
from datetime import datetime

from app.models.user import User


class UserService:
    def __init__(self, user_repository, password_hasher=None, token_service=None):
        self.user_repository = user_repository
        self.password_hasher = password_hasher
        self.token_service = token_service

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

    def authenticate(self, email: str, password: str):
        user = self.user_repository.find_by_email(email)

        if user is None or not self.password_hasher.verify(password, user["password_hash"]):
            raise InvalidCredentialsException("Email o password incorrectos.")

        return user

    def login(self, email: str, password: str) -> str:
        if self.token_service is None:
            raise RuntimeError("TokenService no está configurado.")
        user = self.authenticate(email, password)
        return self.token_service.create_access_token(user["id"])

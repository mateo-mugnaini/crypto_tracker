from app.exceptions.api_exception import (
    AppException,
    CoinGeckoException,
    ExternalServiceException,
)
from app.exceptions.domain_exception import (
    CoinNotFoundException,
    DomainException,
    EmailAlreadyExistsException,
    FavoriteAlreadyExistsException,
    InvalidCredentialsException,
    FavoriteNotFoundException,
    UserNotFoundException,
)

__all__ = [
    "AppException",
    "CoinGeckoException",
    "CoinNotFoundException",
    "DomainException",
    "EmailAlreadyExistsException",
    "ExternalServiceException",
    "FavoriteAlreadyExistsException",
    "InvalidCredentialsException",
    "FavoriteNotFoundException",
    "UserNotFoundException",
]

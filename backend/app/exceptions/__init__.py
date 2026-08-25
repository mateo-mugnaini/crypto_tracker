from app.exceptions.api_exception import (
    AppException,
    AuthenticationException,
    CoinGeckoException,
    ExternalServiceException,
    RateLimitExceededException,
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
    "AuthenticationException",
    "CoinGeckoException",
    "CoinNotFoundException",
    "DomainException",
    "EmailAlreadyExistsException",
    "ExternalServiceException",
    "RateLimitExceededException",
    "FavoriteAlreadyExistsException",
    "InvalidCredentialsException",
    "FavoriteNotFoundException",
    "UserNotFoundException",
]

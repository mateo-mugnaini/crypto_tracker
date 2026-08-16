from app.exceptions.api_exception import (
    AppException,
    CoinGeckoException,
    ExternalServiceException,
)
from app.exceptions.domain_exception import (
    CoinNotFoundException,
    DomainException,
    FavoriteAlreadyExistsException,
    FavoriteNotFoundException,
    UserNotFoundException,
)

__all__ = [
    "AppException",
    "CoinGeckoException",
    "CoinNotFoundException",
    "DomainException",
    "ExternalServiceException",
    "FavoriteAlreadyExistsException",
    "FavoriteNotFoundException",
    "UserNotFoundException",
]

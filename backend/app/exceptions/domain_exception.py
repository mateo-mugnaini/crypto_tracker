from app.exceptions.api_exception import AppException


class DomainException(AppException):
    """Excepción base para errores de dominio"""


class UserNotFoundException(DomainException):
    """El usuario no existe."""


class CoinNotFoundException(DomainException):
    """La moneda no existe."""


class FavoriteAlreadyExistsException(DomainException):
    """El favorito ya existe."""


class FavoriteNotFoundException(DomainException):
    """El favorito no existe."""

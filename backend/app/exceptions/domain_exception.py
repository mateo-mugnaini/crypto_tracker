from app.exceptions.api_exception import AppException


class DomainException(AppException):
    """Excepción base para errores de dominio"""


class UserNotFoundException(DomainException):
    """El usuario no existe."""


class EmailAlreadyExistsException(DomainException):
    """El email ya pertenece a un usuario."""


class InvalidCredentialsException(DomainException):
    """Las credenciales no son válidas."""


class ForbiddenOperationException(DomainException):
    """El usuario no tiene permiso para realizar la operación."""


class CoinNotFoundException(DomainException):
    """La moneda no existe."""


class FavoriteAlreadyExistsException(DomainException):
    """El favorito ya existe."""


class FavoriteNotFoundException(DomainException):
    """El favorito no existe."""


class PortfolioHoldingNotFoundException(DomainException):
    """La posición de cartera no existe."""


class PortfolioOperationNotFoundException(DomainException):
    """La operación de cartera no existe."""


class InsufficientPortfolioBalanceException(DomainException):
    """La venta supera la cantidad disponible de una moneda."""


class PriceAlertNotFoundException(DomainException):
    """La alerta de precio no existe."""

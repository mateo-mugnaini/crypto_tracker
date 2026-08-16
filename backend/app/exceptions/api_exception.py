class AppException(Exception):
    """Base exception for known application errors."""


class ExternalServiceException(AppException):
    """Error while using an external service."""


class ApiException(ExternalServiceException):
    """Excepción base para errores relacionados con APIs."""


class CoinGeckoException(ExternalServiceException):
    """Error al comunicarse con CoinGecko."""

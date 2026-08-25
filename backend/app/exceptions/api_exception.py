class AppException(Exception):
    """Base exception for known application errors."""


class ExternalServiceException(AppException):
    """Error while using an external service."""


class ApiException(ExternalServiceException):
    """Excepción base para errores relacionados con APIs."""


class CoinGeckoException(ExternalServiceException):
    """Error al comunicarse con CoinGecko."""


class RateLimitExceededException(AppException):
    """El cliente superó el límite temporal de una operación protegida."""

    def __init__(self, retry_after: int):
        self.retry_after = retry_after
        super().__init__("Demasiadas solicitudes. Intenta nuevamente más tarde.")

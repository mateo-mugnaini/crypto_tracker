class ApiException(Exception):
    """Excepción base para errores relacionados con APIs."""


class CoinGeckoException(ApiException):
    """Error al comunicarse con CoinGecko."""

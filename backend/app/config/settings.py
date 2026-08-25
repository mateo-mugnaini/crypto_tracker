import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    VALID_APP_ENVS = {"development", "test", "production"}
    VALID_LOG_LEVELS = {"DEBUG", "INFO", "WARNING", "ERROR", "CRITICAL"}

    def __init__(self):
        self.app_env = os.getenv("APP_ENV", "development").strip().lower()
        if self.app_env not in self.VALID_APP_ENVS:
            raise ValueError(
                "APP_ENV debe ser development, test o production."
            )

        self.coingecko_base_url = os.getenv("COINGECKO_BASE_URL")
        self.request_timeout = int(os.getenv("REQUEST_TIMEOUT", 10))
        self.log_level = os.getenv("LOG_LEVEL", "INFO").upper()
        if self.log_level not in self.VALID_LOG_LEVELS:
            raise ValueError(
                "LOG_LEVEL debe ser DEBUG, INFO, WARNING, ERROR o CRITICAL."
            )

        self.mysql_host = os.getenv("MYSQL_HOST")
        self.mysql_port = int(os.getenv("MYSQL_PORT", 3306))
        self.mysql_user = os.getenv("MYSQL_USER")
        self.mysql_password = os.getenv("MYSQL_PASSWORD")
        self.mysql_database = os.getenv("MYSQL_DATABASE")
        self.mysql_test_database = os.getenv("MYSQL_TEST_DATABASE")
        self.mysql_pool_size = int(os.getenv("MYSQL_POOL_SIZE", 5))
        if self.mysql_pool_size < 1:
            raise ValueError("MYSQL_POOL_SIZE debe ser mayor que cero.")
        self.jwt_secret_key = os.getenv("JWT_SECRET_KEY")
        self.jwt_algorithm = os.getenv("JWT_ALGORITHM", "HS256")
        self.jwt_access_token_minutes = int(os.getenv("JWT_ACCESS_TOKEN_MINUTES", 30))
        self.cors_allowed_origins = [
            origin.strip()
            for origin in os.getenv(
                "CORS_ALLOWED_ORIGINS",
                "http://localhost:3000,http://127.0.0.1:3000",
            ).split(",")
            if origin.strip()
        ]
        self.rate_limit_login_max_requests = int(
            os.getenv("RATE_LIMIT_LOGIN_MAX_REQUESTS", 10)
        )
        self.rate_limit_login_window_seconds = int(
            os.getenv("RATE_LIMIT_LOGIN_WINDOW_SECONDS", 60)
        )

    def validate_for_runtime(self) -> None:
        """Validate settings that are unsafe to leave implicit at startup."""
        if self.app_env != "production":
            return

        errors = []

        required_values = {
            "COINGECKO_BASE_URL": self.coingecko_base_url,
            "MYSQL_HOST": self.mysql_host,
            "MYSQL_USER": self.mysql_user,
            "MYSQL_PASSWORD": self.mysql_password,
            "MYSQL_DATABASE": self.mysql_database,
        }

        for name, value in required_values.items():
            if not isinstance(value, str) or not value.strip():
                errors.append(name)

        if (
            not isinstance(self.jwt_secret_key, str)
            or len(self.jwt_secret_key) < 32
            or self.jwt_secret_key.lower().startswith("replace_with")
        ):
            errors.append("JWT_SECRET_KEY")

        if not self.cors_allowed_origins or any(
            origin == "*"
            or "localhost" in origin
            or "127.0.0.1" in origin
            for origin in self.cors_allowed_origins
        ):
            errors.append("CORS_ALLOWED_ORIGINS")

        if self.request_timeout <= 0:
            errors.append("REQUEST_TIMEOUT")
        if self.mysql_port < 1 or self.mysql_port > 65535:
            errors.append("MYSQL_PORT")
        if self.jwt_access_token_minutes <= 0:
            errors.append("JWT_ACCESS_TOKEN_MINUTES")
        if self.rate_limit_login_max_requests <= 0:
            errors.append("RATE_LIMIT_LOGIN_MAX_REQUESTS")
        if self.rate_limit_login_window_seconds <= 0:
            errors.append("RATE_LIMIT_LOGIN_WINDOW_SECONDS")

        if errors:
            fields = ", ".join(errors)
            raise RuntimeError(
                f"Configuración inválida para APP_ENV=production: {fields}."
            )


settings = Settings()

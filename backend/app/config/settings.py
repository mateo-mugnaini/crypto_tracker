import os

from dotenv import load_dotenv

load_dotenv()


class Settings:
    def __init__(self):
        self.coingecko_base_url = os.getenv("COINGECKO_BASE_URL")
        self.request_timeout = int(os.getenv("REQUEST_TIMEOUT", 10))
        self.mysql_host = os.getenv("MYSQL_HOST")
        self.mysql_port = int(os.getenv("MYSQL_PORT", 3306))
        self.mysql_user = os.getenv("MYSQL_USER")
        self.mysql_password = os.getenv("MYSQL_PASSWORD")
        self.mysql_database = os.getenv("MYSQL_DATABASE")
        self.mysql_test_database = os.getenv("MYSQL_TEST_DATABASE")
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


settings = Settings()

import os

from dotenv import load_dotenv

load_dotenv()


class Settings:

    coingecko_base_url = os.getenv("COINGECKO_BASE_URL")

    request_timeout = int(os.getenv("REQUEST_TIMEOUT", 10))

    mysql_host = os.getenv("MYSQL_HOST")

    mysql_port = int(os.getenv("MYSQL_PORT", 3306))

    mysql_user = os.getenv("MYSQL_USER")

    mysql_password = os.getenv("MYSQL_PASSWORD")

    mysql_database = os.getenv("MYSQL_DATABASE")


settings = Settings()

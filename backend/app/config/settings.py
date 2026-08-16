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


settings = Settings()

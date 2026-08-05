import os

from dotenv import load_dotenv

load_dotenv()


class Settings:

    COINGECKO_BASE_URL = os.getenv("COINGECKO_BASE_URL")

    REQUEST_TIMEOUT = int(os.getenv("REQUEST_TIMEOUT", 10))

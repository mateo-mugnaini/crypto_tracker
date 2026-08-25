from app.api.coingecko_client import CoinGeckoClient

from app.repositories.coin_repository import CoinRepository
from app.repositories.user_repository import UserRepository
from app.repositories.favorite_repository import FavoriteRepository
from app.repositories.price_history_repository import PriceHistoryRepository

from app.services.coin_service import CoinService
from app.services.favorite_service import FavoriteService
from app.services.price_history_service import PriceHistoryService
from app.services.user_service import UserService
from app.security.password_hasher import PasswordHasher
from app.security.token_service import TokenService
from app.config.settings import settings

from app.controllers.coin_controller import CoinController
from app.controllers.favorite_controller import FavoriteController
from app.controllers.price_history_controller import PriceHistoryController
from app.controllers.user_controller import UserController


class Container:

    def __init__(self):
        # API CLIENT
        self.api_client = CoinGeckoClient()

        # REPOSITORIES
        self.coin_repository = CoinRepository()
        self.user_repository = UserRepository()
        self.favorite_repository = FavoriteRepository()
        self.price_history_repository = PriceHistoryRepository()
        self.password_hasher = PasswordHasher()
        self.token_service = TokenService(settings.jwt_secret_key, settings.jwt_algorithm, settings.jwt_access_token_minutes)

        # SERVICES
        self.coin_service = CoinService(self.coin_repository, self.api_client)
        self.favorite_service = FavoriteService(
            self.favorite_repository, self.user_repository, self.coin_repository
        )
        self.price_history_service = PriceHistoryService(
            self.price_history_repository,
            self.api_client,
        )
        self.user_service = UserService(self.user_repository, self.password_hasher, self.token_service)

        # CONTROLLERS
        self.coin_controller = CoinController(self.coin_service)
        self.favorite_controller = FavoriteController(self.favorite_service)
        self.price_history_controller = PriceHistoryController(
            self.price_history_service
        )
        self.user_controller = UserController(self.user_service)

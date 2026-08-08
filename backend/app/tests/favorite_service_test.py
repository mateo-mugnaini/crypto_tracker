from app.models.favorite import Favorite
from app.repositories.favorite_repository import FavoriteRepository
from app.repositories.user_repository import UserRepository
from app.repositories.coin_repository import CoinRepository
from app.services.favorite_service import FavoriteService


def main():

    favorite_repository = FavoriteRepository()
    user_repository = UserRepository()
    coin_repository = CoinRepository()

    service = FavoriteService(favorite_repository, user_repository, coin_repository)

    favorite = Favorite(1, "bitcoin")

    success, message = service.add_favorite(favorite)

    print(message)


if __name__ == "__main__":
    main()

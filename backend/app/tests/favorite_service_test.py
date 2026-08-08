from app.models.favorite import Favorite
from app.repositories.favorite_repository import FavoriteRepository
from app.services.favorite_service import FavoriteService


def main():

    repository = FavoriteRepository()

    service = FavoriteService(repository)

    favorite = Favorite(1,"bitcoin")

    service.add_favorite(favorite)

    print("Favorito agregado correctamente.")


if __name__ == "__main__":
    main()

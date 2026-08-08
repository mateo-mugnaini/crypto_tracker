from app.repositories.favorite_repository import FavoriteRepository
from app.services.favorite_service import FavoriteService


def main():

    repository = FavoriteRepository()

    service = FavoriteService(repository)

    favorites = service.get_favorites(1)

    if not favorites:
        print("El usuario no tiene monedas favoritas.")
        return

    print("Favoritos del usuario:")

    for favorite in favorites:
        print(f"- {favorite['coin_id']}")


if __name__ == "__main__":
    main()

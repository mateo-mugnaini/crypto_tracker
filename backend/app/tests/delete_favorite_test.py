from app.models.favorite import Favorite
from app.repositories.favorite_repository import FavoriteRepository
from app.services.favorite_service import FavoriteService


def main():

    repository = FavoriteRepository()

    service = FavoriteService(repository)

    favorite = Favorite(1, "bitcoin")

    added = service.add_favorite(favorite)

    if added:
        print("Favorito agregado correctamente.")
    else:
        print("Ya tienes esta moneda en favoritos.")

    removed = service.remove_favorite(favorite.user_id, favorite.coin_id)

    if removed:
        print("Favorito eliminado correctamente.")
    else:
        print("No tienes esta moneda en favoritos.")


if __name__ == "__main__":
    main()

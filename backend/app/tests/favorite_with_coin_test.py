from app.repositories.favorite_repository import FavoriteRepository
from app.services.favorite_service import FavoriteService


def main():

    repository = FavoriteRepository()

    service = FavoriteService(repository)

    favorites = service.get_favorites_with_coin_data(1)

    if not favorites:
        print("El usuario no tiene favoritos.")
        return

    print("Favoritos del usuario:")
    print()

    for favorite in favorites:

        print(f"ID: {favorite['coin_id']}")
        print(f"Nombre: {favorite['name']}")
        print(f"Símbolo: {favorite['symbol']}")
        print(f"Market Cap Rank: {favorite['market_cap_rank']}")
        print("------------------------")


if __name__ == "__main__":
    main()

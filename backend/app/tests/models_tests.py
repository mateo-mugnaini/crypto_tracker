from app.models.user import User
from app.models.favorite import Favorite
from app.models.price_history import PriceHistory


def main():

    user = User(1, "mateo", "mateo@test.com", "hash123", "2026-08-07")

    favorite = Favorite(1, "bitcoin")

    history = PriceHistory(1, "bitcoin", 60000, "2026-08-07")

    print(user)
    print(favorite)
    print(history)


if __name__ == "__main__":
    main()

from app.models.coin import Coin


def main():

    bitcoin = Coin(
        "bitcoin",
        "btc",
        "Bitcoin",
        1
    )

    print(bitcoin)


if __name__ == "__main__":
    main()
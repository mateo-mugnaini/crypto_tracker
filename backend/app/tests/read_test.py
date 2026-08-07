from app.repositories.coin_repository import CoinRepository


def main():

    repository = CoinRepository()

    coins = repository.find_all()

    for coin in coins:
        print(coin)


if __name__ == "__main__":
    main()

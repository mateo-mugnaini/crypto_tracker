from app.models.coin import Coin
from app.repositories.coin_repository import CoinRepository


def main():
    coin = Coin(id="bitcoin", symbol="btc", name="Bitcoin", market_cap_rank=1)

    repository = CoinRepository()

    repository.save(coin)
    print("Moneda guardada correctamente.")


if __name__ == "__main__":
    main()

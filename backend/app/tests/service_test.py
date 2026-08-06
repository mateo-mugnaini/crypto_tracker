from app.services.coin_service import CoinService
from app.repositories.coin_repository import CoinRepository
from app.api.coingecko_client import CoinGeckoClient


def main():

    repository = CoinRepository()

    client = CoinGeckoClient()

    service = CoinService(repository, client)

    coin = service.update_coin("bitcoin")

    print("================")
    print("Moneda actualizada")
    print("================")

    print(coin.name)
    print(coin.symbol)


if __name__ == "__main__":
    main()

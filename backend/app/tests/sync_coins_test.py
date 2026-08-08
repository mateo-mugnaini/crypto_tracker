from app.api.coingecko_client import CoinGeckoClient
from app.repositories.coin_repository import CoinRepository
from app.services.coin_service import CoinService


def main():

    repository = CoinRepository()
    api_client = CoinGeckoClient()

    service = CoinService(repository, api_client)

    coins = service.sync_coins()

    print(f"Monedas sincronizadas: {len(coins)}")

    for coin in coins:
        print(f"{coin.id} | " f"{coin.symbol} | " f"{coin.name}")


if __name__ == "__main__":
    main()

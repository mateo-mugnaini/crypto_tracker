from app.api.coingecko_client import CoinGeckoClient
from app.repositories.price_history_repository import PriceHistoryRepository
from app.services.price_history_service import PriceHistoryService


def main():
    repository = PriceHistoryRepository()

    api_client = CoinGeckoClient()

    service = PriceHistoryService(repository, api_client)

    history = service.update_price("bitcoin")

    print(history)


if __name__ == "__main__":
    main()

from app.api.coingecko_client import CoinGeckoClient
from app.controllers.price_history_controller import PriceHistoryController
from app.repositories.price_history_repository import PriceHistoryRepository
from app.services.price_history_service import PriceHistoryService


def main():

    api_client = CoinGeckoClient()

    repository = PriceHistoryRepository()

    service = PriceHistoryService(repository, api_client)

    controller = PriceHistoryController(service)

    result = controller.update_price("bitcoin")

    print(result)


if __name__ == "__main__":
    main()

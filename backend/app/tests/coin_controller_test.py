from app.api.coingecko_client import CoinGeckoClient
from app.controllers.coin_controller import CoinController
from app.repositories.coin_repository import CoinRepository
from app.services.coin_service import CoinService


def main():

    repository = CoinRepository()
    api_client = CoinGeckoClient()

    service = CoinService(repository, api_client)

    controller = CoinController(service)

    result = controller.update_coin("bitcoin")

    print(result)


if __name__ == "__main__":
    main()

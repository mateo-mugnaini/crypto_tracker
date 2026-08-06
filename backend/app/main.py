from pathlib import Path
import sys

if __package__ in {None, ""}:
    sys.path.append(str(Path(__file__).resolve().parents[1]))

from app.api.coingecko_client import CoinGeckoClient
from app.repositories.coin_repository import CoinRepository
from app.services.coin_service import CoinService


def main():
    service = CoinService(CoinRepository(), CoinGeckoClient())

    try:
        coin = service.update_coin("bitcoin")

        print("================")
        print("Moneda actualizada")
        print("================")
        print(f"{coin.name} ({coin.symbol.upper()})")
        print(f"Ranking: #{coin.market_cap_rank}")

    except Exception as error:
        print("No se pudo completar la sincronización con CoinGecko/MySQL.")
        print(f"Detalle: {error}")


if __name__ == "__main__":
    main()

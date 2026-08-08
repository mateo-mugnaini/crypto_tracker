from app.api.coingecko_client import CoinGeckoClient


def main():

    api_client = CoinGeckoClient()

    coins = api_client.get_market_coins(
        vs_currency="usd", per_page=10, page=1, order="market_cap_desc"
    )

    if not coins:
        print("No se pudieron obtener monedas.")
        return

    print(f"Monedas obtenidas: {len(coins)}")

    for coin in coins:
        print(
            f"{coin['id']} | "
            f"{coin['symbol']} | "
            f"{coin['name']} | "
            f"${coin['current_price']}"
        )


if __name__ == "__main__":
    main()

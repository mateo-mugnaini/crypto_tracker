# # from utils import sumar
# # import utils

# # print("Opcion 1")
# # print(sumar(2, 5))

# # print("Opcion 2")
# # print(utils.sumar(2, 5))

# from utils import mostrar_titulo
# from models.coin import Coin


# def main():
#     mostrar_titulo()
#     print("¡Bienvenido!")
#     print("El proyecto se ha iniciado correctamente.")

#     print("Creando un objeto para COINS")
#     peso_argentino = Coin(name="Peso Argentino", symbol="ARS", value=100)
#     peso_argentino.show()
#     print("cambio de valor")
#     peso_argentino.value = 200
#     peso_argentino.show()
#     # bitcoin = Coin("Bitcoin", "BTC")
#     # ethereum = Coin("Ethereum", "ETH")
#     # bitcoin.show()
#     # ethereum.show()


# if __name__ == "__main__":
#     main()
from services.coingecko_service import CoinGeckoService


def main():

    service = CoinGeckoService()

    coins = service.get_market_coins()

    for coin in coins:

        print(coin["name"], "| $", coin["current_price"])


if __name__ == "__main__":
    main()

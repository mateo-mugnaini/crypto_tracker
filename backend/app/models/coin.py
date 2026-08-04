# class Coin:
#     def __init__(self, value: int, name: str, symbol: str):
#         self.name = name
#         self.symbol = symbol
#         self.value = value

#     def show(self):
#         print(self.name, self.value)
#         # print(self.symbol)


class Coin:

    def __init__(
        self, id: str, name: str, symbol: str, price: float, market_cap_rank: int
    ):

        self.id = id
        self.name = name
        self.symbol = symbol
        self.price = price
        self.market_cap_rank = market_cap_rank

    def show(self):

        print("----------------------")
        print(f"Nombre: {self.name}")
        print(f"Símbolo: {self.symbol.upper()}")
        print(f"Precio: ${self.price}")
        print(f"Ranking: #{self.market_cap_rank}")

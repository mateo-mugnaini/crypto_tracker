class Coin:
    def __init__(self, value: int, name: str, symbol: str):
        self.name = name
        self.symbol = symbol
        self.value = value

    def show(self):
        print(self.name, self.value)
        # print(self.symbol)

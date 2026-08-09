from app.exceptions.api_exception import CoinGeckoException


class CoinController:

    def __init__(self, service):
        self.service = service

    def update_coin(self, coin_id):

        try:

            coin = self.service.update_coin(coin_id)

            return {
                "success": True,
                "message": "Moneda sincronizada correctamente.",
                "data": coin,
            }

        except CoinGeckoException as error:

            return {
                "success": False,
                "message": str(error),
                "data": None,
            }

    def sync_coins(self):

        try:

            coins = self.service.sync_coins()

            return {
                "success": True,
                "message": "Monedas sincronizadas correctamente.",
                "data": coins,
            }

        except CoinGeckoException as error:

            return {
                "success": False,
                "message": str(error),
                "data": None,
            }

    def get_all_coins(self):

        coins = self.service.get_all_coins()

        return {
            "success": True,
            "message": "Monedas obtenidas correctamente.",
            "data": coins,
        }

    def get_coin(self, coin_id):

        coin = self.service.get_coin(coin_id)

        if coin is None:

            return {
                "success": False,
                "message": "Moneda no encontrada.",
                "data": None,
            }

        return {
            "success": True,
            "message": "Moneda encontrada correctamente.",
            "data": coin,
        }

from app.exceptions.domain_exception import CoinNotFoundException


class CoinController:

    def __init__(self, service):
        self.service = service

    def update_coin(self, coin_id):
        coin = self.service.update_coin(coin_id)

        return {
            "success": True,
            "message": "Moneda sincronizada correctamente.",
            "data": coin,
        }

    def sync_coins(self):
        coins = self.service.sync_coins()

        return {
            "success": True,
            "message": "Monedas sincronizadas correctamente.",
            "data": coins,
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

            raise CoinNotFoundException("Moneda no encontrada.")

        return {
            "success": True,
            "message": "Moneda encontrada correctamente.",
            "data": coin,
        }

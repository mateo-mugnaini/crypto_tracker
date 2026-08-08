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

            return {"success": False, "message": str(error), "data": None}

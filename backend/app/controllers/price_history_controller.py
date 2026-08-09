from app.exceptions.api_exception import CoinGeckoException


class PriceHistoryController:

    def __init__(self, service):
        self.service = service

    def update_price(self, coin_id):
        try:
            history = self.service.update_price(coin_id)

            return {
                "success": True,
                "message": "Precio actualizado correctamente",
                "data": history,
            }

        except CoinGeckoException as error:
            return {
                "success": False,
                "message": str(error),
                "data": None,
            }

    def get_history(self, coin_id):
        try:
            history = self.service.get_history(coin_id)

            return {
                "success": True,
                "message": "Historial obtenido correctamente",
                "data": history,
            }

        except Exception as error:
            return {
                "success": False,
                "message": str(error),
                "data": None,
            }

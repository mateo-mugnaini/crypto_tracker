class FavoriteController:

    def __init__(self, service):
        self.service = service

    def add_favorite(self, favorite):

        success, message = self.service.add_favorite(favorite)

        return {
            "success": success,
            "message": message,
        }

    def remove_favorite(self, user_id, coin_id):

        success, message = self.service.remove_favorite(user_id, coin_id)

        return {
            "success": success,
            "message": message,
        }

    def get_favorites(self, user_id):

        success, result = self.service.get_favorites(user_id)

        return {
            "success": success,
            "data": result,
        }

    def get_favorites_with_coin_data(self, user_id):

        success, result = self.service.get_favorites_with_coin_data(user_id)

        return {
            "success": success,
            "data": result,
        }

class FavoriteService:

    def __init__(self, repository):
        self.repository = repository

    def add_favorite(self, favorite):

        if self.repository.exists(favorite.user_id, favorite.coin_id):
            return False

        self.repository.save(favorite)

        return True

    def remove_favorite(self, user_id, coin_id):

        if not self.repository.exists(user_id, coin_id):
            return False

        return self.repository.delete(user_id, coin_id)

    def get_favorites(self, user_id):

        return self.repository.find_all_by_user(user_id)

    def get_favorites_with_coin_data(self, user_id):

        return self.repository.find_all_with_coin_data(user_id)

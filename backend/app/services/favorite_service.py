class FavoriteService:

    def __init__(self, repository):
        self.repository = repository

    def add_favorite(self, favorite):
        self.repository.save(favorite)

    def remove_favorite(self, user_id, coin_id):
        self.repository.delete(user_id, coin_id)

    def get_favorites(self, user_id):
        return self.repository.find_all_by_user(user_id)

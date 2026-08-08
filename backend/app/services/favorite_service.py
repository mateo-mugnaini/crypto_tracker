class FavoriteService:

    def __init__(self, favorite_repository, user_repository, coin_repository):
        self.favorite_repository = favorite_repository
        self.user_repository = user_repository
        self.coin_repository = coin_repository

    def add_favorite(self, favorite):

        if not self.user_repository.exists(favorite.user_id):
            return False, "El usuario no existe."

        if not self.coin_repository.exists(favorite.coin_id):
            return False, "La moneda no existe."

        if self.favorite_repository.exists(favorite.user_id, favorite.coin_id):
            return False, "La moneda ya está en favoritos."

        self.favorite_repository.save(favorite)

        return True, "Favorito agregado correctamente."

    def remove_favorite(self, user_id, coin_id):

        if not self.favorite_repository.exists(user_id, coin_id):
            return False, "La moneda no está en favoritos."

        self.favorite_repository.delete(user_id, coin_id)

        return True, "Favorito eliminado correctamente."

    def get_favorites(self, user_id):

        if not self.user_repository.exists(user_id):
            return False, "El usuario no existe."

        return True, self.favorite_repository.find_all_by_user(user_id)

    def get_favorites_with_coin_data(self, user_id):

        if not self.user_repository.exists(user_id):
            return False, "El usuario no existe."

        return True, self.favorite_repository.find_all_with_coin_data(user_id)

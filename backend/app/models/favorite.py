class Favorite:
    def __init__(self, user_id, coin_id):
        self.user_id = user_id
        self.coin_id = coin_id

    def __str__(self):
        return f"User {self.user_id} favorite {self.coin_id}"

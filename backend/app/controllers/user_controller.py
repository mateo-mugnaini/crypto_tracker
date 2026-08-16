class UserController:
    def __init__(self, service):
        self.service = service

    def register_user(self, username: str, email: str, password: str):
        return self.service.register_user(username, email, password)

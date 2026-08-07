from app.repositories.user_repository import UserRepository


def main():

    repository = UserRepository()

    print("Usuarios:")

    users = repository.find_all()

    for user in users:
        print(user)

    print()
    print("Usuario por ID:")

    user = repository.find_by_id(1)

    print(user)


if __name__ == "__main__":
    main()

def get_price():

    price = "1000"
    # price = "bitcoin"

    return int(price)


def main():

    try:
        price = get_price()
        print(price)

    except ValueError:
        print("El precio no tiene formato correcto")


if __name__ == "__main__":
    main()

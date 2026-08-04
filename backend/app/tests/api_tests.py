import requests

url = "https://api.coingecko.com/api/v3/ping"


response = requests.get(url)


print(response.json())



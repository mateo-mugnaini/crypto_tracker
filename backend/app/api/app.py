from fastapi import FastAPI
from app.container import Container

app = FastAPI(
    title="Cryto Tracker API",
    description="API para gestionar criptomonedas, favoritos y ver el historial de precios",
    version="1.0.0",
)

container = Container()


@app.get("/")
def root():
    return {"success": True, "message": "Crypto Tracker API funcionando."}


@app.post("/coins/{coin_id}")
def update_coin(coin_id: str):

    return container.coin_controller.update_coin(coin_id)

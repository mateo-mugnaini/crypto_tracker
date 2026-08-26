def test_openapi_declares_documented_tag_groups(api_client):
    response = api_client.get("/openapi.json")

    assert response.status_code == 200
    schema = response.json()
    tag_names = {tag["name"] for tag in schema["tags"]}

    assert tag_names == {
        "system",
        "coins",
        "favorites",
        "users",
        "price-history",
        "portfolio",
        "alerts",
    }


def test_openapi_documents_price_history_and_login_contracts(api_client):
    schema = api_client.get("/openapi.json").json()

    price_history_operation = schema["paths"][
        "/coins/{coin_id}/price-history"
    ]["get"]
    login_operation = schema["paths"]["/users/login"]["post"]

    assert price_history_operation["summary"] == "Consultar historial de precios"
    assert price_history_operation["tags"] == ["price-history"]
    assert "200" in price_history_operation["responses"]
    assert "422" in price_history_operation["responses"]

    assert login_operation["summary"] == "Iniciar sesión"
    assert "401" in login_operation["responses"]
    assert "429" in login_operation["responses"]


def test_openapi_exposes_typed_coin_and_favorite_envelopes(api_client):
    schema = api_client.get("/openapi.json").json()

    coins_operation = schema["paths"]["/coins"]["get"]
    favorites_operation = schema["paths"]["/favorites"]["get"]

    coin_schema = coins_operation["responses"]["200"]["content"][
        "application/json"
    ]["schema"]
    favorite_schema = favorites_operation["responses"]["200"]["content"][
        "application/json"
    ]["schema"]

    assert coin_schema["$ref"] == "#/components/schemas/CoinListResponseEnvelope"
    assert favorite_schema["$ref"] == "#/components/schemas/FavoriteListResponse"

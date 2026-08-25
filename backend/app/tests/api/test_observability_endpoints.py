from uuid import UUID


def test_http_response_includes_request_id(api_client):
    response = api_client.get("/")

    assert response.status_code == 200
    request_id = response.headers.get("X-Request-ID")
    assert request_id is not None
    UUID(request_id)

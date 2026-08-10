Módulo 49 — Response Models
M49 está implementado y verificado.

1. Objetivo
   Definir contratos explícitos para las respuestas HTTP utilizando:
   response_model=...
   Se aplicaron Response Models a:
   favoritos;
   listado de Price History;
   estadísticas;
   variaciones;
   agregaciones temporales.
2. Separación de modelos
   Modelo interno
   ↓
   Response Model
   ↓
   JSON HTTP
   El modelo interno pertenece al dominio:
   PriceHistory
   El Response Model pertenece al contrato HTTP:
   PriceHistoryResponse
   Esto evita exponer accidentalmente atributos internos.
3. Response Models creados
   Archivo:
   [price_history.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/schemas/price_history.py)
   from datetime import datetime
   from typing import Literal

from pydantic import BaseModel, ConfigDict

class PriceHistoryResponse(BaseModel):
model_config = ConfigDict(
from_attributes=True,
extra="ignore",
)

    id: int | None
    coin_id: str
    price: float
    recorded_at: datetime

class PriceHistoryStatisticsResponse(BaseModel):
coin_id: str
count: int
min_price: float | None
max_price: float | None
average_price: float | None

class PriceHistoryVariationResponse(BaseModel):
coin_id: str
initial_price: float | None
final_price: float | None
absolute_change: float | None
percentage_change: float | None
trend: Literal["up", "down", "unchanged"] | None

class PriceHistoryAggregationResponse(BaseModel):
period: str
average_price: float | None
min_price: float | None
max_price: float | None
count: int
En [favorite.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/schemas/favorite.py) se agregó:
class FavoriteActionResponse(BaseModel):
success: bool
message: str 4. Endpoints integrados
En [app.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/api/app.py):
@app.post(
"/favorites",
response_model=FavoriteActionResponse,
)
@app.get(
"/coins/{coin_id}/price-history",
response_model=list[PriceHistoryResponse],
)
@app.get(
"/coins/{coin_id}/price-history/statistics",
response_model=PriceHistoryStatisticsResponse,
)
@app.get(
"/coins/{coin_id}/price-history/variation",
response_model=PriceHistoryVariationResponse,
)
@app.get(
"/coins/{coin_id}/price-history/aggregations",
response_model=list[PriceHistoryAggregationResponse],
) 5. Conceptos importantes
from_attributes=True
Permite convertir un objeto interno:
history = PriceHistory(...)
en un Response Model:
PriceHistoryResponse.model_validate(history)
extra="ignore"
Evita exponer atributos no declarados:
{
"id": 1,
"coin_id": "bitcoin",
"price": 65000,
"internal_database_connection": "hidden"
}
El campo interno no aparece en la respuesta HTTP. 6. Tests
Archivo:
[response_models_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/response_models_test.py)
Se probaron:
respuesta de favoritos;
conversión desde PriceHistory;
ocultamiento de campos extra;
estadísticas vacías;
tendencias válidas;
agregaciones temporales;
generación de OpenAPI. 7. Verificación ejecutada
cd backend

.venv\Scripts\python.exe -m app.tests.response_models_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "\*\_test.py"
.venv\Scripts\python.exe -m compileall -q app
Resultado:
Response Model tests: PASSED
Suite global: 10 tests OK
compileall: OK
OpenAPI muestra correctamente:
FavoriteActionResponse
PriceHistoryResponse
PriceHistoryStatisticsResponse
PriceHistoryVariationResponse
PriceHistoryAggregationResponse 8. Swagger
Iniciar:
cd backend
.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
Abrir:
http://127.0.0.1:8000/docs
Los endpoints muestran ahora sus modelos de salida documentados.

Módulo 48 — Pydantic Request Models
M48 está implementado y verificado.

1. Objetivo
   Introducir modelos Pydantic para validar el body de una petición HTTP.
   Se aplicó al endpoint:
   POST /favorites
   Ahora recibe:
   {
   "user_id": 1,
   "coin_id": "bitcoin"
   }
   Antes recibía parámetros de query:
   /favorites?user_id=1&coin_id=bitcoin
2. Flujo
   JSON HTTP
   ↓
   FavoriteCreateRequest
   ↓
   Favorite
   ↓
   Controller
   ↓
   Service
   ↓
   Repository
   El Request Model representa el contrato HTTP. El modelo Favorite continúa siendo el modelo interno del dominio.
3. Schema creado
   Archivo:
   [app/schemas/favorite.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/schemas/favorite.py)
   from pydantic import BaseModel, ConfigDict, Field

class FavoriteCreateRequest(BaseModel):
model_config = ConfigDict(str_strip_whitespace=True)

    user_id: int = Field(
        gt=0,
        description="Identificador positivo del usuario",
    )
    coin_id: str = Field(
        min_length=1,
        description="Identificador de CoinGecko de la moneda",
    )

Validaciones:
user_id debe ser mayor que 0.
coin_id no puede estar vacío.
Se eliminan espacios externos de los strings.
Los campos son obligatorios.
Ejemplo:
" bitcoin " → "bitcoin" 4. Integración con FastAPI
Archivo completo:
[app.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/api/app.py)
Código agregado:
from fastapi import Body
from app.schemas.favorite import FavoriteCreateRequest
@app.post("/favorites")
def add_favorite(
request: FavoriteCreateRequest = Body(...),
):
favorite = Favorite(
request.user_id,
request.coin_id,
)

    return container.favorite_controller.add_favorite(favorite)

La ruta solamente:
recibe el body;
permite que Pydantic lo valide;
crea el modelo interno Favorite;
delega al Controller.
La validación de existencia del usuario, existencia de la moneda y duplicados continúa en FavoriteService. 5. Diferencia entre modelos
Request Model
FavoriteCreateRequest
Representa datos recibidos desde HTTP.
Modelo interno
Favorite
Representa la entidad utilizada internamente por la aplicación.
No son el mismo objeto porque tienen responsabilidades diferentes:
HTTP contract ≠ Domain model 6. Tests
Archivo:
[favorite_request_model_test.py](/C:/Users/mateo/Projects/crypto_tracker/backend/app/tests/favorite_request_model_test.py)
Se probaron:
body válido;
eliminación de espacios;
user_id inválido;
coin_id vacío;
campos obligatorios;
generación del schema OpenAPI. 7. Pruebas ejecutadas
cd backend

.venv\Scripts\python.exe -m app.tests.favorite_request_model_test
.venv\Scripts\python.exe -m unittest discover -s app/tests -p "\*\_test.py"
.venv\Scripts\python.exe -m compileall -q app
Resultado:
Favorite Request Model tests: PASSED
Suite global: 10 tests OK
compileall: OK
OpenAPI también refleja:
FavoriteCreateRequest
user_id > 0
coin_id minLength = 1 8. Swagger
Iniciar:
cd backend
.venv\Scripts\python.exe -m uvicorn app.api.app:app --reload
Abrir:
http://127.0.0.1:8000/docs
Probar:
POST /favorites
Body válido:
{
"user_id": 1,
"coin_id": "bitcoin"
}
Body inválido:
{
"user_id": 0,
"coin_id": ""
}
Los errores deben producir 422 Unprocessable Entity antes de llegar al Service.

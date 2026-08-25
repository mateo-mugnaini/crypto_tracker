from contextlib import asynccontextmanager
import asyncio
import logging
from time import perf_counter
from uuid import uuid4

from fastapi import Body, Depends, FastAPI, Path, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

from app.api.dependencies import (
    get_coin_controller,
    get_favorite_controller,
    get_price_history_aggregation_query_params,
    get_price_history_controller,
    get_price_history_date_range_query_params,
    get_price_history_query_params,
    get_user_controller,
    get_current_user,
    get_login_rate_limit,
)
from app.container import Container
from app.config.settings import settings
from app.controllers.coin_controller import CoinController
from app.controllers.favorite_controller import FavoriteController
from app.controllers.price_history_controller import PriceHistoryController
from app.controllers.user_controller import UserController
from app.exceptions.api_exception import (
    AuthenticationException,
    CoinGeckoException,
    RateLimitExceededException,
)
from app.exceptions.domain_exception import (
    CoinNotFoundException,
    EmailAlreadyExistsException,
    InvalidCredentialsException,
    ForbiddenOperationException,
    FavoriteAlreadyExistsException,
    FavoriteNotFoundException,
    UserNotFoundException,
)
from app.api.health import check_database
from app.logging_config import configure_logging
from app.models.favorite import Favorite
from app.observability import (
    RequestMetrics,
    reset_request_id,
    set_request_id,
)
from app.schemas.coin import CoinListResponseEnvelope, CoinResponseEnvelope
from app.schemas.error import ErrorResponse
from app.schemas.favorite import (
    FavoriteActionResponse,
    FavoriteCreateRequest,
    FavoriteDetailsListResponse,
    FavoriteListResponse,
)
from app.schemas.health import HealthResponse
from app.schemas.price_history import (
    PriceHistoryAggregationQueryParams,
    PriceHistoryAggregationResponse,
    PriceHistoryDateRangeQueryParams,
    PriceHistoryQueryParams,
    PriceHistoryResponse,
    PriceHistoryStatisticsResponse,
    PriceHistoryVariationResponse,
)
from app.schemas.user import TokenResponse, UserLoginRequest, UserRegisterRequest, UserResponse
from app.schedulers.price_update_scheduler import PriceUpdateScheduler


logger = logging.getLogger("crypto_tracker.api")

OPENAPI_TAGS = [
    {
        "name": "system",
        "description": "Disponibilidad y metadatos operativos de la API.",
    },
    {
        "name": "coins",
        "description": "Consulta y sincronización de monedas.",
    },
    {
        "name": "favorites",
        "description": "Gestión de favoritos propios del usuario autenticado.",
    },
    {
        "name": "users",
        "description": "Registro, autenticación y perfil de usuarios.",
    },
    {
        "name": "price-history",
        "description": "Historial, estadísticas, variaciones y agregaciones de precios.",
    },
]

@asynccontextmanager
async def lifespan(application: FastAPI):
    configure_logging()
    settings.validate_for_runtime()
    container = Container()
    application.state.container = container
    scheduler_task = None

    if settings.price_update_enabled:
        scheduler = PriceUpdateScheduler(
            coin_repository=container.coin_repository,
            price_history_service=container.price_history_service,
            interval_seconds=settings.price_update_interval_seconds,
        )
        application.state.price_update_scheduler = scheduler
        scheduler_task = asyncio.create_task(scheduler.run())
        logger.info(
            "Automatic price updates enabled.",
            extra={
                "event": "price_update_scheduler_enabled",
                "interval_seconds": settings.price_update_interval_seconds,
            },
        )

    try:
        yield
    finally:
        if scheduler_task is not None:
            scheduler_task.cancel()
            try:
                await scheduler_task
            except asyncio.CancelledError:
                pass


app = FastAPI(
    title="Crypto Tracker API",
    description="API para gestionar criptomonedas, favoritos y ver el historial de precios",
    version="1.0.0",
    lifespan=lifespan,
    openapi_tags=OPENAPI_TAGS,
)
app.state.request_metrics = RequestMetrics()

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
    expose_headers=["X-Request-ID"],
)


@app.middleware("http")
async def log_http_request(request, call_next):
    started_at = perf_counter()
    request_id = str(uuid4())
    request_context_token = set_request_id(request_id)
    metrics = request.app.state.request_metrics
    fields = {
        "method": request.method,
        "path": request.url.path,
    }

    try:
        try:
            response = await call_next(request)
        except Exception as error:
            duration_ms = round((perf_counter() - started_at) * 1000, 2)
            metrics.record(500, duration_ms)
            logger.exception(
                "HTTP request failed.",
                extra={
                    "event": "http_request_failed",
                    **fields,
                    "duration_ms": duration_ms,
                    "error_type": type(error).__name__,
                },
            )
            raise

        duration_ms = round((perf_counter() - started_at) * 1000, 2)
        metrics.record(response.status_code, duration_ms)
        response.headers["X-Request-ID"] = request_id
        logger.info(
            "HTTP request completed.",
            extra={
                "event": "http_request_completed",
                **fields,
                "status_code": response.status_code,
                "duration_ms": duration_ms,
            },
        )
        return response
    finally:
        reset_request_id(request_context_token)


def _error_response(
    status_code: int,
    code: str,
    message: str,
    headers: dict[str, str] | None = None,
) -> JSONResponse:
    return JSONResponse(
        status_code=status_code,
        content={"detail": {"code": code, "message": message}},
        headers=headers,
    )


@app.exception_handler(UserNotFoundException)
@app.exception_handler(CoinNotFoundException)
@app.exception_handler(FavoriteNotFoundException)
async def not_found_exception_handler(_, exc):
    codes = {
        UserNotFoundException: "user_not_found",
        CoinNotFoundException: "coin_not_found",
        FavoriteNotFoundException: "favorite_not_found",
    }
    return _error_response(status.HTTP_404_NOT_FOUND, codes[type(exc)], str(exc))


@app.exception_handler(FavoriteAlreadyExistsException)
async def favorite_already_exists_exception_handler(_, exc):
    return _error_response(
        status.HTTP_409_CONFLICT,
        "favorite_already_exists",
        str(exc),
    )


@app.exception_handler(EmailAlreadyExistsException)
async def email_already_exists_exception_handler(_, exc):
    return _error_response(
        status.HTTP_409_CONFLICT,
        "email_already_exists",
        str(exc),
    )


@app.exception_handler(InvalidCredentialsException)
async def invalid_credentials_exception_handler(_, exc):
    return _error_response(
        status.HTTP_401_UNAUTHORIZED,
        "invalid_credentials",
        str(exc),
    )


@app.exception_handler(ForbiddenOperationException)
async def forbidden_operation_exception_handler(_, exc):
    return _error_response(status.HTTP_403_FORBIDDEN, "forbidden", str(exc))


def _ensure_user_ownership(requested_user_id: int, current_user: dict) -> None:
    if requested_user_id != current_user["id"]:
        raise ForbiddenOperationException("No tienes permiso para operar sobre este usuario.")


@app.exception_handler(CoinGeckoException)
async def coingecko_exception_handler(_, exc):
    return _error_response(
        status.HTTP_502_BAD_GATEWAY,
        "coingecko_unavailable",
        str(exc),
    )


@app.exception_handler(AuthenticationException)
async def authentication_exception_handler(_, exc):
    return _error_response(
        status.HTTP_401_UNAUTHORIZED,
        exc.code,
        str(exc),
        headers={"WWW-Authenticate": "Bearer"},
    )


@app.exception_handler(RateLimitExceededException)
async def rate_limit_exception_handler(_, exc):
    return _error_response(
        status.HTTP_429_TOO_MANY_REQUESTS,
        "rate_limit_exceeded",
        str(exc),
        headers={"Retry-After": str(exc.retry_after)},
    )


# ============================================================
# ROOT
# ============================================================


@app.get(
    "/health/live",
    tags=["system"],
    summary="Comprobar liveness",
    response_model=HealthResponse,
)
def health_live():
    """Indicate that the application process can serve HTTP requests."""
    return {
        "status": "ok",
        "service": "crypto-tracker-api",
    }


@app.get(
    "/health/ready",
    tags=["system"],
    summary="Comprobar readiness",
    response_model=HealthResponse,
    responses={status.HTTP_503_SERVICE_UNAVAILABLE: {"model": HealthResponse}},
)
def health_ready():
    """Check that the application database is reachable."""
    if not check_database():
        return JSONResponse(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            content={
                "status": "not_ready",
                "service": "crypto-tracker-api",
                "checks": {"database": "unavailable"},
            },
        )

    return {
        "status": "ready",
        "service": "crypto-tracker-api",
        "checks": {"database": "ok"},
    }


@app.get(
    "/",
    tags=["system"],
    summary="Comprobar disponibilidad",
    description="Devuelve una respuesta simple para verificar que la API responde.",
)
def root():

    # return {"success": True, "message": "Crypto Tracker API funcionando."}
    return {"success": True, "message": "Hola mundoâ™¥"}


# ============================================================
# COINS
# ============================================================


@app.get(
    "/coins",
    status_code=status.HTTP_200_OK,
    response_model=CoinListResponseEnvelope,
    tags=["coins"],
    summary="Listar monedas locales",
    response_description="Monedas persistidas en la base local.",
)
def get_all_coins(
    controller: CoinController = Depends(get_coin_controller),
):

    return controller.get_all_coins()


@app.post(
    "/coins/sync",
    response_model=CoinListResponseEnvelope,
    tags=["coins"],
    summary="Sincronizar monedas",
    description="Obtiene las monedas principales desde CoinGecko y las persiste localmente.",
    responses={status.HTTP_502_BAD_GATEWAY: {"model": ErrorResponse}},
)
def sync_coins(
    controller: CoinController = Depends(get_coin_controller),
):

    return controller.sync_coins()


@app.get(
    "/coins/{coin_id}",
    status_code=status.HTTP_200_OK,
    response_model=CoinResponseEnvelope,
    tags=["coins"],
    summary="Obtener una moneda local",
    responses={status.HTTP_404_NOT_FOUND: {"model": ErrorResponse}},
)
def get_coin(
    coin_id: str = Path(..., min_length=1, description="ID de la criptomoneda"),
    controller: CoinController = Depends(get_coin_controller),
):

    return controller.get_coin(coin_id)


@app.post(
    "/coins/{coin_id}",
    response_model=CoinResponseEnvelope,
    tags=["coins"],
    summary="Sincronizar una moneda",
    description="Obtiene una moneda concreta desde CoinGecko y actualiza su registro local.",
    responses={status.HTTP_502_BAD_GATEWAY: {"model": ErrorResponse}},
)
def update_coin(
    coin_id: str = Path(
        ..., min_length=1, description="ID de la criptomoneda en CoinGecko"
    ),
    controller: CoinController = Depends(get_coin_controller),
):

    return controller.update_coin(coin_id)


# ============================================================
# FAVORITES
# ============================================================


@app.post(
    "/favorites",
    response_model=FavoriteActionResponse,
    status_code=status.HTTP_201_CREATED,
    tags=["favorites"],
    summary="Agregar un favorito",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "El usuario o la moneda no existe.",
            "model": ErrorResponse,
        },
        status.HTTP_409_CONFLICT: {
            "description": "El favorito ya existe.",
            "model": ErrorResponse,
        },
    },
)
def add_favorite(
    request: FavoriteCreateRequest = Body(...),
    controller: FavoriteController = Depends(get_favorite_controller),
    current_user: dict = Depends(get_current_user),
):
    _ensure_user_ownership(request.user_id, current_user)

    favorite = Favorite(request.user_id, request.coin_id)

    return controller.add_favorite(favorite)


@app.delete(
    "/favorites/{coin_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    tags=["favorites"],
    summary="Eliminar un favorito",
    responses={
        status.HTTP_404_NOT_FOUND: {
            "description": "El favorito no existe.",
            "model": ErrorResponse,
        },
    },
)
def remove_favorite(
    user_id: int,
    coin_id: str,
    controller: FavoriteController = Depends(get_favorite_controller),
    current_user: dict = Depends(get_current_user),
):
    _ensure_user_ownership(user_id, current_user)
    controller.remove_favorite(user_id, coin_id)
    return None


@app.get(
    "/favorites",
    status_code=status.HTTP_200_OK,
    response_model=FavoriteListResponse,
    tags=["favorites"],
    summary="Listar favoritos propios",
)
def get_favorites(
    user_id: int,
    controller: FavoriteController = Depends(get_favorite_controller),
    current_user: dict = Depends(get_current_user),
):
    _ensure_user_ownership(user_id, current_user)

    return controller.get_favorites(user_id)


@app.get(
    "/favorites/details",
    status_code=status.HTTP_200_OK,
    response_model=FavoriteDetailsListResponse,
    tags=["favorites"],
    summary="Listar favoritos con datos de moneda",
)
def get_favorites_with_coin_data(
    user_id: int,
    controller: FavoriteController = Depends(get_favorite_controller),
    current_user: dict = Depends(get_current_user),
):
    _ensure_user_ownership(user_id, current_user)

    return controller.get_favorites_with_coin_data(user_id)


# ============================================================
# USERS
# ============================================================


@app.post(
    "/users/register",
    status_code=status.HTTP_201_CREATED,
    response_model=UserResponse,
    tags=["users"],
    summary="Registrar usuario",
    responses={status.HTTP_409_CONFLICT: {"model": ErrorResponse}},
)
def register_user(
    request: UserRegisterRequest,
    controller: UserController = Depends(get_user_controller),
):
    return controller.register_user(request.username, request.email, request.password)


@app.post(
    "/users/login",
    response_model=TokenResponse,
    tags=["users"],
    summary="Iniciar sesión",
    description="Valida las credenciales y devuelve un access token Bearer.",
    responses={
        status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse},
        status.HTTP_429_TOO_MANY_REQUESTS: {"model": ErrorResponse},
    },
)
def login_user(
    request: UserLoginRequest,
    controller: UserController = Depends(get_user_controller),
    _: None = Depends(get_login_rate_limit),
):
    return {"access_token": controller.login(request.email, request.password), "token_type": "bearer"}


@app.get(
    "/users/me",
    response_model=UserResponse,
    tags=["users"],
    summary="Obtener usuario actual",
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return current_user


# ============================================================
# PRICE HISTORY
# ============================================================


@app.post(
    "/coins/{coin_id}/price",
    response_model=PriceHistoryResponse,
    tags=["price-history"],
    summary="Registrar precio actual",
    description="Obtiene y registra el precio actual de una moneda.",
    responses={status.HTTP_502_BAD_GATEWAY: {"model": ErrorResponse}},
)
def update_coin_price(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda en CoinGecko",
    ),
    controller: PriceHistoryController = Depends(get_price_history_controller),
):
    return controller.update_price(coin_id)


@app.get(
    "/coins/{coin_id}/price-history",
    status_code=status.HTTP_200_OK,
    response_model=list[PriceHistoryResponse],
    tags=["price-history"],
    summary="Consultar historial de precios",
    description="Filtra, ordena y pagina observaciones de precio de una moneda.",
)
def get_price_history(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
    ),
    filters: PriceHistoryQueryParams = Depends(get_price_history_query_params),
    controller: PriceHistoryController = Depends(get_price_history_controller),
):
    return controller.get_price_history(
        coin_id=coin_id,
        start_date=filters.start_date,
        end_date=filters.end_date,
        min_price=filters.min_price,
        max_price=filters.max_price,
        limit=filters.limit,
        offset=filters.offset,
        sort_by=filters.sort_by,
        sort_order=filters.sort_order,
    )


@app.get(
    "/coins/{coin_id}/price-history/statistics",
    status_code=status.HTTP_200_OK,
    response_model=PriceHistoryStatisticsResponse,
    tags=["price-history"],
    summary="Obtener estadísticas de precios",
)
def get_price_statistics(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
    ),
    controller: PriceHistoryController = Depends(get_price_history_controller),
):
    return controller.get_price_statistics(coin_id)


@app.get(
    "/coins/{coin_id}/price-history/variation",
    status_code=status.HTTP_200_OK,
    response_model=PriceHistoryVariationResponse,
    tags=["price-history"],
    summary="Obtener variación de precio",
)
def get_price_variation(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
    ),
    filters: PriceHistoryDateRangeQueryParams = Depends(
        get_price_history_date_range_query_params
    ),
    controller: PriceHistoryController = Depends(get_price_history_controller),
):
    return controller.get_price_variation(
        coin_id=coin_id,
        start_date=filters.start_date,
        end_date=filters.end_date,
    )


@app.get(
    "/coins/{coin_id}/price-history/aggregations",
    status_code=status.HTTP_200_OK,
    response_model=list[PriceHistoryAggregationResponse],
    tags=["price-history"],
    summary="Obtener agregaciones de precios",
    description="Agrupa observaciones por hora, día o semana.",
)
def get_price_aggregations(
    coin_id: str = Path(
        ...,
        min_length=1,
        description="ID de la criptomoneda",
    ),
    filters: PriceHistoryAggregationQueryParams = Depends(
        get_price_history_aggregation_query_params
    ),
    controller: PriceHistoryController = Depends(get_price_history_controller),
):
    return controller.get_price_aggregations(
        coin_id=coin_id,
        period=filters.period,
        start_date=filters.start_date,
        end_date=filters.end_date,
    )

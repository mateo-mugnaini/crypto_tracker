from contextlib import asynccontextmanager

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
from app.models.favorite import Favorite
from app.schemas.error import ErrorResponse
from app.schemas.favorite import FavoriteActionResponse, FavoriteCreateRequest
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

@asynccontextmanager
async def lifespan(application: FastAPI):
    application.state.container = Container()
    yield


app = FastAPI(
    title="Crypto Tracker API",
    description="API para gestionar criptomonedas, favoritos y ver el historial de precios",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


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


@app.get("/")
def root():

    # return {"success": True, "message": "Crypto Tracker API funcionando."}
    return {"success": True, "message": "Hola mundoâ™¥"}


# ============================================================
# COINS
# ============================================================


@app.get("/coins", status_code=status.HTTP_200_OK)
def get_all_coins(
    controller: CoinController = Depends(get_coin_controller),
):

    return controller.get_all_coins()


@app.post("/coins/sync")
def sync_coins(
    controller: CoinController = Depends(get_coin_controller),
):

    return controller.sync_coins()


@app.get("/coins/{coin_id}", status_code=status.HTTP_200_OK)
def get_coin(
    coin_id: str = Path(..., min_length=1, description="ID de la criptomoneda"),
    controller: CoinController = Depends(get_coin_controller),
):

    return controller.get_coin(coin_id)


@app.post("/coins/{coin_id}")
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


@app.get("/favorites", status_code=status.HTTP_200_OK)
def get_favorites(
    user_id: int,
    controller: FavoriteController = Depends(get_favorite_controller),
    current_user: dict = Depends(get_current_user),
):
    _ensure_user_ownership(user_id, current_user)

    return controller.get_favorites(user_id)


@app.get("/favorites/details", status_code=status.HTTP_200_OK)
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
    responses={status.HTTP_401_UNAUTHORIZED: {"model": ErrorResponse}},
)
def login_user(
    request: UserLoginRequest,
    controller: UserController = Depends(get_user_controller),
    _: None = Depends(get_login_rate_limit),
):
    return {"access_token": controller.login(request.email, request.password), "token_type": "bearer"}


@app.get("/users/me", response_model=UserResponse)
def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    return current_user


# ============================================================
# PRICE HISTORY
# ============================================================


@app.post("/coins/{coin_id}/price")
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

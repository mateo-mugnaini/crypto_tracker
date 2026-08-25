from datetime import datetime, timedelta, timezone

import jwt


class TokenService:
    def __init__(self, secret_key: str, algorithm: str = "HS256", expires_minutes: int = 30):
        if not isinstance(secret_key, str) or len(secret_key) < 32:
            raise RuntimeError("JWT_SECRET_KEY debe tener al menos 32 caracteres.")

        if not isinstance(expires_minutes, int) or expires_minutes <= 0:
            raise RuntimeError("JWT_ACCESS_TOKEN_MINUTES debe ser mayor que cero.")

        self.secret_key = secret_key
        self.algorithm = algorithm
        self.expires_minutes = expires_minutes

    def create_access_token(self, user_id: int) -> str:
        now = datetime.now(timezone.utc)
        return jwt.encode(
            {"sub": str(user_id), "iat": now, "exp": now + timedelta(minutes=self.expires_minutes)},
            self.secret_key,
            algorithm=self.algorithm,
        )

    def decode_access_token(self, token: str) -> dict:
        return jwt.decode(token, self.secret_key, algorithms=[self.algorithm])

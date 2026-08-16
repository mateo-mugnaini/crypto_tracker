import base64
import hashlib
import hmac
import secrets


class PasswordHasher:
    def hash(self, password: str) -> str:
        salt = secrets.token_bytes(16)
        derived_key = hashlib.scrypt(
            password.encode("utf-8"),
            salt=salt,
            n=2**14,
            r=8,
            p=1,
        )
        return "scrypt$16384$8$1${}${}".format(
            base64.b64encode(salt).decode("ascii"),
            base64.b64encode(derived_key).decode("ascii"),
        )

    def verify(self, password: str, password_hash: str) -> bool:
        try:
            algorithm, n, r, p, salt, expected = password_hash.split("$")
            if algorithm != "scrypt":
                return False

            derived_key = hashlib.scrypt(
                password.encode("utf-8"),
                salt=base64.b64decode(salt),
                n=int(n),
                r=int(r),
                p=int(p),
            )
            return hmac.compare_digest(
                derived_key,
                base64.b64decode(expected),
            )
        except (TypeError, ValueError):
            return False

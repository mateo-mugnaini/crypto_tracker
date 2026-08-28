import base64
import binascii
import hashlib
import hmac
import secrets


class PasswordHasher:
    _SALT_BYTES = 16
    _KEY_BYTES = 64
    _N = 2**14
    _R = 8
    _P = 1

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

            n_value, r_value, p_value = int(n), int(r), int(p)
            salt_bytes = base64.b64decode(salt, validate=True)
            expected_bytes = base64.b64decode(expected, validate=True)
            if (
                n_value != self._N
                or r_value != self._R
                or p_value != self._P
                or len(salt_bytes) != self._SALT_BYTES
                or len(expected_bytes) != self._KEY_BYTES
            ):
                return False

            derived_key = hashlib.scrypt(
                password.encode("utf-8"),
                salt=salt_bytes,
                n=n_value,
                r=r_value,
                p=p_value,
            )
            return hmac.compare_digest(
                derived_key,
                expected_bytes,
            )
        except (TypeError, ValueError, OverflowError, binascii.Error):
            return False

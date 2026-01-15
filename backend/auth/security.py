from datetime import datetime, timedelta
from jose import jwt
from passlib.context import CryptContext

from backend.core.config import SECRET_KEY, ALGORITHM, ACCESS_TOKEN_EXPIRE_SECONDS

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


# -------------------------------------------------
# PASSWORD HELPERS
# -------------------------------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


# -------------------------------------------------
# JWT TOKEN
# -------------------------------------------------
def create_access_token(data: dict, expires_delta: timedelta | None = None):
    to_encode = data.copy()

    # Use seconds from .env if no expires_delta is provided
    expire = datetime.utcnow() + (
        expires_delta
        if expires_delta
        else timedelta(seconds=ACCESS_TOKEN_EXPIRE_SECONDS)
    )

    to_encode.update({"exp": expire})

    encoded_jwt = jwt.encode(
        to_encode,
        SECRET_KEY,
        algorithm=ALGORITHM,
    )

    return encoded_jwt

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from backend.db import get_db
from backend.models import User
from backend.auth.jwt import get_current_user
from backend.auth.security import hash_password

router = APIRouter(
    prefix="/admin",
    tags=["Admin"]
)

# -------------------------------------------------
# ADMIN CHECK (DB-based)
# -------------------------------------------------
def ensure_admin(
    current_user: dict,
    db: Session,
):
    user = db.query(User).filter(User.id == current_user["id"]).first()

    if not user or not user.is_admin:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access only",
        )

    return user


# -------------------------------------------------
# LIST USERS
# -------------------------------------------------
@router.get("/users")
def list_users(
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user, db)

    users = db.query(User).all()
    return {
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "is_admin": u.is_admin,
            }
            for u in users
        ]
    }


# -------------------------------------------------
# CREATE USER
# -------------------------------------------------
@router.post("/users", status_code=status.HTTP_201_CREATED)
def create_user(
    email: str = Query(...),
    password: str = Query(...),
    is_admin: bool = Query(False),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user, db)

    if db.query(User).filter(User.email == email).first():
        raise HTTPException(status_code=400, detail="User already exists")

    new_user = User(
        email=email,
        hashed_password=hash_password(password),
        is_admin=is_admin,
    )

    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    return {
        "id": new_user.id,
        "email": new_user.email,
        "is_admin": new_user.is_admin,
    }


# -------------------------------------------------
# UPDATE USER
# -------------------------------------------------
@router.put("/users/{user_id}")
def update_user(
    user_id: int,
    email: str | None = Query(None),
    password: str | None = Query(None),
    is_admin: bool | None = Query(None),
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user, db)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if email:
        user.email = email
    if password:
        user.hashed_password = hash_password(password)
    if is_admin is not None:
        user.is_admin = is_admin

    db.commit()
    db.refresh(user)

    return {
        "id": user.id,
        "email": user.email,
        "is_admin": user.is_admin,
    }


# -------------------------------------------------
# DELETE USER
# -------------------------------------------------
@router.delete("/users/{user_id}")
def delete_user(
    user_id: int,
    current_user: dict = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    ensure_admin(current_user, db)

    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(user)
    db.commit()

    return {"message": f"User {user_id} deleted successfully"}

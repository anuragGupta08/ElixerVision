from pydantic import BaseModel, EmailStr
from typing import Optional

# -------------------------------
# Request schemas
# -------------------------------
class UserCreate(BaseModel):
    email: EmailStr
    name: str  
    password: str
    name: str  # New field to store user's name

class UserLogin(BaseModel):
    email: EmailStr
    password: str

# -------------------------------
# Response schemas
# -------------------------------
class UserResponse(BaseModel):
    id: int
    email: str
    name: str 

    class Config:
        orm_mode = True

class TokenResponse(BaseModel):
    access_token: str
    token_type: str
    name: Optional[str] = None  # Include user's name in login response

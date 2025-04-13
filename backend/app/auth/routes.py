from fastapi import APIRouter, HTTPException
from app.auth.schemas import UserLogin

router = APIRouter()

@router.post("/login")
async def login(user: UserLogin):
    if user.email == "test@example.com" and user.password == "12345678":
        return {"token": "dummy_token", "email": user.email}
    else:
        raise HTTPException(status_code=401, detail="Invalid email or password")

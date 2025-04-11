# app/api/v1/endpoints/user.py
from fastapi import APIRouter

router = APIRouter()

@router.get("/")
def read_users():
    return [{"username": "referai"}]

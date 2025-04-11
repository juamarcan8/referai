# app/main.py
from fastapi import FastAPI
from app.api.v1.api import api_router

app = FastAPI(title="Referai API")

app.include_router(api_router)

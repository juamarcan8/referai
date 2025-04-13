# app/main.py
from fastapi import FastAPI
from app.api.v1.api import api_router
from app.auth.routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Referai API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(auth_router)

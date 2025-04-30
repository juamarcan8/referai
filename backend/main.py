from fastapi import FastAPI, File, UploadFile
import os
from app.api.v1.api import api_router
from app.auth.routes import router as auth_router
from app.action.routes import router as action_router
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
app.include_router(action_router)

from fastapi import FastAPI, File, UploadFile
import os
from app.api.v1.api import api_router
from app.auth.routes import router as auth_router
from app.action.routes import router as action_router
from fastapi.middleware.cors import CORSMiddleware
from app.models.predictor import load_models

# Models
FOUL_MODELS = None
SEVERITY_MODELS = None

def lifespan(app: FastAPI):
    """
    Lifespan event to load models when the application starts.
    """
    global FOUL_MODELS, SEVERITY_MODELS

    # STARTUP
    FOUL_MODELS = load_models(os.path.join(os.path.dirname(__file__), "app/models/foul"))
    if len(FOUL_MODELS) != 3:
        raise RuntimeError("3 foul models were expected.")
    SEVERITY_MODELS = load_models(os.path.join(os.path.dirname(__file__), "app/models/severity"))
    if len(SEVERITY_MODELS) != 3:
        raise RuntimeError("3 severity models were expected.")
    print("Models loaded successfully.")

    yield  # This will be executed when the app is running

    # SHUTDOWN
    print("Shutting down...")

app = FastAPI(title="Referai API", lifespan=lifespan)

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
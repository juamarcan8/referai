from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
from app.ml_model.model import load_model, predict_with_model

router = APIRouter()

model = load_model()

class PredictionRequest(BaseModel):
    video_filenames: List[str]

@router.post("/predict")
async def predict(request: PredictionRequest):
    video_paths = [f"videos/{name}" for name in request.video_filenames]
    result = predict_with_model(model, video_paths)
    return result

from fastapi import APIRouter
from pydantic import BaseModel
from typing import List
import os

from app.models.predictor import predict

router = APIRouter()

class PredictRequest(BaseModel):
    video_filenames: List[str]

class SinglePrediction(BaseModel):
    filename: str
    is_foul: bool
    foul_confidence: float
    no_foul_confidence: float
    severity: dict

class PredictResponse(BaseModel):
    results: List[SinglePrediction]

@router.post("/predict", response_model=PredictResponse)
async def predict_endpoint(request: PredictRequest):
    results = []
    for filename in request.video_filenames:
        video_path = os.path.join("videos", filename)
        pred = predict(video_path)
        results.append({
            "filename": filename,
            **pred
        })
    return {"results": results}

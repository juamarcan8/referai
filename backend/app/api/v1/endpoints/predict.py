from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.db.models import Prediction, User, Action, Clip

from app.db.database import get_db
from app.auth.jwt_utils import get_current_user

from app.models.predictor import predict

import os
import tempfile

router = APIRouter()

class PredictRequest(BaseModel):
    video_filenames: List[str]

class SinglePrediction(BaseModel):
    filename: str
    is_foul: bool
    foul_confidence: float
    no_foul_confidence: float
    severity: dict
    foul_model_results: List[dict]
    severity_model_results: List[dict]

class PredictResponse(BaseModel):
    results: List[SinglePrediction]


@router.post("/predict/{action_id}", response_model=PredictResponse)
async def predict_endpoint(action_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    # Verify the action exists and belongs to the current user
    action = db.query(Action).filter(Action.id == action_id, Action.user_id == current_user.id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found or you do not have permission to access it.")

    # Obtains the clips associated with the action
    clips = db.query(Clip).filter(Clip.action_id == action.id).all()
    if not clips:
        raise HTTPException(status_code=404, detail="No clips found for this action.")

    # Creates temporary files for all clips
    video_paths = []
    try:
        for clip in clips:
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
                temp_video.write(clip.content)
                video_paths.append(temp_video.name)
        
        # Prediction call
        prediction_results = predict(video_paths)
        print("Prediction results:", prediction_results)

        # Save prediction to the database
        prediction = Prediction(
            action_id=action.id,
            is_foul=prediction_results["is_foul"],
            foul_confidence=prediction_results["foul_confidence"],
            no_foul_confidence=prediction_results["no_foul_confidence"],
            foul_model_results=prediction_results["foul_model_results"],  # Ensure this is serialized as JSON
            no_card_confidence=prediction_results["severity"]["no_card"],
            red_card_confidence=prediction_results["severity"]["red_card"],
            yellow_card_confidence=prediction_results["severity"]["yellow_card"],
            severity_model_results=prediction_results["severity_model_results"]  # Ensure this is serialized as JSON
        )
        db.add(prediction)
        db.commit()
        db.refresh(prediction)

        results = [{
            "filename": f"clip_{clip.id}.mp4",
            "is_foul": prediction_results["is_foul"],
            "foul_confidence": prediction_results["foul_confidence"],
            "no_foul_confidence": prediction_results["no_foul_confidence"],
            "severity": prediction_results["severity"],
            "foul_model_results": prediction_results["foul_model_results"],
            "severity_model_results": prediction_results["severity_model_results"]
        }]

    finally:
        # Delete temporary files
        for path in video_paths:
            if os.path.exists(path):
                os.remove(path)

    return {"results": results}

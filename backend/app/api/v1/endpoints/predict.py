from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from typing import List
from sqlalchemy.orm import Session
from app.db.models import User, Action, Clip

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

class PredictResponse(BaseModel):
    results: List[SinglePrediction]


@router.post("/predict/{action_id}", response_model=PredictResponse)
async def predict_endpoint(action_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    results = []

    # Verify that the action exists and belongs to the current user
    action = db.query(Action).filter(Action.id == action_id, Action.user_id == current_user.id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found or you do not have permission to access it.")

    # Retrieve the clips associated with the action
    clips = db.query(Clip).filter(Clip.action_id == action.id).all()
    if not clips:
        raise HTTPException(status_code=404, detail="No clips found for this action.")

    # Create temporary files for all clips
    video_paths = []
    try:
        for clip in clips:
            # Create a temporary file for each clip
            with tempfile.NamedTemporaryFile(delete=False, suffix=".mp4") as temp_video:
                temp_video.write(clip.content)  # Write the video content to the temporary file
                video_paths.append(temp_video.name)

        print("Video paths:", video_paths)
        # Pass the list of videos to the prediction model
        predictions = predict(video_paths)

        # Format the results
        for clip, prediction in zip(clips, predictions):
            results.append({
                "filename": f"clip_{clip.id}.mp4",  # You can use a generic name or one based on the ID
                **prediction
            })
    finally:
        # Delete all temporary files after use
        for path in video_paths:
            if os.path.exists(path):
                os.remove(path)

    return {"results": results}

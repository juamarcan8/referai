from fastapi import APIRouter, HTTPException, Depends, UploadFile, File
from typing import List
from sqlalchemy.orm import Session
from app.db.models import Prediction, User, Action, Clip
from app.db.database import get_db
from app.auth.jwt_utils import get_current_user
import base64

router = APIRouter()

@router.post("/upload")
async def upload_clips(
    files: List[UploadFile] = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate the number of files
    if len(files) < 2 or len(files) > 4:
        raise HTTPException(
            status_code=400,
            detail="An action must have between 2 and 4 clips."
        )

    # 1. Deletes existing actions from the user
    previous_actions = db.query(Action).filter(Action.user_id == current_user.id).all()
    for action in previous_actions:
        db.query(Prediction).filter(Prediction.action_id == action.id).delete()
        db.query(Clip).filter(Clip.action_id == action.id).delete()
    db.query(Action).filter(Action.user_id == current_user.id).delete()
    db.commit()

    # 2. Creates a new action and associates clips with it
    action = Action(user_id=current_user.id)
    db.add(action)
    db.commit()
    db.refresh(action)

    for file in files:
        content = await file.read()
        clip = Clip(
            action_id=action.id,
            content=content
        )
        db.add(clip)

    db.commit()
    return {"message": "Clips uploaded", "action_id": action.id}

@router.get("/action/last")
def get_last_action(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    print(f"Current user: {current_user.email}")  # Agrega un registro para verificar el usuario
    action = db.query(Action).filter(Action.user_id == current_user.id).order_by(Action.created_at.desc()).first()
    if not action:
        raise HTTPException(status_code=404, detail="No actions found for this user.")

    clips = db.query(Clip).filter(Clip.action_id == action.id).all()
    return {
        "action_id": action.id,
        "clips": [
            {
                "id": clip.id,
                "content": base64.b64encode(clip.content).decode('utf-8')
            }
            for clip in clips
        ]
    }

@router.get("/action/{action_id}")
def get_action_clips(action_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    action = db.query(Action).filter(Action.id == action_id, Action.user_id == current_user.id).first()
    if not action:
        raise HTTPException(status_code=404, detail="Action not found or you do not have permission to access it.")

    clips = db.query(Clip).filter(Clip.action_id == action.id).all()
    
    return {
        "action_id": action.id,
        "clips": [
            {
                "id": clip.id,
                "content": base64.b64encode(clip.content).decode('utf-8')
            }
            for clip in clips
        ]
    }
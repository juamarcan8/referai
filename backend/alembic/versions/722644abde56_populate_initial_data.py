"""Populate initial data

Revision ID: 722644abde56
Revises: 7e0b4d682552
Create Date: 2025-05-12 18:53:39.500672

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.orm import Session
from app.db.models import User, Action, Clip, Prediction
from passlib.context import CryptContext
import os


# revision identifiers, used by Alembic.
revision: str = '722644abde56'
down_revision: Union[str, None] = '7e0b4d682552'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def upgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    # Creates user
    hashed_password = pwd_context.hash("AdminPassw0rd")
    user = User(email="admin@admin.com", password=hashed_password)
    session.add(user)
    session.flush()

    # Creates action
    # Note: The action is created with the user_id of the user created above
    action = Action(user_id=user.id)
    session.add(action)
    session.flush()

    # Creates clip 1
    current_dir = os.path.dirname(__file__)
    asset_path_1 = os.path.join(current_dir, "videos", "clip_0.mp4")
    with open(asset_path_1, "rb") as f:
        clip_1_data = f.read()
    clip_1 = Clip(action_id=action.id, content=clip_1_data)
    session.add(clip_1)

    # Create clip 2
    asset_path_2 = os.path.join(current_dir, "videos", "clip_1.mp4")
    with open(asset_path_2, "rb") as f:
        clip_2_data = f.read()
    clip_2 = Clip(action_id=action.id, content=clip_2_data)
    session.add(clip_2)

    # Creates prediction
    # Note: The prediction is created with the action_id of the action created above
    prediction = Prediction(
    action_id=action.id,
    is_foul=True,
    foul_confidence=66.67,
    no_foul_confidence=33.33,
    foul_model_results=[
        {"model": "Foul Model 1", "prediction": 1},
        {"model": "Foul Model 2", "prediction": 1},
        {"model": "Foul Model 3", "prediction": 0}
    ],
    no_card_confidence=0.0,
    red_card_confidence=33.33,
    yellow_card_confidence=66.67,
    severity_model_results=[
        {"model": "Severity Model 1", "prediction": 2},
        {"model": "Severity Model 2", "prediction": 2},
        {"model": "Severity Model 3", "prediction": 1}
    ]
    )
    session.add(prediction)

    session.commit()


def downgrade():
    bind = op.get_bind()
    session = Session(bind=bind)

    session.query(Prediction).delete()
    session.query(Clip).delete()
    session.query(Action).delete()
    session.query(User).delete()

    session.commit()




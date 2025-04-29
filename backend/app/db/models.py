from typing import List
from sqlalchemy import ForeignKey, String, Enum, DateTime, func, Float, LargeBinary
import enum
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship

Base = declarative_base()

class FoulPrediction(enum.Enum):
    NO_FOUL = 0
    FOUL = 1

class SeverityPrediction(enum.Enum):
    NO_CARD = 0
    RED_CARD = 1
    YELLOW_CARD = 2

class User(Base):
    __tablename__ = "user_account"
    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password: Mapped[str] = mapped_column(String(255), nullable=False)
    actions: Mapped[List["Action"]] = relationship(
        back_populates="user", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"User(id={self.id!r}, email={self.email!r})"
    
class Action(Base):
    __tablename__ = "action"
    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("user_account.id"))
    user: Mapped["User"] = relationship(back_populates="actions")
    created_at: Mapped[DateTime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
    clips: Mapped[List["Clip"]] = relationship(
        back_populates="action", cascade="all, delete-orphan"
    )

    def __repr__(self) -> str:
        return f"Action(id={self.id!r})"
    
class Clip(Base):
    __tablename__ = "clip"
    id: Mapped[int] = mapped_column(primary_key=True)
    action_id: Mapped[int] = mapped_column(ForeignKey("action.id"))
    action: Mapped["Action"] = relationship(back_populates="clips")
    content: Mapped[bytes] = mapped_column(LargeBinary, nullable=False)

    def __repr__(self) -> str:
        return f"Clip(id={self.id!r}, action_id={self.action_id!r})"
    
class Prediction(Base):
    __tablename__ = "prediction"
    id: Mapped[int] = mapped_column(primary_key=True)
    action_id: Mapped[int] = mapped_column(ForeignKey("action.id"))
    action: Mapped["Action"] = relationship()

    is_foul: Mapped[FoulPrediction] = mapped_column(Enum(FoulPrediction), nullable=False)
    foul_prediction: Mapped[float] = mapped_column(Float, nullable=False)
    
    severity: Mapped[SeverityPrediction] = mapped_column(Enum(SeverityPrediction), nullable=False)
    no_card_confidence: Mapped[float] = mapped_column(Float, nullable=False)
    red_card_confidence: Mapped[float] = mapped_column(Float, nullable=False)
    yellow_card_confidence: Mapped[float] = mapped_column(Float, nullable=False)

    def __repr__(self) -> str:
        return f"Prediction(id={self.id!r}, action_id={self.action_id!r}, is_foul={self.is_foul!r}, severity={self.severity!r})"
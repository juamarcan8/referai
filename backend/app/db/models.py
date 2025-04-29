from typing import List
from sqlalchemy import ForeignKey, String
from sqlalchemy.orm import declarative_base, Mapped, mapped_column, relationship

Base = declarative_base()

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
    filename: Mapped[str] = mapped_column(nullable=False)

    def __repr__(self) -> str:
        return f"Clip(id={self.id!r}, filename={self.filename!r})"
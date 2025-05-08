from pydantic import BaseModel, EmailStr, Field, field_validator, model_validator
import re

class UserLogin(BaseModel):
    email: EmailStr
    password: str = Field(
        ...,
        description="User's password"
    )

    @field_validator("password")
    @classmethod
    def password_length(cls, password: str) -> str:
        if len(password) < 8:
            raise ValueError("Password must be at least 8 characters long")
        return password

class UserRegister(BaseModel):
    email: EmailStr
    password: str = Field(..., description="User's password")
    confirm_password: str = Field(..., description="Confirm user's password")

    @field_validator("password")
    @classmethod
    def password_strength(cls, v: str) -> str:
        # 1.1) min length
        if len(v) < 8:
            raise ValueError("Password must be at least 8 characters long")
        # 1.2) max length
        if len(v) > 30:
            raise ValueError("Password must be at most 30 characters long")
        # 2) uppercase
        if not re.search(r"[A-Z]", v):
            raise ValueError("Password must include at least one uppercase letter")
        # 3) lowercase
        if not re.search(r"[a-z]", v):
            raise ValueError("Password must include at least one lowercase letter")
        # 4) number
        if not re.search(r"\d", v):
            raise ValueError("Password must include at least one number")
        return v

    @field_validator("confirm_password")
    @classmethod
    def confirm_length(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Confirm password must be at least 8 characters long")
        return v

    @model_validator(mode="after")
    def passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self
import pytest
from datetime import timedelta
from jose import jwt
from app.auth.jwt_utils import create_access_token, verify_token, get_current_user, SECRET_KEY, ALGORITHM
from app.db.models import User
from fastapi import HTTPException
from sqlalchemy.orm import Session
from unittest.mock import MagicMock
from time import sleep

def test_create_access_token_contains_expected_fields():
    email = "test@example.com"
    token = create_access_token({"sub": email})
    payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    assert payload["sub"] == email
    assert "exp" in payload

def test_verify_token_valid_token():
    email = "test@example.com"
    token = create_access_token({"sub": email})
    payload = verify_token(token)
    assert payload["sub"] == email

def test_verify_token_invalid_token():
    # Token firmado con clave distinta
    invalid_token = jwt.encode({"sub": "user"}, "wrong-secret", algorithm=ALGORITHM)
    assert verify_token(invalid_token) is None

def test_verify_token_expired():
    email = "expired@example.com"
    token = create_access_token({"sub": email}, expires_delta=timedelta(seconds=-1))
    assert verify_token(token) is None

def test_get_current_user_valid(monkeypatch):
    email = "authuser@example.com"
    token = create_access_token({"sub": email})
    auth_header = f"Bearer {token}"

    # Mock DB Session and query
    fake_user = User()
    fake_user.id = 1
    fake_user.email = email

    db_mock = MagicMock(spec=Session)
    db_mock.query().filter().first.return_value = fake_user

    user = get_current_user(authorization=auth_header, db=db_mock)
    assert user.email == email

def test_get_current_user_invalid_token():
    auth_header = "Bearer invalid.token.value"
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(authorization=auth_header, db=MagicMock())
    assert exc_info.value.status_code == 401

def test_get_current_user_user_not_found(monkeypatch):
    email = "missing@example.com"
    token = create_access_token({"sub": email})
    auth_header = f"Bearer {token}"

    db_mock = MagicMock(spec=Session)
    db_mock.query().filter().first.return_value = None

    with pytest.raises(HTTPException) as exc_info:
        get_current_user(authorization=auth_header, db=db_mock)
    assert exc_info.value.status_code == 404

def test_get_current_user_no_bearer_prefix():
    auth_header = "Token abc.def.ghi"
    with pytest.raises(HTTPException) as exc_info:
        get_current_user(authorization=auth_header, db=MagicMock())
    assert exc_info.value.status_code == 401

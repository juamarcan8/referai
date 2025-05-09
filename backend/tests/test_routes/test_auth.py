import pytest
from app.db.models import User
from passlib.context import CryptContext
import uuid

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@pytest.mark.asyncio
async def test_register_success(client):
    unique_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    password = "Str0ngPass123"
    payload = {
        "email": unique_email,
        "password": password,
        "confirm_password": password
    }

    response = await client.post("/register", json=payload)

    print("STATUS:", response.status_code)
    print("BODY:", response.json())

    assert response.status_code == 200
    assert response.json()["message"] == "User registered successfully."

@pytest.mark.asyncio
async def test_register_weak_password(client):
    unique_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    payload = {
        "email": unique_email,
        "password": "short", 
        "confirm_password": "short"
    }

    response = await client.post("/register", json=payload) 
    assert response.status_code == 422
    assert "Password must be at least 8 characters long" in str(response.json())


@pytest.mark.asyncio
async def test_register_password_mismatch(client):
    unique_email = f"test_{uuid.uuid4().hex[:6]}@example.com"
    payload = {
        "email": unique_email,
        "password": "Str0ngPass123",
        "confirm_password": "OtherPass123"
    }

    response = await client.post("/register", json=payload)
    assert response.status_code == 422
    assert "Passwords do not match" in str(response.json())


@pytest.mark.asyncio
async def test_login_success(client):
    email = f"login_{uuid.uuid4().hex[:6]}@example.com"
    password = "Valid123Pass"

    # First, register the user
    response = await client.post("/register", json={
        "email": email,
        "password": password,
        "confirm_password": password
    })
    assert response.status_code == 200

    # Then, attempt to log in
    response = await client.post(
        "/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_login_wrong_password(client):
    email = f"wrongpass_{uuid.uuid4().hex[:6]}@example.com"
    password = "Correct123"
    wrong_password = "Wrong123"

    # Register the user first
    response = await client.post("/register", json={
        "email": email,
        "password": password,
        "confirm_password": password
    })
    assert response.status_code == 200

    # Try to log in with the wrong password
    response = await client.post(
        "/login",
        data={"username": email, "password": wrong_password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"

@pytest.mark.asyncio
async def test_login_nonexistent_user(client):
    response = await client.post(
        "/login",
        data={"username": "nonexistent@example.com", "password": "AnyPassword123"},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"
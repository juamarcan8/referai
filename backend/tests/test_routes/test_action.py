import pytest
import base64
import uuid

def create_fake_clip_bytes(i: int):
    return f"clip-content-{i}".encode("utf-8")

@pytest.mark.asyncio
async def test_upload_and_retrieve_action(client):
    # 1. Register and login to retrieve token
    email = f"action_{uuid.uuid4().hex[:6]}@example.com"
    password = "TestPass123"
    await client.post("/register", json={
        "email": email,
        "password": password,
        "confirm_password": password
    })
    login_resp = await client.post(
        "/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # 2. Load valid clips
    files = [
        ("files", ("clip1.mp4", create_fake_clip_bytes(1), "video/mp4")),
        ("files", ("clip2.mp4", create_fake_clip_bytes(2), "video/mp4")),
        ("files", ("clip3.mp4", create_fake_clip_bytes(3), "video/mp4")),
    ]
    upload_resp = await client.post("/upload", headers=headers, files=files)
    assert upload_resp.status_code == 200
    assert "action_id" in upload_resp.json()

    action_id = upload_resp.json()["action_id"]

    # 3. Gets the last action
    last_resp = await client.get("/action/last", headers=headers)
    assert last_resp.status_code == 200
    assert last_resp.json()["action_id"] == action_id
    assert len(last_resp.json()["clips"]) == 3
    for clip in last_resp.json()["clips"]:
        decoded = base64.b64decode(clip["content"])
        assert decoded.startswith(b"clip-content-")

    # 4. Gets the action by ID
    get_resp = await client.get(f"/action/{action_id}", headers=headers)
    assert get_resp.status_code == 200
    assert get_resp.json()["action_id"] == action_id
    assert len(get_resp.json()["clips"]) == 3

@pytest.mark.asyncio
async def test_upload_invalid_clip_count(client):
    email = f"invalidclip_{uuid.uuid4().hex[:6]}@example.com"
    password = "TestPass123"
    await client.post("/register", json={
        "email": email,
        "password": password,
        "confirm_password": password
    })
    login_resp = await client.post(
        "/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    # Only one clip (invalid)
    files = [
        ("files", ("clip1.mp4", create_fake_clip_bytes(1), "video/mp4")),
    ]
    upload_resp = await client.post("/upload", headers=headers, files=files)
    assert upload_resp.status_code == 400
    assert upload_resp.json()["detail"] == "An action must have between 2 and 4 clips."

@pytest.mark.asyncio
async def test_get_action_not_found(client):
    email = f"notfound_{uuid.uuid4().hex[:6]}@example.com"
    password = "TestPass123"
    await client.post("/register", json={
        "email": email,
        "password": password,
        "confirm_password": password
    })
    login_resp = await client.post(
        "/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.get("/action/9999", headers=headers)
    assert resp.status_code == 404
    assert "not found" in resp.json()["detail"].lower()

@pytest.mark.asyncio
async def test_get_last_action_empty(client):
    email = f"emptylast_{uuid.uuid4().hex[:6]}@example.com"
    password = "TestPass123"
    await client.post("/register", json={
        "email": email,
        "password": password,
        "confirm_password": password
    })
    login_resp = await client.post(
        "/login",
        data={"username": email, "password": password},
        headers={"Content-Type": "application/x-www-form-urlencoded"}
    )
    token = login_resp.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}

    resp = await client.get("/action/last", headers=headers)
    assert resp.status_code == 404
    assert resp.json()["detail"] == "No actions found for this user."
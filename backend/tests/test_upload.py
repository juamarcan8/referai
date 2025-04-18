from fastapi.testclient import TestClient
from main import app
import io
import os

client = TestClient(app)

def test_upload_file():
    # Simulated file (mock)
    test_file_content = b"fake video content"
    test_filename = "test_video.mp4"
    test_file = io.BytesIO(test_file_content)

    # POST to /upload
    response = client.post(
        "/upload",
        files={"file": (test_filename, test_file, "video/mp4")}
    )

    # Check response
    assert response.status_code == 200
    data = response.json()
    assert data["message"] == "Upload successful"
    assert data["filename"] == test_filename

    # Check file was saved
    saved_path = f"backend/videos/{test_filename}"
    assert os.path.exists(saved_path)

    with open(saved_path, "rb") as f:
        saved_content = f.read()
    assert saved_content == test_file_content

    # Cleanup
    os.remove(saved_path)

def test_upload_without_file():
    response = client.post("/upload")
    assert response.status_code == 422

def test_upload_large_file():
    large_content = b"x" * (10 * 1024 * 1024)  # 10MB
    test_file = io.BytesIO(large_content)
    filename = "large_test_video.mp4"

    response = client.post(
        "/upload",
        files={"file": (filename, test_file, "video/mp4")}
    )

    assert response.status_code == 200
    assert response.json()["filename"] == filename
    os.remove(f"backend/videos/{filename}")

def test_upload_overwrite_file():
    filename = "overwrite.mp4"
    path = f"backend/videos/{filename}"

    # Guardar un primer archivo
    with open(path, "wb") as f:
        f.write(b"original content")

    # Subir uno nuevo con el mismo nombre
    new_file = io.BytesIO(b"new content")
    response = client.post(
        "/upload",
        files={"file": (filename, new_file, "video/mp4")}
    )

    assert response.status_code == 200

    # Comprobar que el archivo se sobrescribió
    with open(path, "rb") as f:
        assert f.read() == b"new content"

    os.remove(path)

# app/main.py
from fastapi import FastAPI, File, UploadFile
import os
from app.api.v1.api import api_router
from app.auth.routes import router as auth_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(title="Referai API")

# CORS setup
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router)
app.include_router(auth_router)

@app.post("/upload")
async def upload_file(file: UploadFile = File(...)):
    contents = await file.read()
    print(f"Received file: {file.filename}, size: {len(contents)} bytes")

    os.makedirs("backend/videos", exist_ok=True)

    file_path = os.path.join("backend/videos", file.filename)
    with open(file_path, "wb") as f:
        f.write(contents)

    return {"message": "Upload successful", "filename": file.filename}

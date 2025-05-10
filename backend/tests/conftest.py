import pytest 
from httpx import AsyncClient
from httpx import ASGITransport
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy_utils import create_database, database_exists, drop_database
import pytest_asyncio 

from app.db.database import get_db
from app.db.models import Base

import os
os.environ["ENV"] = "test"

from main import app

TEST_DATABASE_URL = "sqlite:///./tests/test.db"

engine = create_engine(TEST_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Create the database and tables
@pytest.fixture(scope="session", autouse=True)
def setup_database():
    # Create the database if it doesn't exist
    if database_exists(TEST_DATABASE_URL):
        drop_database(TEST_DATABASE_URL)
    else:
        create_database(TEST_DATABASE_URL)
    Base.metadata.create_all(bind=engine)

    yield  # execute tests

@pytest.fixture()
def db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()

@pytest_asyncio.fixture()
async def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            db.close()

    app.dependency_overrides[get_db] = override_get_db

    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        yield ac
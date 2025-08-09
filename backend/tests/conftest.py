import pytest
import pytest_asyncio
from fastapi.testclient import TestClient
from sqlalchemy.ext.asyncio import AsyncSession, create_async_engine
from testcontainers.postgres import PostgresContainer

from trip_packer.app import app
from trip_packer.database import get_session
from trip_packer.models import table_registry
from trip_packer.settings import Settings


@pytest.fixture
def client(session):
    def get_session_override():
        return session

    with TestClient(app) as client:
        app.dependency_overrides[get_session] = get_session_override
        yield client

    app.dependency_overrides.clear()


@pytest.fixture(scope="session")
def engine():
    # Caso do windows + Docker no CI
    import sys  # noqa: PLC0415

    if sys.platform == "win32":
        yield create_async_engine(Settings().DATABASE_URL)

    else:
        with PostgresContainer("postgres:16", driver="psycopg") as postgres:
            _engine = create_async_engine(postgres.get_connection_url())
            yield _engine


@pytest_asyncio.fixture
async def session(engine):
    async with engine.begin() as conn:
        await conn.run_sync(table_registry.metadata.create_all)

    async with AsyncSession(engine, expire_on_commit=False) as session:
        yield session

    async with engine.begin() as conn:
        await conn.run_sync(table_registry.metadata.drop_all)

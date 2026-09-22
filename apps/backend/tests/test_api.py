"""
Sahm Backend — Test Configuration
"""
import asyncio
import pytest
import pytest_asyncio
from httpx import AsyncClient, ASGITransport

from unittest.mock import AsyncMock, MagicMock
from app.core.database import get_db
from app.main import app


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.new_event_loop()
    yield loop
    loop.close()


@pytest_asyncio.fixture
async def client():
    """Async test client for the FastAPI app with mocked DB dependency."""
    mock_db = AsyncMock()
    mock_result = MagicMock()
    mock_result.scalar_one_or_none.return_value = None
    mock_db.execute.return_value = mock_result

    async def override_get_db():
        yield mock_db

    app.dependency_overrides[get_db] = override_get_db
    try:
        async with AsyncClient(
            transport=ASGITransport(app=app),
            base_url="http://test",
        ) as ac:
            yield ac
    finally:
        app.dependency_overrides.pop(get_db, None)



class TestHealth:
    """Test health check endpoints."""

    @pytest.mark.asyncio
    async def test_root(self, client: AsyncClient):
        response = await client.get("/")
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Sahm API"
        assert data["status"] == "running"

    @pytest.mark.asyncio
    async def test_health(self, client: AsyncClient):
        response = await client.get("/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        assert "subsystems" in data

    @pytest.mark.asyncio
    async def test_liveness(self, client: AsyncClient):
        response = await client.get("/liveness")
        assert response.status_code == 200
        assert response.json()["status"] == "alive"

    @pytest.mark.asyncio
    async def test_readiness(self, client: AsyncClient):
        response = await client.get("/readiness")
        assert response.status_code == 200
        assert response.json()["status"] == "ready"

    @pytest.mark.asyncio
    async def test_correlation_headers(self, client: AsyncClient):
        response = await client.get(
            "/health",
            headers={"X-Request-ID": "test-req-123", "X-Correlation-ID": "test-corr-456"}
        )
        assert response.headers.get("X-Request-ID") == "test-req-123"
        assert response.headers.get("X-Correlation-ID") == "test-corr-456"
        assert "X-Response-Time-Ms" in response.headers


    @pytest.mark.asyncio
    async def test_docs(self, client: AsyncClient):
        response = await client.get("/docs")
        assert response.status_code == 200


class TestAuth:
    """Test authentication endpoints."""

    @pytest.mark.asyncio
    async def test_login_invalid(self, client: AsyncClient):
        response = await client.post(
            "/api/v1/auth/login",
            data={"username": "fake@test.com", "password": "wrong"},
        )
        assert response.status_code == 401

    @pytest.mark.asyncio
    async def test_me_unauthenticated(self, client: AsyncClient):
        response = await client.get("/api/v1/auth/me")
        assert response.status_code == 401

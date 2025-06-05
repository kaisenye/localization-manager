import pytest
from httpx import AsyncClient
from src.localization_management_api.main import app
from src.localization_management_api.models import CreateProjectRequest, CreateTranslationKeyRequest
from datetime import datetime

@pytest.fixture
async def client():
    async with AsyncClient(app=app, base_url="http://test") as ac:
        yield ac

# Test data
TEST_PROJECT = {
    "name": "Test Project",
    "description": "A test project for API testing",
    "default_language": "en",
    "supported_languages": ["en", "es", "fr"]
}

TEST_TRANSLATION_KEY = {
    "key": "test.welcome",
    "description": "Welcome message",
    "category": "general",
    "translations": {
        "en": "Welcome to our app!",
        "es": "¡Bienvenido a nuestra aplicación!",
        "fr": "Bienvenue dans notre application!"
    }
}

@pytest.fixture
async def test_project_id(client):
    # Create a test project and return its ID
    response = await client.post("/projects", json=TEST_PROJECT)
    assert response.status_code == 200
    return response.json()["id"]

@pytest.mark.asyncio
async def test_health_check(client):
    response = await client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "healthy", "service": "localization-management-api"}

@pytest.mark.asyncio
async def test_create_project(client):
    response = await client.post("/projects", json=TEST_PROJECT)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == TEST_PROJECT["name"]
    assert data["default_language"] == TEST_PROJECT["default_language"]
    assert set(data["supported_languages"]) == set(TEST_PROJECT["supported_languages"])

@pytest.mark.asyncio
async def test_get_project(client, test_project_id):
    response = await client.get(f"/projects/{test_project_id}")
    assert response.status_code == 200
    data = response.json()
    assert data["id"] == test_project_id
    assert data["name"] == TEST_PROJECT["name"]

@pytest.mark.asyncio
async def test_update_project(client, test_project_id):
    update_data = {
        "name": "Updated Test Project",
        "description": "Updated description"
    }
    response = await client.put(f"/projects/{test_project_id}", json=update_data)
    assert response.status_code == 200
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["description"] == update_data["description"]

@pytest.mark.asyncio
async def test_create_translation_key(client, test_project_id):
    response = await client.post(
        f"/projects/{test_project_id}/translation-keys",
        json=TEST_TRANSLATION_KEY
    )
    assert response.status_code == 200
    data = response.json()
    assert data["key"] == TEST_TRANSLATION_KEY["key"]
    assert data["translations"] == TEST_TRANSLATION_KEY["translations"]

@pytest.mark.asyncio
async def test_get_translation_keys(client, test_project_id):
    # First create a translation key
    await client.post(
        f"/projects/{test_project_id}/translation-keys",
        json=TEST_TRANSLATION_KEY
    )
    
    # Test getting all translation keys
    response = await client.get("/translation-keys", params={"project_id": test_project_id})
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(key["key"] == TEST_TRANSLATION_KEY["key"] for key in data)

@pytest.mark.asyncio
async def test_get_localizations(client, test_project_id):
    # First create a translation key
    await client.post(
        f"/projects/{test_project_id}/translation-keys",
        json=TEST_TRANSLATION_KEY
    )
    
    # Test getting localizations for a specific locale
    response = await client.get(f"/localizations/{test_project_id}/en")
    assert response.status_code == 200
    data = response.json()
    assert "translations" in data
    assert TEST_TRANSLATION_KEY["key"] in data["translations"]
    assert data["translations"][TEST_TRANSLATION_KEY["key"]] == TEST_TRANSLATION_KEY["translations"]["en"]

@pytest.mark.asyncio
async def test_get_project_stats(client, test_project_id):
    # First create a translation key
    await client.post(
        f"/projects/{test_project_id}/translation-keys",
        json=TEST_TRANSLATION_KEY
    )
    
    response = await client.get(f"/projects/{test_project_id}/stats")
    assert response.status_code == 200
    data = response.json()
    assert "total_keys" in data
    assert "languages" in data
    assert "completion_percentage" in data
    assert data["total_keys"] > 0

@pytest.mark.asyncio
async def test_delete_project(client, test_project_id):
    response = await client.delete(f"/projects/{test_project_id}")
    assert response.status_code == 200
    assert response.json()["message"] == "Project deleted successfully"
    
    # Verify project is deleted
    response = await client.get(f"/projects/{test_project_id}")
    assert response.status_code == 404 
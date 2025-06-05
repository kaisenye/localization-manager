import pytest
import asyncio
import time
from src.localization_management_api.database import db_service
from src.localization_management_api.models import CreateProjectRequest, CreateTranslationKeyRequest

# Test data
SAMPLE_PROJECTS = [
    {
        "name": f"Performance Test Project {i}",
        "description": f"Project for performance testing {i}",
        "default_language": "en",
        "supported_languages": ["en", "es", "fr", "de", "it"]
    }
    for i in range(5)
]

SAMPLE_TRANSLATION_KEYS = [
    {
        "key": f"test.key.{i}",
        "description": f"Test key {i}",
        "category": "test",
        "translations": {
            "en": f"English translation {i}",
            "es": f"Spanish translation {i}",
            "fr": f"French translation {i}",
            "de": f"German translation {i}",
            "it": f"Italian translation {i}"
        }
    }
    for i in range(100)
]

@pytest.fixture
async def setup_test_data():
    # Create test projects
    project_ids = []
    for project_data in SAMPLE_PROJECTS:
        project = await db_service.create_project(
            CreateProjectRequest(**project_data),
            "test-user"
        )
        project_ids.append(project.id)
    
    # Create translation keys for each project
    for project_id in project_ids:
        for key_data in SAMPLE_TRANSLATION_KEYS:
            try:
                await db_service.create_translation_key(
                    project_id,
                    CreateTranslationKeyRequest(**key_data),
                    "test-user"
                )
            except Exception as e:
                if "duplicate key value" not in str(e):
                    raise e
    
    return project_ids

@pytest.mark.asyncio
async def test_project_creation_performance():
    """Test the performance of creating multiple projects"""
    start_time = time.time()
    
    for project_data in SAMPLE_PROJECTS:
        await db_service.create_project(
            CreateProjectRequest(**project_data),
            "test-user"
        )
    
    end_time = time.time()
    total_time = end_time - start_time
    avg_time = total_time / len(SAMPLE_PROJECTS)
    
    print(f"\nProject Creation Performance:")
    print(f"Total time for {len(SAMPLE_PROJECTS)} projects: {total_time:.2f}s")
    print(f"Average time per project: {avg_time:.2f}s")
    
    assert avg_time < 1.0  # Should take less than 1 second per project

@pytest.mark.asyncio
async def test_translation_key_creation_performance(setup_test_data):
    """Test the performance of creating multiple translation keys"""
    project_ids = await setup_test_data
    project_id = project_ids[0]
    start_time = time.time()
    
    for key_data in SAMPLE_TRANSLATION_KEYS:
        try:
            await db_service.create_translation_key(
                project_id,
                CreateTranslationKeyRequest(**key_data),
                "test-user"
            )
        except Exception as e:
            if "duplicate key value" not in str(e):
                raise e
    
    end_time = time.time()
    total_time = end_time - start_time
    avg_time = total_time / len(SAMPLE_TRANSLATION_KEYS)
    
    print(f"\nTranslation Key Creation Performance:")
    print(f"Total time for {len(SAMPLE_TRANSLATION_KEYS)} keys: {total_time:.2f}s")
    print(f"Average time per key: {avg_time:.2f}s")
    
    assert avg_time < 0.1  # Should take less than 100ms per key

@pytest.mark.asyncio
async def test_bulk_translation_retrieval_performance(setup_test_data):
    """Test the performance of retrieving translations in bulk"""
    project_ids = await setup_test_data
    project_id = project_ids[0]
    start_time = time.time()
    
    # Test retrieving translations for all supported languages
    keys = await db_service.get_translation_keys(project_id)
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print(f"\nBulk Translation Retrieval Performance:")
    print(f"Time to retrieve all translations: {total_time:.2f}s")
    
    assert total_time < 2.0  # Should take less than 2 seconds for bulk retrieval

@pytest.mark.asyncio
async def test_translation_search_performance(setup_test_data):
    """Test the performance of searching translations"""
    project_ids = await setup_test_data
    project_id = project_ids[0]
    search_term = "test"
    
    start_time = time.time()
    
    # Test searching translations
    keys = await db_service.get_translation_keys(project_id)
    matching_keys = [k for k in keys if search_term in k.key]
    
    end_time = time.time()
    total_time = end_time - start_time
    
    print(f"\nTranslation Search Performance:")
    print(f"Time to search {len(keys)} translations: {total_time:.2f}s")
    print(f"Found {len(matching_keys)} matching keys")
    
    assert total_time < 1.0  # Should take less than 1 second for search

@pytest.mark.asyncio
async def test_concurrent_operations_performance(setup_test_data):
    """Test the performance of concurrent operations"""
    project_ids = await setup_test_data
    project_id = project_ids[0]
    
    async def concurrent_operation():
        # Simulate multiple concurrent operations
        tasks = [
            db_service.get_translation_keys(project_id),
            db_service.get_translation_keys(project_id),  # Duplicate for testing
            db_service.get_translation_keys(project_id)   # Duplicate for testing
        ]
        return await asyncio.gather(*tasks)
    
    start_time = time.time()
    results = await concurrent_operation()
    end_time = time.time()
    total_time = end_time - start_time
    
    print(f"\nConcurrent Operations Performance:")
    print(f"Time for 3 concurrent operations: {total_time:.2f}s")
    
    assert total_time < 2.0  # Should take less than 2 seconds for concurrent operations 
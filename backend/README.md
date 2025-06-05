# Localization Management API

This is a FastAPI application to manage localizations.

## Setup

1.  Create a virtual environment (optional but recommended):
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

2.  Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

## Running the server

```bash
uvicorn src.localization_management_api.main:app --reload
```

The API will be available at `http://127.0.0.1:8000`.

### Example Usage

To get localizations for a project, you can access:
`http://127.0.0.1:8000/localizations/your_project_id/en_US`

## Testing

### Setup
```bash
# Install test dependencies
pip install pytest pytest-asyncio httpx

# Run all tests
pytest tests/

# Run specific test files
pytest tests/test_api.py      # API endpoint tests
pytest tests/test_database.py # Database performance tests
```

### Test Coverage

1. **API Tests** (`test_api.py`)
   - Endpoint functionality validation
   - CRUD operations for projects and translations
   - Error handling and edge cases
   - Response format validation

2. **Database Tests** (`test_database.py`)
   - Performance benchmarks
   - Bulk operations
   - Concurrent request handling
   - Search functionality

### Performance Benchmarks
- Project creation: < 1s per project
- Translation key creation: < 100ms per key
- Bulk retrieval: < 2s
- Search operations: < 1s
- Concurrent operations: < 2s

### Test Data
Tests use sample data:
- 5 test projects
- 100 translation keys per project
- 5 languages (en, es, fr, de, it)

from typing import List, Optional
from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from dotenv import load_dotenv

from .models import (
    Project, TranslationKey, CreateProjectRequest, UpdateProjectRequest,
    CreateTranslationKeyRequest, UpdateTranslationRequest,
    LocalizationResponse, LocalizationBatchResponse
)
from .database import db_service

# Load environment variables
load_dotenv()

app = FastAPI(
    title="Localization Management API",
    description="API for managing translation projects and localized content",
    version="1.0.0"
)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Dependency to get current user (simplified for demo)
async def get_current_user() -> str:
    # In a real app, this would validate JWT tokens, etc.
    return "demo-user"

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "service": "localization-management-api"}

# ============================================================================
# PROJECT ENDPOINTS
# ============================================================================

@app.get("/projects", response_model=List[Project])
async def get_projects():
    """Get all active projects"""
    try:
        return await db_service.get_projects()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}", response_model=Project)
async def get_project(project_id: str):
    """Get a single project by ID"""
    try:
        project = await db_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/projects", response_model=Project)
async def create_project(
    project_data: CreateProjectRequest,
    current_user: str = Depends(get_current_user)
):
    """Create a new project"""
    try:
        return await db_service.create_project(project_data, current_user)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/projects/{project_id}", response_model=Project)
async def update_project(
    project_id: str,
    project_data: UpdateProjectRequest,
    current_user: str = Depends(get_current_user)
):
    """Update an existing project"""
    try:
        project = await db_service.update_project(project_id, project_data)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        return project
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/projects/{project_id}")
async def delete_project(
    project_id: str,
    current_user: str = Depends(get_current_user)
):
    """Delete a project (soft delete)"""
    try:
        success = await db_service.delete_project(project_id)
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": "Project deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# PROJECT LANGUAGE MANAGEMENT ENDPOINTS
# ============================================================================

@app.post("/projects/{project_id}/languages/{language_code}")
async def add_project_language(
    project_id: str,
    language_code: str,
    current_user: str = Depends(get_current_user)
):
    """Add a language to project's supported languages"""
    try:
        success = await db_service.add_project_language(project_id, language_code)
        if not success:
            raise HTTPException(status_code=404, detail="Project not found")
        return {"message": f"Language '{language_code}' added to project"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/projects/{project_id}/languages/{language_code}")
async def remove_project_language(
    project_id: str,
    language_code: str,
    current_user: str = Depends(get_current_user)
):
    """Remove a language from project's supported languages"""
    try:
        success = await db_service.remove_project_language(project_id, language_code)
        if not success:
            raise HTTPException(status_code=404, detail="Project not found or language not supported")
        return {"message": f"Language '{language_code}' removed from project"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# TRANSLATION KEY ENDPOINTS
# ============================================================================

@app.get("/translation-keys", response_model=List[TranslationKey])
async def get_translation_keys(project_id: Optional[str] = Query(None)):
    """Get translation keys, optionally filtered by project"""
    try:
        return await db_service.get_translation_keys(project_id)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/translation-keys/{key_id}", response_model=TranslationKey)
async def get_translation_key(key_id: str):
    """Get a single translation key by ID"""
    try:
        key = await db_service.get_translation_key(key_id)
        if not key:
            raise HTTPException(status_code=404, detail="Translation key not found")
        return key
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/translation-keys/batch", response_model=List[TranslationKey])
async def get_translation_keys_batch(key_ids: List[str]):
    """Get multiple translation keys by their IDs"""
    try:
        return await db_service.get_translation_keys_by_ids(key_ids)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/projects/{project_id}/translation-keys", response_model=TranslationKey)
async def create_translation_key(
    project_id: str,
    key_data: CreateTranslationKeyRequest,
    current_user: str = Depends(get_current_user)
):
    """Create a new translation key for a project"""
    try:
        # Verify project exists
        project = await db_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        return await db_service.create_translation_key(project_id, key_data, current_user)
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.put("/translation-keys/{key_id}", response_model=TranslationKey)
async def update_translation_key(
    key_id: str,
    update_data: UpdateTranslationRequest,
    current_user: str = Depends(get_current_user)
):
    """Update translations for a translation key"""
    try:
        key = await db_service.update_translation_key(key_id, update_data, current_user)
        if not key:
            raise HTTPException(status_code=404, detail="Translation key not found")
        return key
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.delete("/translation-keys/{key_id}")
async def delete_translation_key(
    key_id: str,
    current_user: str = Depends(get_current_user)
):
    """Delete a translation key"""
    try:
        success = await db_service.delete_translation_key(key_id)
        if not success:
            raise HTTPException(status_code=404, detail="Translation key not found")
        return {"message": "Translation key deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# LOCALIZATION RETRIEVAL ENDPOINTS (Enhanced)
# ============================================================================

@app.get("/localizations/{project_id}/{locale}", response_model=LocalizationResponse)
async def get_localizations(project_id: str, locale: str):
    """Get all localizations for a project and locale"""
    try:
        # Verify project exists
        project = await db_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        localizations = await db_service.get_localizations(project_id, locale)
        
        return LocalizationResponse(
            project_id=project_id,
            locale=locale,
            localizations=localizations
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/localizations/{project_id}/batch", response_model=LocalizationBatchResponse)
async def get_localizations_batch(project_id: str, locales: List[str]):
    """Get localizations for multiple locales at once"""
    try:
        # Verify project exists
        project = await db_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        batch_localizations = await db_service.get_localizations_batch(project_id, locales)
        
        return LocalizationBatchResponse(
            project_id=project_id,
            localizations=batch_localizations
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/localizations/{project_id}")
async def get_all_project_localizations(project_id: str):
    """Get all localizations for a project across all supported languages"""
    try:
        # Verify project exists and get supported languages
        project = await db_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        batch_localizations = await db_service.get_localizations_batch(
            project_id, 
            project.supported_languages
        )
        
        return LocalizationBatchResponse(
            project_id=project_id,
            localizations=batch_localizations
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================================================
# UTILITY ENDPOINTS
# ============================================================================

@app.get("/projects/{project_id}/categories")
async def get_project_categories(project_id: str):
    """Get all unique categories for a project"""
    try:
        translation_keys = await db_service.get_translation_keys(project_id)
        categories = list(set(key.category for key in translation_keys if key.category))
        return {"categories": sorted(categories)}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}/stats")
async def get_project_stats(project_id: str):
    """Get statistics for a project"""
    try:
        project = await db_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        translation_keys = await db_service.get_translation_keys(project_id)
        
        # Calculate completion stats
        total_keys = len(translation_keys)
        language_stats = {}
        
        for lang in project.supported_languages:
            translated_count = sum(
                1 for key in translation_keys 
                if lang in key.translations and key.translations[lang].value.strip()
            )
            language_stats[lang] = {
                "translated": translated_count,
                "total": total_keys,
                "completion_percentage": (translated_count / total_keys * 100) if total_keys > 0 else 0
            }
        
        categories = list(set(key.category for key in translation_keys if key.category))
        
        return {
            "project_id": project_id,
            "total_keys": total_keys,
            "categories": sorted(categories),
            "language_stats": language_stats,
            "supported_languages": project.supported_languages
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/projects/{project_id}/analytics")
async def get_project_analytics(project_id: str):
    """Get translation completion analytics for a project"""
    try:
        project = await db_service.get_project(project_id)
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        translation_keys = await db_service.get_translation_keys(project_id)
        total_keys = len(translation_keys)
        
        # Calculate completion percentages for each language
        completion_stats = {}
        for lang in project.supported_languages:
            translated_count = sum(
                1 for key in translation_keys 
                if lang in key.translations and key.translations[lang].value.strip()
            )
            completion_stats[lang] = {
                "translated": translated_count,
                "total": total_keys,
                "percentage": (translated_count / total_keys * 100) if total_keys > 0 else 0
            }
        
        return {
            "project_id": project_id,
            "total_keys": total_keys,
            "completion_stats": completion_stats
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

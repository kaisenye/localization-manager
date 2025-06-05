import os
from datetime import datetime
from typing import Dict, List, Optional
from dotenv import load_dotenv
from supabase import create_client, Client
from .models import (
    Project, TranslationKey, CreateProjectRequest, UpdateProjectRequest,
    CreateTranslationKeyRequest, UpdateTranslationRequest, Translation
)

# Load environment variables
load_dotenv()

class DatabaseService:
    def __init__(self):
        supabase_url = os.getenv("SUPABASE_URL")
        supabase_key = os.getenv("SUPABASE_ANON_KEY")
        
        if not supabase_url or not supabase_key:
            raise ValueError("SUPABASE_URL and SUPABASE_ANON_KEY environment variables are required")
        
        self.supabase: Client = create_client(supabase_url, supabase_key)

    # Project operations
    async def get_projects(self) -> List[Project]:
        """Get all active projects"""
        try:
            response = self.supabase.table("projects").select("*").eq("is_active", True).execute()
            projects = []
            for project_data in response.data:
                # Count translation keys for each project
                key_count_response = self.supabase.table("translation_keys").select("id", count="exact").eq("project_id", project_data["id"]).execute()
                project_data["translation_key_count"] = key_count_response.count or 0
                projects.append(Project(**project_data))
            return projects
        except Exception as e:
            raise Exception(f"Failed to fetch projects: {str(e)}")

    async def get_project(self, project_id: str) -> Optional[Project]:
        """Get a single project by ID"""
        try:
            response = self.supabase.table("projects").select("*").eq("id", project_id).single().execute()
            if response.data:
                # Count translation keys
                key_count_response = self.supabase.table("translation_keys").select("id", count="exact").eq("project_id", project_id).execute()
                response.data["translation_key_count"] = key_count_response.count or 0
                return Project(**response.data)
            return None
        except Exception as e:
            raise Exception(f"Failed to fetch project {project_id}: {str(e)}")

    async def create_project(self, project_data: CreateProjectRequest, created_by: str) -> Project:
        """Create a new project"""
        try:
            now = datetime.utcnow()
            project_dict = {
                "name": project_data.name,
                "description": project_data.description,
                "default_language": project_data.default_language,
                "supported_languages": project_data.supported_languages,
                "created_at": now.isoformat(),
                "updated_at": now.isoformat(),
                "created_by": created_by,
                "is_active": True
            }
            
            response = self.supabase.table("projects").insert(project_dict).execute()
            if response.data:
                project_data = response.data[0]
                project_data["translation_key_count"] = 0
                return Project(**project_data)
            raise Exception("Failed to create project")
        except Exception as e:
            raise Exception(f"Failed to create project: {str(e)}")

    async def update_project(self, project_id: str, project_data: UpdateProjectRequest) -> Optional[Project]:
        """Update an existing project"""
        try:
            update_dict = {k: v for k, v in project_data.model_dump(exclude_unset=True).items() if v is not None}
            update_dict["updated_at"] = datetime.utcnow().isoformat()
            
            response = self.supabase.table("projects").update(update_dict).eq("id", project_id).execute()
            if response.data:
                return await self.get_project(project_id)
            return None
        except Exception as e:
            raise Exception(f"Failed to update project {project_id}: {str(e)}")

    async def delete_project(self, project_id: str) -> bool:
        """Soft delete a project"""
        try:
            response = self.supabase.table("projects").update({
                "is_active": False,
                "updated_at": datetime.utcnow().isoformat()
            }).eq("id", project_id).execute()
            return len(response.data) > 0
        except Exception as e:
            raise Exception(f"Failed to delete project {project_id}: {str(e)}")

    # Translation Key operations
    async def get_translation_keys(self, project_id: Optional[str] = None) -> List[TranslationKey]:
        """Get translation keys, optionally filtered by project"""
        try:
            query = self.supabase.table("translation_keys").select("*")
            if project_id:
                query = query.eq("project_id", project_id)
            
            response = query.execute()
            translation_keys = []
            
            for key_data in response.data:
                # Parse translations JSON
                translations_dict = {}
                if key_data.get("translations"):
                    for lang_code, translation_data in key_data["translations"].items():
                        translations_dict[lang_code] = Translation(**translation_data)
                
                key_data["translations"] = translations_dict
                translation_keys.append(TranslationKey(**key_data))
            
            return translation_keys
        except Exception as e:
            raise Exception(f"Failed to fetch translation keys: {str(e)}")

    async def get_translation_key(self, key_id: str) -> Optional[TranslationKey]:
        """Get a single translation key by ID"""
        try:
            response = self.supabase.table("translation_keys").select("*").eq("id", key_id).single().execute()
            if response.data:
                key_data = response.data
                # Parse translations JSON
                translations_dict = {}
                if key_data.get("translations"):
                    for lang_code, translation_data in key_data["translations"].items():
                        translations_dict[lang_code] = Translation(**translation_data)
                
                key_data["translations"] = translations_dict
                return TranslationKey(**key_data)
            return None
        except Exception as e:
            raise Exception(f"Failed to fetch translation key {key_id}: {str(e)}")

    async def get_translation_keys_by_ids(self, key_ids: List[str]) -> List[TranslationKey]:
        """Get multiple translation keys by their IDs"""
        try:
            response = self.supabase.table("translation_keys").select("*").in_("id", key_ids).execute()
            translation_keys = []
            
            for key_data in response.data:
                # Parse translations JSON
                translations_dict = {}
                if key_data.get("translations"):
                    for lang_code, translation_data in key_data["translations"].items():
                        translations_dict[lang_code] = Translation(**translation_data)
                
                key_data["translations"] = translations_dict
                translation_keys.append(TranslationKey(**key_data))
            
            return translation_keys
        except Exception as e:
            raise Exception(f"Failed to fetch translation keys by IDs: {str(e)}")

    async def create_translation_key(self, project_id: str, key_data: CreateTranslationKeyRequest, created_by: str) -> TranslationKey:
        """Create a new translation key"""
        try:
            now = datetime.utcnow()
            
            # Convert simple translations dict to full Translation objects
            translations_dict = {}
            for lang_code, value in key_data.translations.items():
                translations_dict[lang_code] = {
                    "value": value,
                    "updated_at": now.isoformat(),
                    "updated_by": created_by
                }
            
            translation_key_dict = {
                "project_id": project_id,
                "key": key_data.key,
                "category": key_data.category,
                "description": key_data.description,
                "translations": translations_dict
            }
            
            response = self.supabase.table("translation_keys").insert(translation_key_dict).execute()
            if response.data:
                key_data = response.data[0]
                # Parse translations back to Translation objects
                translations_dict = {}
                for lang_code, translation_data in key_data["translations"].items():
                    translations_dict[lang_code] = Translation(**translation_data)
                key_data["translations"] = translations_dict
                return TranslationKey(**key_data)
            raise Exception("Failed to create translation key")
        except Exception as e:
            raise Exception(f"Failed to create translation key: {str(e)}")

    async def update_translation_key(self, key_id: str, update_data: UpdateTranslationRequest, updated_by: str) -> Optional[TranslationKey]:
        """Update translations for a translation key"""
        try:
            # Get existing key to merge translations
            existing_key = await self.get_translation_key(key_id)
            if not existing_key:
                return None
            
            now = datetime.utcnow()
            updated_translations = existing_key.translations.copy()
            
            # Update with new translations
            for lang_code, value in update_data.translations.items():
                updated_translations[lang_code] = Translation(
                    value=value,
                    updated_at=now,
                    updated_by=updated_by
                )
            
            # Convert to dict for database storage
            translations_dict = {}
            for lang_code, translation in updated_translations.items():
                translations_dict[lang_code] = {
                    "value": translation.value,
                    "updated_at": translation.updated_at.isoformat(),
                    "updated_by": translation.updated_by
                }
            
            response = self.supabase.table("translation_keys").update({
                "translations": translations_dict
            }).eq("id", key_id).execute()
            
            if response.data:
                return await self.get_translation_key(key_id)
            return None
        except Exception as e:
            raise Exception(f"Failed to update translation key {key_id}: {str(e)}")

    async def delete_translation_key(self, key_id: str) -> bool:
        """Delete a translation key"""
        try:
            response = self.supabase.table("translation_keys").delete().eq("id", key_id).execute()
            return len(response.data) > 0
        except Exception as e:
            raise Exception(f"Failed to delete translation key {key_id}: {str(e)}")

    # Localization retrieval methods
    async def get_localizations(self, project_id: str, locale: str) -> Dict[str, str]:
        """Get all localizations for a project and locale"""
        try:
            translation_keys = await self.get_translation_keys(project_id)
            localizations = {}
            
            for key in translation_keys:
                if locale in key.translations:
                    localizations[key.key] = key.translations[locale].value
            
            return localizations
        except Exception as e:
            raise Exception(f"Failed to get localizations for project {project_id}, locale {locale}: {str(e)}")

    async def get_localizations_batch(self, project_id: str, locales: List[str]) -> Dict[str, Dict[str, str]]:
        """Get localizations for multiple locales"""
        try:
            translation_keys = await self.get_translation_keys(project_id)
            batch_localizations = {}
            
            for locale in locales:
                localizations = {}
                for key in translation_keys:
                    if locale in key.translations:
                        localizations[key.key] = key.translations[locale].value
                batch_localizations[locale] = localizations
            
            return batch_localizations
        except Exception as e:
            raise Exception(f"Failed to get batch localizations for project {project_id}: {str(e)}")


# Global database service instance
db_service = DatabaseService() 
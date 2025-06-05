from datetime import datetime
from typing import Dict, List, Optional
from pydantic import BaseModel, Field


class Language(BaseModel):
    code: str
    name: str
    native_name: str = Field(alias="nativeName")
    is_active: bool = Field(alias="isActive", default=True)

    class Config:
        populate_by_name = True


class Translation(BaseModel):
    value: str
    updated_at: datetime = Field(alias="updatedAt")
    updated_by: str = Field(alias="updatedBy")

    class Config:
        populate_by_name = True


class Project(BaseModel):
    id: str
    name: str
    description: Optional[str] = None
    default_language: str = Field(alias="defaultLanguage")
    supported_languages: List[str] = Field(alias="supportedLanguages")
    created_at: datetime = Field(alias="createdAt")
    updated_at: datetime = Field(alias="updatedAt")
    created_by: str = Field(alias="createdBy")
    translation_key_count: int = Field(alias="translationKeyCount", default=0)
    is_active: bool = Field(alias="isActive", default=True)

    class Config:
        populate_by_name = True


class TranslationKey(BaseModel):
    id: str
    project_id: str = Field(alias="projectId")
    key: str
    category: str
    description: Optional[str] = None
    translations: Dict[str, Translation]

    class Config:
        populate_by_name = True


class CreateProjectRequest(BaseModel):
    name: str
    description: Optional[str] = None
    default_language: str = Field(alias="defaultLanguage")
    supported_languages: List[str] = Field(alias="supportedLanguages")

    class Config:
        populate_by_name = True


class UpdateProjectRequest(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    supported_languages: Optional[List[str]] = Field(alias="supportedLanguages", default=None)
    is_active: Optional[bool] = Field(alias="isActive", default=None)

    class Config:
        populate_by_name = True


class CreateTranslationKeyRequest(BaseModel):
    key: str
    category: str
    description: Optional[str] = None
    translations: Dict[str, str]


class UpdateTranslationRequest(BaseModel):
    translations: Dict[str, str]


class TranslationFilter(BaseModel):
    search: Optional[str] = ""
    categories: List[str] = []
    languages: List[str] = []
    project_id: Optional[str] = Field(alias="projectId", default=None)
    updated_by: Optional[str] = Field(alias="updatedBy", default=None)

    class Config:
        populate_by_name = True


# Response models for localization endpoints
class LocalizationResponse(BaseModel):
    project_id: str = Field(alias="projectId")
    locale: str
    localizations: Dict[str, str]

    class Config:
        populate_by_name = True


class LocalizationBatchResponse(BaseModel):
    project_id: str = Field(alias="projectId")
    localizations: Dict[str, Dict[str, str]]  # locale -> key -> value

    class Config:
        populate_by_name = True 
export interface Project {
  id: string;
  name: string;
  description?: string;
  defaultLanguage: string;
  supportedLanguages: string[];
  createdAt: string;
  updatedAt: string;
  createdBy: string;
  translationKeyCount: number;
  isActive: boolean;
}

export interface TranslationKey {
  id: string;
  projectId: string; // Link to project
  key: string; // e.g., "button.save"
  category: string; // e.g., "buttons"
  description?: string;
  translations: {
    [languageCode: string]: {
      value: string;
      updatedAt: string;
      updatedBy: string;
    };
  };
}

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  isActive: boolean;
}

export interface TranslationFilter {
  search: string;
  categories: string[];
  languages: string[];
  projectId?: string; // Filter by project
  updatedBy?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface TranslationState {
  keys: TranslationKey[];
  projects: Project[];
  currentProject: Project | null;
  languages: Language[];
  filter: TranslationFilter;
  editingKey: string | null;
  isLoading: boolean;
  error: string | null;
}

export interface CreateTranslationKeyRequest {
  key: string;
  category: string;
  description?: string;
  translations: {
    [languageCode: string]: string;
  };
}

export interface UpdateTranslationRequest {
  id: string;
  translations: {
    [languageCode: string]: string;
  };
}

export interface TranslationKeyFormData {
  key: string;
  category: string;
  description: string;
  translations: Record<string, string>;
}

export interface CreateProjectRequest {
  name: string;
  description?: string;
  defaultLanguage: string;
  supportedLanguages: string[];
}

export interface UpdateProjectRequest {
  id: string;
  name?: string;
  description?: string;
  supportedLanguages?: string[];
  isActive?: boolean;
} 
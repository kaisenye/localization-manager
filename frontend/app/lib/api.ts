import type { 
  TranslationKey, 
  CreateTranslationKeyRequest, 
  UpdateTranslationRequest,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest
} from '../types/translation';

// API Configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

// HTTP client with error handling
class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.detail || `HTTP ${response.status}: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('An unexpected error occurred');
    }
  }

  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

const apiClient = new ApiClient(API_BASE_URL);

// Translation API functions
export const translationApi = {
  // Get all translation keys (optionally filtered by project)
  getTranslationKeys: async (projectId?: string): Promise<TranslationKey[]> => {
    const endpoint = projectId 
      ? `/translation-keys?project_id=${encodeURIComponent(projectId)}`
      : '/translation-keys';
    return apiClient.get<TranslationKey[]>(endpoint);
  },

  // Get translation key by ID
  getTranslationKey: async (id: string): Promise<TranslationKey | null> => {
    try {
      return await apiClient.get<TranslationKey>(`/translation-keys/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  // Get multiple translation keys by IDs
  getTranslationKeysBatch: async (ids: string[]): Promise<TranslationKey[]> => {
    return apiClient.post<TranslationKey[]>('/translation-keys/batch', ids);
  },

  // Create new translation key
  createTranslationKey: async (data: CreateTranslationKeyRequest & { projectId: string }): Promise<TranslationKey> => {
    const { projectId, ...keyData } = data;
    return apiClient.post<TranslationKey>(`/projects/${encodeURIComponent(projectId)}/translation-keys`, keyData);
  },

  // Update translation key
  updateTranslationKey: async (data: UpdateTranslationRequest): Promise<TranslationKey> => {
    const { id, ...updateData } = data;
    return apiClient.put<TranslationKey>(`/translation-keys/${encodeURIComponent(id)}`, updateData);
  },

  // Delete translation key
  deleteTranslationKey: async (id: string): Promise<void> => {
    await apiClient.delete(`/translation-keys/${encodeURIComponent(id)}`);
  },

  // Get unique categories for a project
  getCategories: async (projectId?: string): Promise<string[]> => {
    if (!projectId) {
      // If no project specified, get categories from all translation keys
      const keys = await translationApi.getTranslationKeys();
      const categories = [...new Set(keys.map(key => key.category))];
      return categories.sort();
    }
    
    const response = await apiClient.get<{ categories: string[] }>(`/projects/${encodeURIComponent(projectId)}/categories`);
    return response.categories;
  }
};

// Project API functions
export const projectApi = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    return apiClient.get<Project[]>('/projects');
  },

  // Get project by ID
  getProject: async (id: string): Promise<Project | null> => {
    try {
      return await apiClient.get<Project>(`/projects/${encodeURIComponent(id)}`);
    } catch (error) {
      if (error instanceof Error && error.message.includes('404')) {
        return null;
      }
      throw error;
    }
  },

  // Create new project
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    return apiClient.post<Project>('/projects', data);
  },

  // Update project
  updateProject: async (data: UpdateProjectRequest): Promise<Project> => {
    const { id, ...updateData } = data;
    return apiClient.put<Project>(`/projects/${encodeURIComponent(id)}`, updateData);
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    await apiClient.delete(`/projects/${encodeURIComponent(id)}`);
  },

  // Get project statistics
  getProjectStats: async (projectId: string) => {
    return apiClient.get(`/projects/${encodeURIComponent(projectId)}/stats`);
  },

  // Add language to project
  addLanguage: async (projectId: string, languageCode: string): Promise<{ message: string }> => {
    return apiClient.post(`/projects/${encodeURIComponent(projectId)}/languages/${encodeURIComponent(languageCode)}`);
  },

  // Remove language from project
  removeLanguage: async (projectId: string, languageCode: string): Promise<{ message: string }> => {
    return apiClient.delete(`/projects/${encodeURIComponent(projectId)}/languages/${encodeURIComponent(languageCode)}`);
  }
};

// Localization API functions (for retrieving localized content)
export const localizationApi = {
  // Get localizations for a specific project and locale
  getLocalizations: async (projectId: string, locale: string): Promise<{ projectId: string; locale: string; localizations: Record<string, string> }> => {
    return apiClient.get(`/localizations/${encodeURIComponent(projectId)}/${encodeURIComponent(locale)}`);
  },

  // Get localizations for multiple locales
  getLocalizationsBatch: async (projectId: string, locales: string[]): Promise<{ projectId: string; localizations: Record<string, Record<string, string>> }> => {
    return apiClient.post(`/localizations/${encodeURIComponent(projectId)}/batch`, locales);
  },

  // Get all localizations for a project (all supported languages)
  getAllProjectLocalizations: async (projectId: string): Promise<{ projectId: string; localizations: Record<string, Record<string, string>> }> => {
    return apiClient.get(`/localizations/${encodeURIComponent(projectId)}`);
  }
};

// Health check
export const healthApi = {
  check: async (): Promise<{ status: string; service: string }> => {
    return apiClient.get('/health');
  }
}; 
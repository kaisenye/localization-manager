import type { 
  TranslationKey, 
  CreateTranslationKeyRequest, 
  UpdateTranslationRequest,
  Project,
  CreateProjectRequest,
  UpdateProjectRequest
} from '../types/translation';

// Mock projects data
const mockProjects: Project[] = [
  {
    id: 'proj-1',
    name: 'E-commerce Platform',
    description: 'Main e-commerce application translations',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr', 'de'],
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-15T10:30:00Z',
    createdBy: 'admin',
    translationKeyCount: 3,
    isActive: true
  },
  {
    id: 'proj-2',
    name: 'Mobile App',
    description: 'Mobile application translations',
    defaultLanguage: 'en',
    supportedLanguages: ['en', 'es', 'fr'],
    createdAt: '2024-01-05T00:00:00Z',
    updatedAt: '2024-01-12T14:10:00Z',
    createdBy: 'admin',
    translationKeyCount: 2,
    isActive: true
  }
];

// Mock data for development - Updated with projectId
const mockTranslationKeys: TranslationKey[] = [
  {
    id: '1',
    projectId: 'proj-1',
    key: 'button.save',
    category: 'buttons',
    description: 'Save button text',
    translations: {
      en: { value: 'Save', updatedAt: '2024-01-15T10:30:00Z', updatedBy: 'john.doe' },
      es: { value: 'Guardar', updatedAt: '2024-01-15T10:30:00Z', updatedBy: 'maria.garcia' },
      fr: { value: 'Enregistrer', updatedAt: '2024-01-15T10:30:00Z', updatedBy: 'pierre.martin' },
      de: { value: 'Speichern', updatedAt: '2024-01-15T10:30:00Z', updatedBy: 'hans.mueller' },
    }
  },
  {
    id: '2',
    projectId: 'proj-1',
    key: 'button.cancel',
    category: 'buttons',
    description: 'Cancel button text',
    translations: {
      en: { value: 'Cancel', updatedAt: '2024-01-14T15:45:00Z', updatedBy: 'john.doe' },
      es: { value: 'Cancelar', updatedAt: '2024-01-14T15:45:00Z', updatedBy: 'maria.garcia' },
      fr: { value: 'Annuler', updatedAt: '2024-01-14T15:45:00Z', updatedBy: 'pierre.martin' },
      de: { value: 'Abbrechen', updatedAt: '2024-01-14T15:45:00Z', updatedBy: 'hans.mueller' },
    }
  },
  {
    id: '3',
    projectId: 'proj-1',
    key: 'form.email.label',
    category: 'forms',
    description: 'Email input label',
    translations: {
      en: { value: 'Email Address', updatedAt: '2024-01-13T09:20:00Z', updatedBy: 'jane.smith' },
      es: { value: 'Dirección de Correo', updatedAt: '2024-01-13T09:20:00Z', updatedBy: 'maria.garcia' },
      fr: { value: 'Adresse Email', updatedAt: '2024-01-13T09:20:00Z', updatedBy: 'pierre.martin' },
      de: { value: 'E-Mail-Adresse', updatedAt: '2024-01-13T09:20:00Z', updatedBy: 'hans.mueller' },
    }
  },
  {
    id: '4',
    projectId: 'proj-2',
    key: 'navigation.home',
    category: 'navigation',
    description: 'Home navigation link',
    translations: {
      en: { value: 'Home', updatedAt: '2024-01-12T14:10:00Z', updatedBy: 'admin' },
      es: { value: 'Inicio', updatedAt: '2024-01-12T14:10:00Z', updatedBy: 'maria.garcia' },
      fr: { value: 'Accueil', updatedAt: '2024-01-12T14:10:00Z', updatedBy: 'pierre.martin' },
    }
  },
  {
    id: '5',
    projectId: 'proj-2',
    key: 'error.validation.required',
    category: 'errors',
    description: 'Required field validation error',
    translations: {
      en: { value: 'This field is required', updatedAt: '2024-01-11T11:30:00Z', updatedBy: 'jane.smith' },
      es: { value: 'Este campo es obligatorio', updatedAt: '2024-01-11T11:30:00Z', updatedBy: 'maria.garcia' },
      fr: { value: 'Ce champ est requis', updatedAt: '2024-01-11T11:30:00Z', updatedBy: 'pierre.martin' },
    }
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const translationApi = {
  // Get all translation keys (optionally filtered by project)
  getTranslationKeys: async (projectId?: string): Promise<TranslationKey[]> => {
    await delay(500);
    if (projectId) {
      return mockTranslationKeys.filter(key => key.projectId === projectId);
    }
    return [...mockTranslationKeys];
  },

  // Get translation key by ID
  getTranslationKey: async (id: string): Promise<TranslationKey | null> => {
    await delay(300);
    return mockTranslationKeys.find(key => key.id === id) || null;
  },

  // Create new translation key
  createTranslationKey: async (data: CreateTranslationKeyRequest & { projectId: string }): Promise<TranslationKey> => {
    await delay(800);
    const newKey: TranslationKey = {
      id: Math.random().toString(36).substring(2),
      projectId: data.projectId,
      key: data.key,
      category: data.category,
      description: data.description,
      translations: Object.entries(data.translations).reduce((acc, [lang, value]) => {
        acc[lang] = {
          value,
          updatedAt: new Date().toISOString(),
          updatedBy: 'current.user'
        };
        return acc;
      }, {} as TranslationKey['translations'])
    };
    
    mockTranslationKeys.push(newKey);
    
    // Update project translation count
    const project = mockProjects.find(p => p.id === data.projectId);
    if (project) {
      project.translationKeyCount++;
      project.updatedAt = new Date().toISOString();
    }
    
    return newKey;
  },

  // Update translation key
  updateTranslationKey: async (data: UpdateTranslationRequest): Promise<TranslationKey> => {
    await delay(600);
    const keyIndex = mockTranslationKeys.findIndex(key => key.id === data.id);
    
    if (keyIndex === -1) {
      throw new Error('Translation key not found');
    }

    const updatedTranslations = { ...mockTranslationKeys[keyIndex].translations };
    Object.entries(data.translations).forEach(([lang, value]) => {
      updatedTranslations[lang] = {
        value,
        updatedAt: new Date().toISOString(),
        updatedBy: 'current.user'
      };
    });

    mockTranslationKeys[keyIndex] = {
      ...mockTranslationKeys[keyIndex],
      translations: updatedTranslations
    };

    return mockTranslationKeys[keyIndex];
  },

  // Delete translation key
  deleteTranslationKey: async (id: string): Promise<void> => {
    await delay(400);
    const index = mockTranslationKeys.findIndex(key => key.id === id);
    if (index === -1) {
      throw new Error('Translation key not found');
    }
    mockTranslationKeys.splice(index, 1);
  },

  // Get unique categories (optionally filtered by project)
  getCategories: async (projectId?: string): Promise<string[]> => {
    await delay(200);
    const keys = projectId 
      ? mockTranslationKeys.filter(key => key.projectId === projectId)
      : mockTranslationKeys;
    const categories = [...new Set(keys.map(key => key.category))];
    return categories.sort();
  }
};

// Project API functions
export const projectApi = {
  // Get all projects
  getProjects: async (): Promise<Project[]> => {
    await delay(400);
    return [...mockProjects];
  },

  // Get project by ID
  getProject: async (id: string): Promise<Project | null> => {
    await delay(300);
    return mockProjects.find(project => project.id === id) || null;
  },

  // Create new project
  createProject: async (data: CreateProjectRequest): Promise<Project> => {
    await delay(800);
    const newProject: Project = {
      id: `proj-${Math.random().toString(36).substring(2)}`,
      name: data.name,
      description: data.description,
      defaultLanguage: data.defaultLanguage,
      supportedLanguages: data.supportedLanguages,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: 'current.user',
      translationKeyCount: 0,
      isActive: true
    };
    
    mockProjects.push(newProject);
    return newProject;
  },

  // Update project
  updateProject: async (data: UpdateProjectRequest): Promise<Project> => {
    await delay(600);
    const projectIndex = mockProjects.findIndex(project => project.id === data.id);
    
    if (projectIndex === -1) {
      throw new Error('Project not found');
    }

    mockProjects[projectIndex] = {
      ...mockProjects[projectIndex],
      ...data,
      updatedAt: new Date().toISOString()
    };

    return mockProjects[projectIndex];
  },

  // Delete project
  deleteProject: async (id: string): Promise<void> => {
    await delay(400);
    const index = mockProjects.findIndex(project => project.id === id);
    if (index === -1) {
      throw new Error('Project not found');
    }
    
    // Also remove associated translation keys
    const keysToRemove = mockTranslationKeys.filter(key => key.projectId === id);
    keysToRemove.forEach(key => {
      const keyIndex = mockTranslationKeys.findIndex(k => k.id === key.id);
      if (keyIndex !== -1) {
        mockTranslationKeys.splice(keyIndex, 1);
      }
    });
    
    mockProjects.splice(index, 1);
  }
}; 
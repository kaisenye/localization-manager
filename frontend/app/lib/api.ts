import type { 
  TranslationKey, 
  CreateTranslationKeyRequest, 
  UpdateTranslationRequest 
} from '../types/translation';

// Mock data for development
const mockTranslationKeys: TranslationKey[] = [
  {
    id: '1',
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
    key: 'navigation.home',
    category: 'navigation',
    description: 'Home navigation link',
    translations: {
      en: { value: 'Home', updatedAt: '2024-01-12T14:10:00Z', updatedBy: 'admin' },
      es: { value: 'Inicio', updatedAt: '2024-01-12T14:10:00Z', updatedBy: 'maria.garcia' },
      fr: { value: 'Accueil', updatedAt: '2024-01-12T14:10:00Z', updatedBy: 'pierre.martin' },
      de: { value: 'Startseite', updatedAt: '2024-01-12T14:10:00Z', updatedBy: 'hans.mueller' },
    }
  },
  {
    id: '5',
    key: 'error.validation.required',
    category: 'errors',
    description: 'Required field validation error',
    translations: {
      en: { value: 'This field is required', updatedAt: '2024-01-11T11:30:00Z', updatedBy: 'jane.smith' },
      es: { value: 'Este campo es obligatorio', updatedAt: '2024-01-11T11:30:00Z', updatedBy: 'maria.garcia' },
      fr: { value: 'Ce champ est requis', updatedAt: '2024-01-11T11:30:00Z', updatedBy: 'pierre.martin' },
      de: { value: 'Dieses Feld ist erforderlich', updatedAt: '2024-01-11T11:30:00Z', updatedBy: 'hans.mueller' },
    }
  }
];

// Simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Mock API functions
export const translationApi = {
  // Get all translation keys
  getTranslationKeys: async (): Promise<TranslationKey[]> => {
    await delay(500);
    return [...mockTranslationKeys];
  },

  // Get translation key by ID
  getTranslationKey: async (id: string): Promise<TranslationKey | null> => {
    await delay(300);
    return mockTranslationKeys.find(key => key.id === id) || null;
  },

  // Create new translation key
  createTranslationKey: async (data: CreateTranslationKeyRequest): Promise<TranslationKey> => {
    await delay(800);
    const newKey: TranslationKey = {
      id: Math.random().toString(36).substring(2),
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

  // Get unique categories
  getCategories: async (): Promise<string[]> => {
    await delay(200);
    const categories = [...new Set(mockTranslationKeys.map(key => key.category))];
    return categories.sort();
  }
}; 
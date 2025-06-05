export interface TranslationKey {
  id: string;
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
  updatedBy?: string;
  dateRange?: {
    from: Date;
    to: Date;
  };
}

export interface TranslationState {
  keys: TranslationKey[];
  languages: Language[];
  filter: TranslationFilter;
  selectedKeys: string[];
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
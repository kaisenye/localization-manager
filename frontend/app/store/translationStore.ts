import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  TranslationKey, 
  Language, 
  TranslationFilter, 
  TranslationState 
} from '../types/translation';

interface TranslationStore extends TranslationState {
  // Actions
  setKeys: (keys: TranslationKey[]) => void;
  addKey: (key: TranslationKey) => void;
  updateKey: (id: string, updates: Partial<TranslationKey>) => void;
  deleteKey: (id: string) => void;
  
  // Filter actions
  setFilter: (filter: Partial<TranslationFilter>) => void;
  clearFilter: () => void;
  setSearch: (search: string) => void;
  
  // Selection actions
  selectKey: (id: string) => void;
  selectMultipleKeys: (ids: string[]) => void;
  clearSelection: () => void;
  
  // Editing actions
  setEditingKey: (id: string | null) => void;
  
  // Language actions
  setLanguages: (languages: Language[]) => void;
  toggleLanguage: (code: string) => void;
  
  // Loading and error states
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

const initialFilter: TranslationFilter = {
  search: '',
  categories: [],
  languages: [],
};

export const useTranslationStore = create<TranslationStore>()(
  devtools(
    (set, get) => ({
      // Initial state
      keys: [],
      languages: [
        { code: 'en', name: 'English', nativeName: 'English', isActive: true },
        { code: 'es', name: 'Spanish', nativeName: 'Español', isActive: true },
        { code: 'fr', name: 'French', nativeName: 'Français', isActive: true },
        { code: 'de', name: 'German', nativeName: 'Deutsch', isActive: true },
      ],
      filter: initialFilter,
      selectedKeys: [],
      editingKey: null,
      isLoading: false,
      error: null,

      // Key management actions
      setKeys: (keys) => set({ keys }),
      
      addKey: (key) => set((state) => ({ 
        keys: [...state.keys, key] 
      })),
      
      updateKey: (id, updates) => set((state) => ({
        keys: state.keys.map((key) => 
          key.id === id ? { ...key, ...updates } : key
        )
      })),
      
      deleteKey: (id) => set((state) => ({
        keys: state.keys.filter((key) => key.id !== id),
        selectedKeys: state.selectedKeys.filter((keyId) => keyId !== id),
        editingKey: state.editingKey === id ? null : state.editingKey,
      })),

      // Filter actions
      setFilter: (filterUpdates) => set((state) => ({
        filter: { ...state.filter, ...filterUpdates }
      })),
      
      clearFilter: () => set({ filter: initialFilter }),
      
      setSearch: (search) => set((state) => ({
        filter: { ...state.filter, search }
      })),

      // Selection actions
      selectKey: (id) => set((state) => {
        const isSelected = state.selectedKeys.includes(id);
        return {
          selectedKeys: isSelected 
            ? state.selectedKeys.filter((keyId) => keyId !== id)
            : [...state.selectedKeys, id]
        };
      }),
      
      selectMultipleKeys: (ids) => set({ selectedKeys: ids }),
      
      clearSelection: () => set({ selectedKeys: [] }),

      // Editing actions
      setEditingKey: (id) => set({ editingKey: id }),

      // Language actions
      setLanguages: (languages) => set({ languages }),
      
      toggleLanguage: (code) => set((state) => ({
        languages: state.languages.map((lang) =>
          lang.code === code ? { ...lang, isActive: !lang.isActive } : lang
        )
      })),

      // Loading and error states
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),
    }),
    {
      name: 'translation-store',
    }
  )
); 
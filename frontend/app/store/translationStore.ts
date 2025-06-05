import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { 
  TranslationKey, 
  Language, 
  TranslationFilter, 
  TranslationState,
  Project
} from '../types/translation';

interface TranslationStore extends TranslationState {
  // Actions
  setKeys: (keys: TranslationKey[]) => void;
  addKey: (key: TranslationKey) => void;
  updateKey: (id: string, updates: Partial<TranslationKey>) => void;
  deleteKey: (id: string) => void;
  
  // Project actions
  setProjects: (projects: Project[]) => void;
  setCurrentProject: (project: Project | null) => void;
  addProject: (project: Project) => void;
  updateProject: (id: string, updates: Partial<Project>) => void;
  deleteProject: (id: string) => void;
  
  // Filter actions
  setFilter: (filter: Partial<TranslationFilter>) => void;
  clearFilter: () => void;
  setSearch: (search: string) => void;
  
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
      projects: [],
      currentProject: null,
      languages: [
        { code: 'en', name: 'English', nativeName: 'English', isActive: true },
        { code: 'es', name: 'Spanish', nativeName: 'Español', isActive: true },
        { code: 'fr', name: 'French', nativeName: 'Français', isActive: true },
        { code: 'de', name: 'German', nativeName: 'Deutsch', isActive: true },
      ],
      filter: initialFilter,
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
        editingKey: state.editingKey === id ? null : state.editingKey,
      })),

      // Project management actions
      setProjects: (projects) => set({ projects }),
      
      setCurrentProject: (project) => set({ 
        currentProject: project,
        // Clear filter when switching projects
        filter: { ...initialFilter, projectId: project?.id }
      }),
      
      addProject: (project) => set((state) => ({
        projects: [...state.projects, project]
      })),
      
      updateProject: (id, updates) => set((state) => ({
        projects: state.projects.map((project) =>
          project.id === id ? { ...project, ...updates } : project
        ),
        currentProject: state.currentProject?.id === id 
          ? { ...state.currentProject, ...updates }
          : state.currentProject
      })),
      
      deleteProject: (id) => set((state) => ({
        projects: state.projects.filter((project) => project.id !== id),
        currentProject: state.currentProject?.id === id ? null : state.currentProject,
        keys: state.keys.filter((key) => key.projectId !== id),
      })),

      // Filter actions
      setFilter: (filterUpdates) => set((state) => ({
        filter: { ...state.filter, ...filterUpdates }
      })),
      
      clearFilter: () => set((state) => ({ 
        filter: { 
          ...initialFilter, 
          projectId: state.currentProject?.id 
        } 
      })),
      
      setSearch: (search) => set((state) => ({
        filter: { ...state.filter, search }
      })),

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
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { translationApi, projectApi, localizationApi, healthApi } from '../lib/api';
import type { 
  TranslationKey, 
  CreateTranslationKeyRequest, 
  CreateProjectRequest,
  UpdateProjectRequest
} from '../types/translation';

// Query keys
export const translationKeys = {
  all: ['translations'] as const,
  lists: () => [...translationKeys.all, 'list'] as const,
  list: (filters: Record<string, any>) => [...translationKeys.lists(), filters] as const,
  details: () => [...translationKeys.all, 'detail'] as const,
  detail: (id: string) => [...translationKeys.details(), id] as const,
  categories: () => [...translationKeys.all, 'categories'] as const,
  batch: (ids: string[]) => [...translationKeys.all, 'batch', ids] as const,
};

// Translation Key Hooks
export function useTranslationKeys(projectId?: string) {
  return useQuery({
    queryKey: ['translationKeys', projectId],
    queryFn: () => translationApi.getTranslationKeys(projectId),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

// Get translation key by ID
export function useTranslationKey(id: string) {
  return useQuery({
    queryKey: translationKeys.detail(id),
    queryFn: () => translationApi.getTranslationKey(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Get multiple translation keys by IDs
export function useTranslationKeysBatch(ids: string[]) {
  return useQuery({
    queryKey: translationKeys.batch(ids),
    queryFn: () => translationApi.getTranslationKeysBatch(ids),
    enabled: ids.length > 0,
    staleTime: 5 * 60 * 1000,
  });
}

// Get categories
export function useCategories(projectId?: string) {
  return useQuery({
    queryKey: ['categories', projectId],
    queryFn: () => translationApi.getCategories(projectId),
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Create translation key mutation
export function useCreateTranslationKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTranslationKeyRequest & { projectId: string }) => 
      translationApi.createTranslationKey(data),
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: ['translationKeys'],
      });

      // Snapshot previous values
      const allQueries = queryClient.getQueriesData<TranslationKey[]>({
        queryKey: ['translationKeys'],
      });

      // Create optimistic new key
      const optimisticKey: TranslationKey = {
        id: `temp-${Date.now()}`, // Temporary ID
        projectId: variables.projectId,
        key: variables.key,
        category: variables.category,
        description: variables.description || '',
        translations: Object.entries(variables.translations || {}).reduce((acc, [lang, value]) => {
          acc[lang] = {
            value: value,
            updatedAt: new Date().toISOString(),
            updatedBy: 'current.user'
          };
          return acc;
        }, {} as { [languageCode: string]: { value: string; updatedAt: string; updatedBy: string; } })
      };

      // Optimistically add to all translation key list caches
      allQueries.forEach(([queryKey, data]) => {
        if (data) {
          queryClient.setQueryData(queryKey, [...data, optimisticKey]);
        }
      });

      return { allQueries, optimisticKey };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.allQueries) {
        context.allQueries.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
      console.error('Failed to create translation key:', error);
    },
    onSuccess: (newKey, variables, context) => {
      // Replace optimistic key with real key
      if (context?.allQueries && context?.optimisticKey) {
        context.allQueries.forEach(([queryKey, data]) => {
          if (data) {
            const updatedData = data.map(key => 
              key.id === context.optimisticKey.id ? newKey : key
            );
            queryClient.setQueryData(queryKey, updatedData);
          }
        });
      }

      // Update the project-specific list cache
      queryClient.invalidateQueries({
        queryKey: ['translationKeys', newKey.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['translationKeys', undefined], // All keys
      });
      
      // Invalidate categories for the project
      queryClient.invalidateQueries({
        queryKey: ['categories', newKey.projectId],
      });
      queryClient.invalidateQueries({
        queryKey: ['categories', undefined], // All categories
      });
      
      // Invalidate projects to update translation counts
      queryClient.invalidateQueries({
        queryKey: ['projects'],
      });
      
      // Invalidate project stats
      queryClient.invalidateQueries({
        queryKey: ['projectStats', newKey.projectId],
      });
      
      // Invalidate localizations
      queryClient.invalidateQueries({
        queryKey: ['localizations', newKey.projectId],
      });
    },
  });
}

// Update translation key mutation
export function useUpdateTranslationKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: translationApi.updateTranslationKey,
    onMutate: async (variables) => {
      // Cancel outgoing refetches for all related queries
      await queryClient.cancelQueries({
        queryKey: translationKeys.detail(variables.id),
      });
      await queryClient.cancelQueries({
        queryKey: ['translationKeys'],
      });

      // Snapshot previous values
      const previousKey = queryClient.getQueryData<TranslationKey>(
        translationKeys.detail(variables.id)
      );

      // Get all translation key queries to update
      const allQueries = queryClient.getQueriesData<TranslationKey[]>({
        queryKey: ['translationKeys'],
      });

      // Optimistically update
      if (previousKey) {
        const updatedTranslations = { ...previousKey.translations };
        Object.entries(variables.translations).forEach(([lang, value]) => {
          updatedTranslations[lang] = {
            value,
            updatedAt: new Date().toISOString(),
            updatedBy: 'current.user'
          };
        });

        const optimisticKey = {
          ...previousKey,
          translations: updatedTranslations
        };

        // Update detail cache
        queryClient.setQueryData(translationKeys.detail(variables.id), optimisticKey);
        
        // Update all translation key list caches
        allQueries.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(
              queryKey,
              data.map(key => key.id === variables.id ? optimisticKey : key)
            );
          }
        });
      }

      return { previousKey, allQueries };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousKey) {
        queryClient.setQueryData(
          translationKeys.detail(variables.id),
          context.previousKey
        );
      }
      
      // Rollback all list caches
      if (context?.allQueries) {
        context.allQueries.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
      
      console.error('Failed to update translation key:', error);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after mutation to ensure consistency
      queryClient.invalidateQueries({
        queryKey: translationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: ['translationKeys'],
      });
      
      // Invalidate localizations for the project
      if (data) {
        queryClient.invalidateQueries({
          queryKey: ['localizations', data.projectId],
        });
      }
    },
  });
}

// Delete translation key mutation
export function useDeleteTranslationKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: translationApi.deleteTranslationKey,
    onMutate: async (id) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: translationKeys.lists(),
      });

      // Snapshot previous value
      const previousKeys = queryClient.getQueryData<TranslationKey[]>(
        translationKeys.lists()
      );

      // Optimistically remove from list
      if (previousKeys) {
        queryClient.setQueryData(
          translationKeys.lists(),
          previousKeys.filter(key => key.id !== id)
        );
      }

      return { previousKeys };
    },
    onError: (error, id, context) => {
      // Rollback on error
      if (context?.previousKeys) {
        queryClient.setQueryData(translationKeys.lists(), context.previousKeys);
      }
      console.error('Failed to delete translation key:', error);
    },
    onSuccess: (data, id) => {
      // Remove from detail cache
      queryClient.removeQueries({
        queryKey: translationKeys.detail(id),
      });
      
      // Invalidate categories in case the last key of a category was deleted
      queryClient.invalidateQueries({
        queryKey: translationKeys.categories(),
      });
      
      // Invalidate projects to update translation counts
      queryClient.invalidateQueries({
        queryKey: ['projects'],
      });
      
      // Invalidate localizations
      queryClient.invalidateQueries({
        queryKey: ['localizations'],
      });
    },
  });
}

// Project Hooks
export function useProjects() {
  return useQuery({
    queryKey: ['projects'],
    queryFn: () => projectApi.getProjects(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

export function useProject(id: string) {
  return useQuery({
    queryKey: ['project', id],
    queryFn: () => projectApi.getProject(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
  });
}

// Get project statistics
export function useProjectStats(projectId: string) {
  return useQuery({
    queryKey: ['projectStats', projectId],
    queryFn: () => projectApi.getProjectStats(projectId),
    enabled: !!projectId,
    staleTime: 2 * 60 * 1000, // 2 minutes (stats change more frequently)
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: CreateProjectRequest) => projectApi.createProject(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (data: UpdateProjectRequest) => projectApi.updateProject(data),
    onSuccess: (updatedProject) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', updatedProject.id] });
      queryClient.invalidateQueries({ queryKey: ['projectStats', updatedProject.id] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: (id: string) => projectApi.deleteProject(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['translationKeys'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
      queryClient.invalidateQueries({ queryKey: ['localizations'] });
      queryClient.invalidateQueries({ queryKey: ['projectStats'] });
    },
  });
}

// Localization Hooks
export function useLocalizations(projectId: string, locale: string) {
  return useQuery({
    queryKey: ['localizations', projectId, locale],
    queryFn: () => localizationApi.getLocalizations(projectId, locale),
    enabled: !!projectId && !!locale,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useLocalizationsBatch(projectId: string, locales: string[]) {
  return useQuery({
    queryKey: ['localizations', projectId, 'batch', locales],
    queryFn: () => localizationApi.getLocalizationsBatch(projectId, locales),
    enabled: !!projectId && locales.length > 0,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

export function useAllProjectLocalizations(projectId: string) {
  return useQuery({
    queryKey: ['localizations', projectId, 'all'],
    queryFn: () => localizationApi.getAllProjectLocalizations(projectId),
    enabled: !!projectId,
    staleTime: 10 * 60 * 1000, // 10 minutes
  });
}

// Health Check Hook
export function useHealthCheck() {
  return useQuery({
    queryKey: ['health'],
    queryFn: () => healthApi.check(),
    staleTime: 30 * 1000, // 30 seconds
    refetchInterval: 60 * 1000, // Refetch every minute
    retry: 3,
  });
}

// Project language management hooks
export const useAddProjectLanguage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, languageCode }: { projectId: string; languageCode: string }) =>
      projectApi.addLanguage(projectId, languageCode),
    onMutate: async ({ projectId, languageCode }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });

      // Snapshot previous values
      const previousProjects = queryClient.getQueryData<any[]>(['projects']);
      const previousProject = queryClient.getQueryData<any>(['project', projectId]);

      // Optimistically update projects list
      if (previousProjects) {
        const updatedProjects = previousProjects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                supportedLanguages: [...(project.supportedLanguages || []), languageCode].filter((lang, index, arr) => arr.indexOf(lang) === index)
              }
            : project
        );
        queryClient.setQueryData(['projects'], updatedProjects);
      }

      // Optimistically update single project
      if (previousProject) {
        const updatedProject = {
          ...previousProject,
          supportedLanguages: [...(previousProject.supportedLanguages || []), languageCode].filter((lang, index, arr) => arr.indexOf(lang) === index)
        };
        queryClient.setQueryData(['project', projectId], updatedProject);
      }

      return { previousProjects, previousProject };
    },
    onError: (error, { projectId }, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }
      console.error('Failed to add language:', error);
    },
    onSuccess: (_, { projectId }) => {
      // Invalidate project queries to refresh supported languages
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] });
    },
  });
};

export const useRemoveProjectLanguage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ projectId, languageCode }: { projectId: string; languageCode: string }) =>
      projectApi.removeLanguage(projectId, languageCode),
    onMutate: async ({ projectId, languageCode }) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: ['projects'] });
      await queryClient.cancelQueries({ queryKey: ['project', projectId] });
      await queryClient.cancelQueries({ queryKey: ['translationKeys'] });

      // Snapshot previous values
      const previousProjects = queryClient.getQueryData<any[]>(['projects']);
      const previousProject = queryClient.getQueryData<any>(['project', projectId]);
      const allTranslationQueries = queryClient.getQueriesData<any[]>({
        queryKey: ['translationKeys'],
      });

      // Optimistically update projects list
      if (previousProjects) {
        const updatedProjects = previousProjects.map(project => 
          project.id === projectId 
            ? { 
                ...project, 
                supportedLanguages: (project.supportedLanguages || []).filter((lang: string) => lang !== languageCode)
              }
            : project
        );
        queryClient.setQueryData(['projects'], updatedProjects);
      }

      // Optimistically update single project
      if (previousProject) {
        const updatedProject = {
          ...previousProject,
          supportedLanguages: (previousProject.supportedLanguages || []).filter((lang: string) => lang !== languageCode)
        };
        queryClient.setQueryData(['project', projectId], updatedProject);
      }

      // Optimistically remove translations for the removed language from all translation keys
      allTranslationQueries.forEach(([queryKey, data]) => {
        if (data) {
          const updatedKeys = data.map((key: any) => {
            if (key.projectId === projectId && key.translations[languageCode]) {
              const updatedTranslations = { ...key.translations };
              delete updatedTranslations[languageCode];
              return { ...key, translations: updatedTranslations };
            }
            return key;
          });
          queryClient.setQueryData(queryKey, updatedKeys);
        }
      });

      return { previousProjects, previousProject, allTranslationQueries };
    },
    onError: (error, { projectId }, context) => {
      // Rollback on error
      if (context?.previousProjects) {
        queryClient.setQueryData(['projects'], context.previousProjects);
      }
      if (context?.previousProject) {
        queryClient.setQueryData(['project', projectId], context.previousProject);
      }
      
      // Rollback translation key changes
      if (context?.allTranslationQueries) {
        context.allTranslationQueries.forEach(([queryKey, data]) => {
          if (data) {
            queryClient.setQueryData(queryKey, data);
          }
        });
      }
      
      console.error('Failed to remove language:', error);
    },
    onSuccess: (_, { projectId }) => {
      // Invalidate project queries to refresh supported languages
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['project', projectId] });
      queryClient.invalidateQueries({ queryKey: ['project-stats', projectId] });
      // Also invalidate translation keys as they might need to be updated
      queryClient.invalidateQueries({ queryKey: ['translationKeys'] });
    },
  });
}; 
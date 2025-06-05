import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { translationApi, projectApi } from '../lib/api';
import type { 
  TranslationKey, 
  CreateTranslationKeyRequest, 
  UpdateTranslationRequest,
  Project,
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
    onSuccess: (newKey) => {
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
    },
    onError: (error) => {
      console.error('Failed to create translation key:', error);
    },
  });
}

// Update translation key mutation
export function useUpdateTranslationKey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: translationApi.updateTranslationKey,
    onMutate: async (variables) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({
        queryKey: translationKeys.detail(variables.id),
      });
      await queryClient.cancelQueries({
        queryKey: translationKeys.lists(),
      });

      // Snapshot previous values
      const previousKey = queryClient.getQueryData<TranslationKey>(
        translationKeys.detail(variables.id)
      );
      const previousKeys = queryClient.getQueryData<TranslationKey[]>(
        translationKeys.lists()
      );

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

        queryClient.setQueryData(translationKeys.detail(variables.id), optimisticKey);
        
        if (previousKeys) {
          queryClient.setQueryData(
            translationKeys.lists(),
            previousKeys.map(key => key.id === variables.id ? optimisticKey : key)
          );
        }
      }

      return { previousKey, previousKeys };
    },
    onError: (error, variables, context) => {
      // Rollback on error
      if (context?.previousKey) {
        queryClient.setQueryData(
          translationKeys.detail(variables.id),
          context.previousKey
        );
      }
      if (context?.previousKeys) {
        queryClient.setQueryData(translationKeys.lists(), context.previousKeys);
      }
      console.error('Failed to update translation key:', error);
    },
    onSettled: (data, error, variables) => {
      // Always refetch after mutation
      queryClient.invalidateQueries({
        queryKey: translationKeys.detail(variables.id),
      });
      queryClient.invalidateQueries({
        queryKey: translationKeys.lists(),
      });
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
    },
  });
} 
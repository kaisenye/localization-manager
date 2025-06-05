'use client';

import React, { useMemo } from 'react';
import { useTranslationKeys } from '../../hooks/useTranslations';
import { useTranslationStore } from '../../store/translationStore';
import { TranslationKeyCard } from './TranslationKeyCard';
import { ProjectAnalyticsCard } from './ProjectAnalyticsCard';
import { Loader2 } from 'lucide-react';

export function TranslationKeyManager() {
  const { 
    currentProject, 
    filter
  } = useTranslationStore();
  
  const { data: translationKeys, isLoading, error } = useTranslationKeys(currentProject?.id);

  // Filter translation keys based on current filter state
  const filteredKeys = useMemo(() => {
    if (!translationKeys) return [];
    
    let filtered = [...translationKeys];
    
    // Apply search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      filtered = filtered.filter(key => 
        key.key.toLowerCase().includes(searchLower) ||
        key.description?.toLowerCase().includes(searchLower) ||
        Object.values(key.translations).some(translation => 
          translation.value.toLowerCase().includes(searchLower)
        )
      );
    }
    
    // Apply category filter
    if (filter.categories.length > 0) {
      filtered = filtered.filter(key => 
        key.category && filter.categories.includes(key.category)
      );
    }
    
    // Apply language filter
    if (filter.languages.length > 0) {
      filtered = filtered.filter(key => 
        filter.languages.some(lang => key.translations[lang])
      );
    }
    
    return filtered;
  }, [translationKeys, filter]);

  const getHeaderTitle = () => {
    if (!currentProject) return 'Translation Keys';
    return `${currentProject.name} - Translation Keys`;
  };

  const getHeaderSubtitle = () => {
    if (!currentProject) return 'Select a project to view translation keys';
    if (isLoading) return 'Loading...';
    if (!translationKeys || translationKeys.length === 0) return 'No translation keys found in this project';
    
    const totalKeys = translationKeys.length;
    const filteredCount = filteredKeys.length;
    
    if (totalKeys === filteredCount) {
      return `${totalKeys} translation key${totalKeys !== 1 ? 's' : ''}`;
    } else {
      return `${filteredCount} of ${totalKeys} translation key${totalKeys !== 1 ? 's' : ''}`;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-stone-500" />
        <span className="ml-2 text-stone-600 dark:text-stone-400">Loading translation keys...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400 mb-4">
          Failed to load translation keys
        </p>
        <p className="text-stone-500 dark:text-stone-400 text-sm">
          {error instanceof Error ? error.message : 'An unexpected error occurred'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-stone-800 dark:text-stone-200">
          {getHeaderTitle()}
        </h1>
        <p className="text-stone-600 dark:text-stone-400 mt-1">
          {getHeaderSubtitle()}
        </p>
        
        {/* Analytics Card */}
        {currentProject && (
          <ProjectAnalyticsCard projectId={currentProject.id} />
        )}
      </div>

      {/* Translation Keys List */}
      {!currentProject ? (
        <div className="text-center py-12">
          <p className="text-stone-500 dark:text-stone-400">
            Please select a project from the sidebar to view translation keys.
          </p>
        </div>
      ) : filteredKeys.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-stone-500 dark:text-stone-400">
            {translationKeys && translationKeys.length > 0 
              ? 'No translation keys match your current filters.'
              : 'No translation keys found in this project.'
            }
          </p>
          {translationKeys && translationKeys.length > 0 && (
            <p className="text-stone-400 dark:text-stone-500 text-sm mt-2">
              Try adjusting your search or filter criteria.
            </p>
          )}
        </div>
      ) : (
        <div className="grid gap-4">
          {filteredKeys.map((translationKey) => (
            <TranslationKeyCard
              key={translationKey.id}
              translationKey={translationKey}
              supportedLanguages={currentProject.supportedLanguages}
              defaultLanguage={currentProject.defaultLanguage}
            />
          ))}
        </div>
      )}
    </div>
  );
} 
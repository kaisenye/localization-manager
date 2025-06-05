'use client';

import React, { useMemo, useState } from 'react';
import { Copy, MoreHorizontal, Plus, Trash2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { TranslationEditor } from './TranslationEditor';
import { useTranslationKeys, useDeleteTranslationKey } from '../../hooks/userTranslations';
import { useTranslationStore } from '../../store/translationStore';
import { filterTranslationKeys } from '../../lib/utils';
import type { TranslationKey } from '../../types/translation';

export function TranslationKeyManager() {
  const { currentProject, filter, languages } = useTranslationStore();
  const { data: allKeys = [], isLoading, error } = useTranslationKeys(currentProject?.id);

  // Filter keys based on current filter state
  const filteredKeys = useMemo(() => {
    return filterTranslationKeys(allKeys, filter);
  }, [allKeys, filter]);

  const activeLanguages = languages.filter(lang => lang.isActive);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-stone-700 dark:text-stone-300">
            Translation Keys
          </h2>
        </div>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded w-1/4 mb-2"></div>
              <div className="h-20 bg-stone-100 dark:bg-stone-800 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 dark:text-red-400 mb-4">
          Failed to load translation keys
        </div>
        <Button onClick={() => window.location.reload()}>
          Try Again
        </Button>
      </div>
    );
  }

  const getHeaderTitle = () => {
    if (currentProject) {
      return `${currentProject.name} - Translation Keys`;
    }
    return 'All Translation Keys';
  };

  const getHeaderSubtitle = () => {
    if (currentProject) {
      return `${filteredKeys.length} of ${allKeys.length} keys in this project`;
    }
    return `${filteredKeys.length} of ${allKeys.length} keys across all projects`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-700 dark:text-stone-300">
            {getHeaderTitle()}
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {getHeaderSubtitle()}
          </p>
        </div>
      </div>

      {/* Translation Keys List */}
      <div className="space-y-4">
        {filteredKeys.length === 0 ? (
          <div className="text-center py-12 text-stone-500 dark:text-stone-400">
            {filter.search || filter.categories.length > 0 || filter.languages.length > 0 ? (
              <div>
                <p className="mb-2">No translation keys match your filters</p>
                <Button variant="outline" onClick={() => useTranslationStore.getState().clearFilter()}>
                  Clear Filters
                </Button>
              </div>
            ) : currentProject ? (
              <div>
                <p className="mb-2">No translation keys found in this project</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Key
                </Button>
              </div>
            ) : (
              <div>
                <p className="mb-2">No translation keys found</p>
                <p className="text-xs mb-4">Select a project from the sidebar to get started</p>
              </div>
            )}
          </div>
        ) : (
          filteredKeys.map((translationKey) => (
            <TranslationKeyCard
              key={translationKey.id}
              translationKey={translationKey}
              languages={activeLanguages}
            />
          ))
        )}
      </div>
    </div>
  );
}

interface TranslationKeyCardProps {
  translationKey: TranslationKey;
  languages: Array<{ code: string; name: string; nativeName: string }>;
}

function TranslationKeyCard({ 
  translationKey, 
  languages
}: TranslationKeyCardProps) {
  const [showActions, setShowActions] = useState(false);
  const [copied, setCopied] = useState(false);
  const deleteKeyMutation = useDeleteTranslationKey();

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(translationKey.id);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error('Failed to copy ID:', error);
    }
  };

  const handleDelete = async () => {
    if (confirm(`Are you sure you want to delete the translation key "${translationKey.key}"?`)) {
      try {
        await deleteKeyMutation.mutateAsync(translationKey.id);
        setShowActions(false);
      } catch (error) {
        console.error('Failed to delete key:', error);
      }
    }
  };

  return (
    <div className="border rounded-lg p-4 transition-all hover:shadow-md border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800">
      {/* Key Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="font-mono text-sm font-medium text-stone-900 dark:text-stone-100">
              {translationKey.key}
            </h3>
            <span className="px-2 py-0.5 text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 rounded">
              {translationKey.category}
            </span>
          </div>
          {translationKey.description && (
            <p className="text-sm text-stone-600 dark:text-stone-400">
              {translationKey.description}
            </p>
          )}
        </div>
        
        <div className="flex items-center gap-1 relative">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={handleCopyId}
            title="Copy ID"
          >
            {copied ? <Check className="h-3 w-3 text-green-600" /> : <Copy className="h-3 w-3" />}
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setShowActions(!showActions)}
            title="More actions"
          >
            <MoreHorizontal className="h-3 w-3" />
          </Button>
          
          {/* Actions Dropdown */}
          {showActions && (
            <div className="absolute right-0 top-8 z-10 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-md shadow-lg py-1 min-w-[120px]">
              <button
                onClick={handleDelete}
                disabled={deleteKeyMutation.isPending}
                className="w-full px-3 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center gap-2 disabled:opacity-50"
              >
                <Trash2 className="h-3 w-3" />
                Delete
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Translations Grid */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(languages.length, 2)}, 1fr)` }}>
        {languages.map((language) => (
          <div key={language.code} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-stone-500 dark:text-stone-400 uppercase">
                {language.code}
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {language.nativeName}
              </span>
            </div>
            <TranslationEditor
              translationKey={translationKey}
              languageCode={language.code}
            />
          </div>
        ))}
      </div>
      
      {/* Click outside to close actions */}
      {showActions && (
        <div 
          className="fixed inset-0 z-5" 
          onClick={() => setShowActions(false)}
        />
      )}
    </div>
  );
} 
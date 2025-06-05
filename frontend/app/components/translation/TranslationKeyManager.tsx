'use client';

import React, { useMemo } from 'react';
import { Copy, MoreHorizontal, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { TranslationEditor } from './TranslationEditor';
import { useTranslationKeys } from '../../hooks/userTranslations';
import { useTranslationStore } from '../../store/translationStore';
import { filterTranslationKeys } from '../../lib/utils';
import type { TranslationKey } from '../../types/translation';

export function TranslationKeyManager() {
  const { data: allKeys = [], isLoading, error } = useTranslationKeys();
  const { filter, languages, selectedKeys, selectKey, clearSelection } = useTranslationStore();

  // Filter keys based on current filter state
  const filteredKeys = useMemo(() => {
    return filterTranslationKeys(allKeys, filter);
  }, [allKeys, filter]);

  const activeLanguages = languages.filter(lang => lang.isActive);

  const handleSelectKey = (keyId: string, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      selectKey(keyId);
    } else {
      clearSelection();
      selectKey(keyId);
    }
  };

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-stone-700 dark:text-stone-300">
            Translation Keys
          </h2>
          <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
            {filteredKeys.length} of {allKeys.length} keys
            {selectedKeys.length > 0 && ` • ${selectedKeys.length} selected`}
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
            ) : (
              <div>
                <p className="mb-2">No translation keys found</p>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Key
                </Button>
              </div>
            )}
          </div>
        ) : (
          filteredKeys.map((translationKey) => (
            <TranslationKeyCard
              key={translationKey.id}
              translationKey={translationKey}
              languages={activeLanguages}
              isSelected={selectedKeys.includes(translationKey.id)}
              onSelect={(event) => handleSelectKey(translationKey.id, event)}
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
  isSelected: boolean;
  onSelect: (event: React.MouseEvent) => void;
}

function TranslationKeyCard({ 
  translationKey, 
  languages, 
  isSelected, 
  onSelect 
}: TranslationKeyCardProps) {
  return (
    <div 
      className={`border rounded-lg p-4 transition-all hover:shadow-md ${
        isSelected 
          ? 'border-stone-400 dark:border-stone-500 bg-stone-50 dark:bg-stone-800/50' 
          : 'border-stone-200 dark:border-stone-700 bg-white dark:bg-stone-800'
      }`}
      onClick={onSelect}
    >
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
        
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <Copy className="h-3 w-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
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
    </div>
  );
} 
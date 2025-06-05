'use client';

import React, { useState, useCallback } from 'react';
import { Search, Filter, X, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useTranslationStore } from '../../store/translationStore';
import { useCategories } from '../../hooks/useTranslations';
import { debounce } from '../../lib/utils';
import { AddKeyDialog } from './AddKeyDialog';
import { LanguageManager } from './LanguageManager';

export function Toolbar() {
  const { 
    filter, 
    setFilter, 
    clearFilter, 
    setSearch, 
    languages,
    currentProject
  } = useTranslationStore();
  const { data: categories = [] } = useCategories(currentProject?.id);
  const [showFilters, setShowFilters] = useState(false);
  const [showAddKeyDialog, setShowAddKeyDialog] = useState(false);

  // Debounced search to avoid too many updates
  const debouncedSearch = useCallback(
    debounce((value: string) => {
      setSearch(value);
    }, 300),
    [setSearch]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleCategoryToggle = (category: string) => {
    const newCategories = filter.categories.includes(category)
      ? filter.categories.filter(c => c !== category)
      : [...filter.categories, category];
    
    setFilter({ categories: newCategories });
  };

  const handleLanguageToggle = (languageCode: string) => {
    const newLanguages = filter.languages.includes(languageCode)
      ? filter.languages.filter(l => l !== languageCode)
      : [...filter.languages, languageCode];
    
    setFilter({ languages: newLanguages });
  };

  const handleAddKey = () => {
    if (!currentProject) {
      alert('Please select a project first');
      return;
    }
    setShowAddKeyDialog(true);
  };

  const activeFiltersCount = filter.categories.length + filter.languages.length;
  const hasActiveFilters = activeFiltersCount > 0 || filter.search;

  return (
    <>
      <div className="space-y-4">
        {/* Main Toolbar */}
        <div className="flex items-center gap-4">
          {/* Search Bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500" />
            <input
              type="text"
              placeholder="Search translation keys, values, or descriptions..."
              className="w-full pl-10 pr-4 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
              onChange={handleSearchChange}
              defaultValue={filter.search}
            />
          </div>

          {/* Filter Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2 shrink-0"
          >
            <Filter className="h-4 w-4" />
            Filters
            {activeFiltersCount > 0 && (
              <span className="ml-1 px-2 py-0.5 text-xs bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 rounded-full">
                {activeFiltersCount}
              </span>
            )}
          </Button>

          {/* Clear Filters */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilter}
              className="flex items-center gap-1 text-stone-500 hover:text-stone-700 dark:hover:text-stone-300 shrink-0"
            >
              <X className="h-3 w-3" />
              Clear all
            </Button>
          )}

          {/* Add Key Button */}
          <Button 
            size="sm" 
            className="shrink-0"
            onClick={handleAddKey}
            disabled={!currentProject}
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Key
          </Button>

          {/* Language Manager Button */}
          {currentProject && (
            <LanguageManager
              projectId={currentProject.id}
              supportedLanguages={currentProject.supportedLanguages}
              defaultLanguage={currentProject.defaultLanguage}
            />
          )}
        </div>

        {/* Search Status */}
        {filter.search && (
          <div className="text-sm text-stone-500 dark:text-stone-400">
            Searching for "{filter.search}"
          </div>
        )}

        {/* Filter Panel */}
        {showFilters && (
          <div className="p-4 border border-stone-200 dark:border-stone-700 rounded-lg bg-stone-50 dark:bg-stone-800/50 space-y-4">
            {/* Categories Filter */}
            <div>
              <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {categories.map((category) => (
                  <button
                    key={category}
                    onClick={() => handleCategoryToggle(category)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filter.categories.includes(category)
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Languages Filter */}
            <div>
              <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-2">
                Languages
              </h3>
              <div className="flex flex-wrap gap-2">
                {languages.filter(lang => lang.isActive).map((language) => (
                  <button
                    key={language.code}
                    onClick={() => handleLanguageToggle(language.code)}
                    className={`px-3 py-1 text-sm rounded-full border transition-colors ${
                      filter.languages.includes(language.code)
                        ? 'bg-stone-900 dark:bg-stone-100 text-white dark:text-stone-900 border-stone-900 dark:border-stone-100'
                        : 'bg-white dark:bg-stone-800 text-stone-700 dark:text-stone-300 border-stone-300 dark:border-stone-600 hover:bg-stone-100 dark:hover:bg-stone-700'
                    }`}
                  >
                    {language.nativeName} ({language.code.toUpperCase()})
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Key Dialog */}
      <AddKeyDialog 
        open={showAddKeyDialog} 
        onOpenChange={setShowAddKeyDialog} 
      />
    </>
  );
} 
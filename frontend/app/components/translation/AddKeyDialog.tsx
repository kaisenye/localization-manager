'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { useTranslationStore } from '../../store/translationStore';
import { useCreateTranslationKey } from '../../hooks/useTranslations';
import { getLanguageDisplayName } from '../../lib/languages';

interface AddKeyDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AddKeyDialog({ open, onOpenChange }: AddKeyDialogProps) {
  const { currentProject } = useTranslationStore();
  const createKeyMutation = useCreateTranslationKey();
  
  const [formData, setFormData] = useState({
    key: '',
    category: '',
    description: '',
    translations: {} as Record<string, string>
  });

  // Use project's supported languages instead of global active languages
  const supportedLanguages = currentProject?.supportedLanguages || [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentProject) {
      alert('Please select a project first');
      return;
    }

    if (!formData.key.trim()) {
      alert('Translation key is required');
      return;
    }

    if (!formData.category.trim()) {
      alert('Category is required');
      return;
    }

    // Ensure at least one translation is provided
    const hasTranslations = Object.values(formData.translations).some(value => value.trim());
    if (!hasTranslations) {
      alert('At least one translation is required');
      return;
    }

    try {
      const requestData = {
        projectId: currentProject.id,
        key: formData.key.trim(),
        category: formData.category.trim(),
        description: formData.description.trim() || undefined,
        translations: Object.fromEntries(
          Object.entries(formData.translations).filter(([_, value]) => value.trim())
        )
      };

      await createKeyMutation.mutateAsync(requestData);

      // Reset form and close dialog
      setFormData({
        key: '',
        category: '',
        description: '',
        translations: {}
      });
      onOpenChange(false);
    } catch (error) {
      console.error('Failed to create translation key:', error);
      alert('Failed to create translation key. Please try again.');
    }
  };

  const handleTranslationChange = (languageCode: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      translations: {
        ...prev.translations,
        [languageCode]: value
      }
    }));
  };

  const handleClose = () => {
    setFormData({
      key: '',
      category: '',
      description: '',
      translations: {}
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl">
        <DialogHeader>
          <DialogTitle>Add Translation Key</DialogTitle>
          <DialogClose onClose={handleClose} />
        </DialogHeader>

        <form onSubmit={handleSubmit} className="p-6 pt-0 space-y-4">
          {/* Project Info */}
          {currentProject && (
            <div className="p-3 bg-stone-50 dark:bg-stone-800 rounded-md">
              <p className="text-sm text-stone-600 dark:text-stone-400">
                Adding to project: <span className="font-medium text-stone-900 dark:text-stone-100">{currentProject.name}</span>
              </p>
            </div>
          )}

          {/* Split Layout: Fixed Fields (Left) and Languages (Right) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column: Fixed Fields */}
            <div className="space-y-4">
              {/* Key Field */}
              <div>
                <label htmlFor="key" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Translation Key *
                </label>
                <input
                  id="key"
                  type="text"
                  value={formData.key}
                  onChange={(e) => setFormData(prev => ({ ...prev, key: e.target.value }))}
                  placeholder="e.g., button.save, navigation.home"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Category Field */}
              <div>
                <label htmlFor="category" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Category *
                </label>
                <input
                  id="category"
                  type="text"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="e.g., buttons, navigation, forms"
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                  required
                />
              </div>

              {/* Description Field */}
              <div>
                <label htmlFor="description" className="block text-sm font-medium text-stone-700 dark:text-stone-300 mb-1">
                  Description
                </label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Optional description of this translation key"
                  rows={4}
                  className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent resize-none"
                />
              </div>
            </div>

            {/* Right Column: Scrollable Languages */}
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
                Translations
                {supportedLanguages.length > 0 && (
                  <span className="text-xs text-stone-500 dark:text-stone-400 ml-2">
                    ({supportedLanguages.length} languages)
                  </span>
                )}
              </h3>
              
              {!currentProject ? (
                <div className="text-sm text-stone-500 dark:text-stone-400 text-center py-8 border border-dashed border-stone-300 dark:border-stone-600 rounded-md">
                  Please select a project first
                </div>
              ) : supportedLanguages.length === 0 ? (
                <div className="text-sm text-stone-500 dark:text-stone-400 text-center py-8 border border-dashed border-stone-300 dark:border-stone-600 rounded-md">
                  No supported languages configured for this project. 
                  <br />
                  Please add languages to the project first.
                </div>
              ) : (
                <div className="max-h-80 overflow-y-auto pr-2 space-y-3 border border-stone-200 dark:border-stone-700 rounded-md p-4 bg-stone-50/50 dark:bg-stone-800/50">
                  {supportedLanguages.map((languageCode) => (
                    <div key={languageCode} className="bg-white dark:bg-stone-800 p-3 rounded-md border border-stone-200 dark:border-stone-700">
                      <label className="block text-sm font-medium text-stone-600 dark:text-stone-400 mb-2">
                        {getLanguageDisplayName(languageCode)} ({languageCode.toUpperCase()})
                      </label>
                      <input
                        type="text"
                        value={formData.translations[languageCode] || ''}
                        onChange={(e) => handleTranslationChange(languageCode, e.target.value)}
                        placeholder={`Enter ${getLanguageDisplayName(languageCode)} translation`}
                        className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 placeholder:text-stone-500 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-stone-200 dark:border-stone-700">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={createKeyMutation.isPending}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createKeyMutation.isPending || !currentProject}
            >
              {createKeyMutation.isPending ? 'Creating...' : 'Create Key'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
} 
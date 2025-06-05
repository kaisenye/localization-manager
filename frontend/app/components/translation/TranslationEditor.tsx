'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Check, X, Edit3, Loader2 } from 'lucide-react';
import { Button } from '../ui/button';
import { useUpdateTranslationKey } from '../../hooks/useTranslations';
import { useTranslationStore } from '../../store/translationStore';
import { formatDate } from '../../lib/utils';
import type { TranslationKey } from '../../types/translation';

interface TranslationEditorProps {
  translationKey: TranslationKey;
  languageCode: string;
  onEditStart?: () => void;
  onEditEnd?: () => void;
}

export function TranslationEditor({ 
  translationKey, 
  languageCode, 
  onEditStart, 
  onEditEnd 
}: TranslationEditorProps) {
  const { editingKey, setEditingKey } = useTranslationStore();
  const updateMutation = useUpdateTranslationKey();
  
  const [isEditing, setIsEditing] = useState(false);
  const [value, setValue] = useState('');
  const [originalValue, setOriginalValue] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  const translation = translationKey.translations[languageCode];
  const isCurrentlyEditing = editingKey === `${translationKey.id}-${languageCode}`;

  useEffect(() => {
    if (translation) {
      setValue(translation.value);
      setOriginalValue(translation.value);
    } else {
      // Initialize empty values for new translations
      setValue('');
      setOriginalValue('');
    }
  }, [translation]);

  useEffect(() => {
    if (isCurrentlyEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isCurrentlyEditing]);

  const handleEditStart = () => {
    setIsEditing(true);
    setEditingKey(`${translationKey.id}-${languageCode}`);
    // Initialize value for new translations
    if (!translation) {
      setValue('');
      setOriginalValue('');
    }
    onEditStart?.();
  };

  const handleEditEnd = () => {
    setIsEditing(false);
    setEditingKey(null);
    // Reset to original value or empty if no translation exists
    setValue(translation?.value || '');
    onEditEnd?.();
  };

  const handleSave = async () => {
    const trimmedValue = value.trim();
    
    // Don't save if value is empty or unchanged
    if (!trimmedValue || trimmedValue === originalValue.trim()) {
      handleEditEnd();
      return;
    }

    try {
      await updateMutation.mutateAsync({
        id: translationKey.id,
        translations: {
          [languageCode]: trimmedValue
        }
      });
      
      setOriginalValue(trimmedValue);
      setIsEditing(false);
      setEditingKey(null);
      onEditEnd?.();
    } catch (error) {
      console.error('Failed to save translation:', error);
      // Keep editing mode on error
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleEditEnd();
    }
  };

  // Check editing state first, regardless of whether translation exists
  if (isCurrentlyEditing) {
    return (
      <div className="space-y-2">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent"
            placeholder="Enter translation..."
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleSave}
              disabled={updateMutation.isPending}
              className="h-6 w-6 p-0 text-green-600 hover:text-green-700 hover:bg-green-50 dark:hover:bg-green-900/20"
            >
              {updateMutation.isPending ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <Check className="h-3 w-3" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleEditEnd}
              disabled={updateMutation.isPending}
              className="h-6 w-6 p-0 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20"
            >
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
        <div className="text-xs text-stone-500 dark:text-stone-400">
          Press Enter to save, Escape to cancel
        </div>
      </div>
    );
  }

  if (!translation) {
    return (
      <div className="group relative">
        <div 
          className="min-h-[2.5rem] flex items-center px-3 py-2 text-stone-400 dark:text-stone-500 italic border border-dashed border-stone-300 dark:border-stone-600 rounded cursor-pointer hover:border-stone-400 dark:hover:border-stone-500 hover:bg-stone-50 dark:hover:bg-stone-700/50 transition-colors"
          onClick={handleEditStart}
        >
          Click to add translation...
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditStart}
          className="absolute right-1 top-1 opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      </div>
    );
  }

  return (
    <div className="group relative">
      <div className="min-h-[2.5rem] flex items-center px-3 py-2 bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded hover:border-stone-300 dark:hover:border-stone-600 transition-colors">
        <div className="flex-1">
          <div className="text-stone-900 dark:text-stone-100">
            {translation.value}
          </div>
          <div className="text-xs text-stone-500 dark:text-stone-400 mt-1">
            Updated {formatDate(translation.updatedAt)} by {translation.updatedBy}
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleEditStart}
          className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 p-0 ml-2"
        >
          <Edit3 className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
} 
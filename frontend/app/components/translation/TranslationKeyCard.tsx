'use client';

import React, { useState } from 'react';
import { Copy, MoreHorizontal, Trash2, Check } from 'lucide-react';
import { Button } from '../ui/button';
import { TranslationEditor } from './TranslationEditor';
import { useDeleteTranslationKey } from '../../hooks/useTranslations';
import type { TranslationKey } from '../../types/translation';

interface TranslationKeyCardProps {
  translationKey: TranslationKey;
  supportedLanguages: string[];
  defaultLanguage: string;
}

export function TranslationKeyCard({ 
  translationKey, 
  supportedLanguages,
  defaultLanguage
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

  // Get language display name from the available languages list
  const getLanguageDisplayName = (code: string) => {
    // You can expand this with a proper language mapping if needed
    const languageNames: Record<string, string> = {
      'en': 'English',
      'es': 'Español',
      'fr': 'Français',
      'de': 'Deutsch',
      'it': 'Italiano',
      'pt': 'Português',
      'ru': 'Русский',
      'ja': '日本語',
      'ko': '한국어',
      'zh': '中文',
      'zh-tw': '中文 (繁體)',
      'ar': 'العربية',
      'hi': 'हिन्दी',
      'th': 'ไทย',
      'vi': 'Tiếng Việt',
      'tr': 'Türkçe',
      'pl': 'Polski',
      'nl': 'Nederlands',
      'sv': 'Svenska',
      'da': 'Dansk',
      'no': 'Norsk',
      'fi': 'Suomi',
      'he': 'עברית',
      'cs': 'Čeština',
      'hu': 'Magyar',
      'ro': 'Română',
      'bg': 'Български',
      'hr': 'Hrvatski',
      'sk': 'Slovenčina',
      'sl': 'Slovenščina',
      'et': 'Eesti',
      'lv': 'Latviešu',
      'lt': 'Lietuvių',
      'uk': 'Українська',
      'el': 'Ελληνικά',
      'id': 'Bahasa Indonesia',
      'ms': 'Bahasa Melayu',
      'tl': 'Filipino',
      'sw': 'Kiswahili',
      'af': 'Afrikaans',
    };
    
    return languageNames[code] || code.toUpperCase();
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
            {translationKey.category && (
              <span className="px-2 py-0.5 text-xs bg-stone-100 dark:bg-stone-700 text-stone-600 dark:text-stone-400 rounded">
                {translationKey.category}
              </span>
            )}
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

      {/* Translations Grid - Show ALL supported languages */}
      <div className="grid gap-3" style={{ gridTemplateColumns: `repeat(${Math.min(supportedLanguages.length, 3)}, 1fr)` }}>
        {supportedLanguages.map((languageCode) => (
          <div key={languageCode} className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`text-xs font-medium uppercase ${
                languageCode === defaultLanguage 
                  ? 'text-blue-600 dark:text-blue-400' 
                  : 'text-stone-500 dark:text-stone-400'
              }`}>
                {languageCode}
              </span>
              <span className="text-xs text-stone-400 dark:text-stone-500">
                {getLanguageDisplayName(languageCode)}
              </span>
              {languageCode === defaultLanguage && (
                <span className="text-xs text-blue-500 dark:text-blue-400">(default)</span>
              )}
              {!translationKey.translations[languageCode] && (
                <span className="text-xs text-amber-500 dark:text-amber-400">(missing)</span>
              )}
            </div>
            <TranslationEditor
              translationKey={translationKey}
              languageCode={languageCode}
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
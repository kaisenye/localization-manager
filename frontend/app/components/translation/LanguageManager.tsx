'use client';

import React, { useState } from 'react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogClose } from '../ui/dialog';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Languages, Plus, X, ChevronDown } from 'lucide-react';
import { useAddProjectLanguage, useRemoveProjectLanguage } from '../../hooks/useTranslations';
import { AVAILABLE_LANGUAGES } from '../../lib/languages';

interface LanguageManagerProps {
  projectId: string;
  supportedLanguages: string[];
  defaultLanguage: string;
}

export const LanguageManager: React.FC<LanguageManagerProps> = ({
  projectId,
  supportedLanguages,
  defaultLanguage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState('');
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const addLanguageMutation = useAddProjectLanguage();
  const removeLanguageMutation = useRemoveProjectLanguage();

  const isAdding = addLanguageMutation.isPending;

  // Filter out already supported languages
  const availableLanguages = AVAILABLE_LANGUAGES.filter(
    lang => !supportedLanguages.includes(lang.code)
  );

  const showMessage = (type: 'success' | 'error', text: string) => {
    setMessage({ type, text });
    setTimeout(() => setMessage(null), 3000);
  };

  // Create a display format for badges that includes both native name and code
  const getBadgeDisplayName = (code: string) => {
    const language = AVAILABLE_LANGUAGES.find(lang => lang.code === code);
    return language ? `${language.nativeName} (${code.toUpperCase()})` : code.toUpperCase();
  };

  const handleAddLanguage = async () => {
    if (!selectedLanguage) return;
    
    try {
      await addLanguageMutation.mutateAsync({
        projectId,
        languageCode: selectedLanguage
      });
      setSelectedLanguage('');
      showMessage('success', 'Language added successfully!');
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to add language');
    }
  };

  const handleRemoveLanguage = async (languageCode: string) => {
    if (languageCode === defaultLanguage) {
      showMessage('error', 'Cannot remove the default language');
      return;
    }

    try {
      await removeLanguageMutation.mutateAsync({
        projectId,
        languageCode
      });
      showMessage('success', 'Language removed successfully!');
    } catch (error) {
      showMessage('error', error instanceof Error ? error.message : 'Failed to remove language');
    }
  };

  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
        <Languages className="h-4 w-4 mr-2" />
        Manage Languages
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Manage Project Languages</DialogTitle>
            <DialogClose onClose={() => setIsOpen(false)} />
          </DialogHeader>
          
          <div className="space-y-4 p-6 pt-0">
            {/* Message Display */}
            {message && (
              <div className={`p-3 rounded-md text-sm ${
                message.type === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {message.text}
              </div>
            )}

            {/* Current Languages */}
            <div>
              <Label className="text-sm font-medium">Supported Languages</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {supportedLanguages.map((lang) => (
                  <Badge
                    key={lang}
                    variant={lang === defaultLanguage ? "default" : "secondary"}
                    className="flex items-center gap-1"
                  >
                    {getBadgeDisplayName(lang)}
                    {lang === defaultLanguage && (
                      <span className="text-xs ml-1">(default)</span>
                    )}
                    {lang !== defaultLanguage && (
                      <button
                        onClick={() => handleRemoveLanguage(lang)}
                        disabled={removeLanguageMutation.isPending}
                        className="ml-1 hover:bg-red-500 hover:text-white rounded-full p-0.5 transition-colors"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    )}
                  </Badge>
                ))}
              </div>
            </div>

            {/* Add New Language */}
            {availableLanguages.length > 0 ? (
              <div className="space-y-2">
                <Label htmlFor="language-select" className="text-sm font-medium">
                  Add New Language
                </Label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <select
                      id="language-select"
                      value={selectedLanguage}
                      onChange={(e) => setSelectedLanguage(e.target.value)}
                      disabled={isAdding}
                      className="w-full px-3 py-2 border border-stone-300 dark:border-stone-600 rounded-md bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 focus:outline-none focus:ring-2 focus:ring-stone-500 focus:border-transparent appearance-none pr-8"
                    >
                      <option value="">Select a language...</option>
                      {availableLanguages.map((language) => (
                        <option key={language.code} value={language.code}>
                          {language.nativeName} ({language.name}) - {language.code.toUpperCase()}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-stone-500 pointer-events-none" />
                  </div>
                  <Button
                    onClick={handleAddLanguage}
                    disabled={isAdding || !selectedLanguage}
                    size="sm"
                  >
                    {isAdding ? (
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    ) : (
                      <Plus className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Select from {availableLanguages.length} available languages
                </p>
              </div>
            ) : (
              <div className="text-sm text-stone-500 dark:text-stone-400 text-center py-4">
                All available languages have been added to this project.
              </div>
            )}

            {/* Help Text */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Default language cannot be removed</p>
              <p>• Removing a language will not delete existing translations</p>
              <p>• Languages are displayed in their native script</p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}; 
// Language mappings with native names
export const LANGUAGE_MAPPINGS: Record<string, { name: string; nativeName: string }> = {
  'en': { name: 'English', nativeName: 'English' },
  'es': { name: 'Spanish', nativeName: 'Español' },
  'fr': { name: 'French', nativeName: 'Français' },
  'de': { name: 'German', nativeName: 'Deutsch' },
  'it': { name: 'Italian', nativeName: 'Italiano' },
  'pt': { name: 'Portuguese', nativeName: 'Português' },
  'ru': { name: 'Russian', nativeName: 'Русский' },
  'ja': { name: 'Japanese', nativeName: '日本語' },
  'ko': { name: 'Korean', nativeName: '한국어' },
  'zh': { name: 'Chinese (Simplified)', nativeName: '中文 (简体)' },
  'zh-tw': { name: 'Chinese (Traditional)', nativeName: '中文 (繁體)' },
  'ar': { name: 'Arabic', nativeName: 'العربية' },
  'hi': { name: 'Hindi', nativeName: 'हिन्दी' },
  'th': { name: 'Thai', nativeName: 'ไทย' },
  'vi': { name: 'Vietnamese', nativeName: 'Tiếng Việt' },
  'tr': { name: 'Turkish', nativeName: 'Türkçe' },
  'pl': { name: 'Polish', nativeName: 'Polski' },
  'nl': { name: 'Dutch', nativeName: 'Nederlands' },
  'sv': { name: 'Swedish', nativeName: 'Svenska' },
  'da': { name: 'Danish', nativeName: 'Dansk' },
  'no': { name: 'Norwegian', nativeName: 'Norsk' },
  'fi': { name: 'Finnish', nativeName: 'Suomi' },
  'he': { name: 'Hebrew', nativeName: 'עברית' },
  'cs': { name: 'Czech', nativeName: 'Čeština' },
  'hu': { name: 'Hungarian', nativeName: 'Magyar' },
  'ro': { name: 'Romanian', nativeName: 'Română' },
  'bg': { name: 'Bulgarian', nativeName: 'Български' },
  'hr': { name: 'Croatian', nativeName: 'Hrvatski' },
  'sk': { name: 'Slovak', nativeName: 'Slovenčina' },
  'sl': { name: 'Slovenian', nativeName: 'Slovenščina' },
  'et': { name: 'Estonian', nativeName: 'Eesti' },
  'lv': { name: 'Latvian', nativeName: 'Latviešu' },
  'lt': { name: 'Lithuanian', nativeName: 'Lietuvių' },
  'uk': { name: 'Ukrainian', nativeName: 'Українська' },
  'el': { name: 'Greek', nativeName: 'Ελληνικά' },
  'id': { name: 'Indonesian', nativeName: 'Bahasa Indonesia' },
  'ms': { name: 'Malay', nativeName: 'Bahasa Melayu' },
  'tl': { name: 'Filipino', nativeName: 'Filipino' },
  'sw': { name: 'Swahili', nativeName: 'Kiswahili' },
  'af': { name: 'Afrikaans', nativeName: 'Afrikaans' },
};

// Available languages for the dropdown (same as in LanguageManager)
export const AVAILABLE_LANGUAGES = Object.entries(LANGUAGE_MAPPINGS).map(([code, { name, nativeName }]) => ({
  code,
  name,
  nativeName
}));

// Utility functions
export const getLanguageDisplayName = (code: string): string => {
  const language = LANGUAGE_MAPPINGS[code];
  return language ? language.nativeName : code.toUpperCase();
};

export const getLanguageFullName = (code: string): string => {
  const language = LANGUAGE_MAPPINGS[code];
  return language ? language.name : code.toUpperCase();
};

export const getLanguageInfo = (code: string) => {
  return LANGUAGE_MAPPINGS[code] || { name: code.toUpperCase(), nativeName: code.toUpperCase() };
}; 
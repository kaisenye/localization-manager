import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

// Temporary fallback until clsx is installed
type ClassValue = string | number | boolean | undefined | null | { [key: string]: any } | ClassValue[];

export function cn(...inputs: ClassValue[]) {
  // Simple fallback implementation
  return inputs
    .filter(Boolean)
    .map(input => {
      if (typeof input === 'string') return input;
      if (typeof input === 'object' && input !== null) {
        return Object.entries(input)
          .filter(([, value]) => Boolean(value))
          .map(([key]) => key)
          .join(' ');
      }
      return '';
    })
    .join(' ');
}

export function tw(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export function formatDate(date: string | Date): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function generateId(): string {
  return Math.random().toString(36).substring(2) + Date.now().toString(36);
}

export function filterTranslationKeys(
  keys: any[],
  filter: {
    search: string;
    categories: string[];
    languages: string[];
  }
) {
  return keys.filter((key) => {
    // Search filter
    if (filter.search) {
      const searchLower = filter.search.toLowerCase();
      const matchesKey = key.key.toLowerCase().includes(searchLower);
      const matchesDescription = key.description?.toLowerCase().includes(searchLower);
      const matchesTranslations = Object.values(key.translations).some((t: any) =>
        t.value.toLowerCase().includes(searchLower)
      );
      
      if (!matchesKey && !matchesDescription && !matchesTranslations) {
        return false;
      }
    }

    // Category filter
    if (filter.categories.length > 0 && !filter.categories.includes(key.category)) {
      return false;
    }

    // Language filter
    if (filter.languages.length > 0) {
      const hasLanguage = filter.languages.some(lang => 
        key.translations[lang] && key.translations[lang].value
      );
      if (!hasLanguage) {
        return false;
      }
    }

    return true;
  });
} 
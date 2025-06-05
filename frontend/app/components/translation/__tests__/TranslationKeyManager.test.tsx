import { render, screen } from '@testing-library/react';
import { TranslationKeyManager } from '../TranslationKeyManager';
import { useTranslationKeys } from '../../../hooks/useTranslations';
import { useTranslationStore } from '../../../store/translationStore';

// Mock the hooks
jest.mock('../../../hooks/useTranslations');
jest.mock('../../../store/translationStore');

const mockProject = {
  id: '1',
  name: 'Test Project',
  description: 'Test project description',
  translationKeyCount: 2,
  supportedLanguages: ['en', 'es'],
  defaultLanguage: 'en',
};

const mockTranslationKeys = [
  {
    id: '1',
    key: 'welcome.message',
    description: 'Welcome message',
    category: 'general',
    translations: {
      en: { value: 'Welcome to our app!' },
      es: { value: '¡Bienvenido a nuestra aplicación!' },
    },
  },
  {
    id: '2',
    key: 'button.submit',
    description: 'Submit button text',
    category: 'buttons',
    translations: {
      en: { value: 'Submit' },
      es: { value: 'Enviar' },
    },
  },
];

describe('TranslationKeyManager', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock useTranslationKeys hook
    (useTranslationKeys as jest.Mock).mockReturnValue({
      data: mockTranslationKeys,
      isLoading: false,
      error: null,
    });

    // Mock useTranslationStore
    (useTranslationStore as jest.Mock).mockReturnValue({
      currentProject: mockProject,
      filter: {
        search: '',
        categories: [],
        languages: [],
      },
    });
  });

  it('renders loading state correctly', () => {
    (useTranslationKeys as jest.Mock).mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<TranslationKeyManager />);
    expect(screen.getByText('Loading translation keys...')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useTranslationKeys as jest.Mock).mockReturnValue({
      data: null,
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(<TranslationKeyManager />);
    expect(screen.getByText('Failed to load translation keys')).toBeInTheDocument();
  });

  it('renders no project selected state', () => {
    (useTranslationStore as jest.Mock).mockReturnValue({
      currentProject: null,
      filter: {
        search: '',
        categories: [],
        languages: [],
      },
    });

    render(<TranslationKeyManager />);
    expect(screen.getByText('Please select a project from the sidebar to view translation keys.')).toBeInTheDocument();
  });

  it('renders translation keys list correctly', () => {
    render(<TranslationKeyManager />);
    
    // Check header
    expect(screen.getByText(`${mockProject.name} - Translation Keys`)).toBeInTheDocument();
    expect(screen.getByText('2 translation keys')).toBeInTheDocument();
    
    // Check if all translation keys are rendered
    mockTranslationKeys.forEach(key => {
      expect(screen.getByText(key.key)).toBeInTheDocument();
      expect(screen.getByText(key.description)).toBeInTheDocument();
      expect(screen.getByText(key.translations.en.value)).toBeInTheDocument();
      expect(screen.getByText(key.translations.es.value)).toBeInTheDocument();
    });
  });

  it('filters translation keys based on search', () => {
    (useTranslationStore as jest.Mock).mockReturnValue({
      currentProject: mockProject,
      filter: {
        search: 'welcome',
        categories: [],
        languages: [],
      },
    });

    render(<TranslationKeyManager />);
    
    // Only the welcome message should be visible
    expect(screen.getByText('welcome.message')).toBeInTheDocument();
    expect(screen.queryByText('button.submit')).not.toBeInTheDocument();
  });

  it('filters translation keys based on category', () => {
    (useTranslationStore as jest.Mock).mockReturnValue({
      currentProject: mockProject,
      filter: {
        search: '',
        categories: ['buttons'],
        languages: [],
      },
    });

    render(<TranslationKeyManager />);
    
    // Only the button translation should be visible
    expect(screen.queryByText('welcome.message')).not.toBeInTheDocument();
    expect(screen.getByText('button.submit')).toBeInTheDocument();
  });

  it('filters translation keys based on language', () => {
    (useTranslationStore as jest.Mock).mockReturnValue({
      currentProject: mockProject,
      filter: {
        search: '',
        categories: [],
        languages: ['es'],
      },
    });

    render(<TranslationKeyManager />);
    
    // Both keys should be visible as they both have Spanish translations
    expect(screen.getByText('welcome.message')).toBeInTheDocument();
    expect(screen.getByText('button.submit')).toBeInTheDocument();
  });

  it('shows no results message when filters match no keys', () => {
    (useTranslationStore as jest.Mock).mockReturnValue({
      currentProject: mockProject,
      filter: {
        search: 'nonexistent',
        categories: [],
        languages: [],
      },
    });

    render(<TranslationKeyManager />);
    
    expect(screen.getByText('No translation keys match your current filters.')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search or filter criteria.')).toBeInTheDocument();
  });
}); 
import '@testing-library/jest-dom';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ProjectSelector } from '../ProjectSelector';
import { useProjects } from '../../../hooks/useTranslations';
import { useTranslationStore } from '../../../store/translationStore';

// Mock the hooks
jest.mock('../../../hooks/useTranslations');
jest.mock('../../../store/translationStore');

const mockProjects = [
  {
    id: '1',
    name: 'Project 1',
    description: 'Test project 1',
    translationKeyCount: 10,
    supportedLanguages: ['en', 'es'],
  },
  {
    id: '2',
    name: 'Project 2',
    description: 'Test project 2',
    translationKeyCount: 5,
    supportedLanguages: ['en', 'fr'],
  },
];

describe('ProjectSelector', () => {
  beforeEach(() => {
    // Reset all mocks before each test
    jest.clearAllMocks();
    
    // Mock useProjects hook
    (useProjects as jest.Mock).mockReturnValue({
      data: mockProjects,
      isLoading: false,
      error: null,
    });

    // Mock useTranslationStore
    (useTranslationStore as unknown as jest.Mock).mockReturnValue({
      currentProject: null,
      setCurrentProject: jest.fn(),
    });
  });

  it('renders loading state correctly', () => {
    (useProjects as jest.Mock).mockReturnValue({
      data: [],
      isLoading: true,
      error: null,
    });

    render(<ProjectSelector />);
    expect(screen.getByRole('status')).toBeInTheDocument();
  });

  it('renders error state correctly', () => {
    (useProjects as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: new Error('Failed to load'),
    });

    render(<ProjectSelector />);
    expect(screen.getByText('Failed to load projects')).toBeInTheDocument();
  });

  it('renders projects list correctly', () => {
    render(<ProjectSelector />);
    
    // Check if all projects are rendered
    mockProjects.forEach(project => {
      expect(screen.getByText(project.name)).toBeInTheDocument();
      expect(screen.getByText(project.description)).toBeInTheDocument();
      expect(screen.getByText(`${project.translationKeyCount} keys`)).toBeInTheDocument();
      expect(screen.getAllByText(`${project.supportedLanguages.length} langs`).length).toBeGreaterThan(0);
    });
  });

  it('handles project selection', () => {
    const mockSetCurrentProject = jest.fn();
    (useTranslationStore as unknown as jest.Mock).mockReturnValue({
      currentProject: null,
      setCurrentProject: mockSetCurrentProject,
    });

    render(<ProjectSelector />);
    
    // Click on the first project
    fireEvent.click(screen.getByText('Project 1'));
    
    expect(mockSetCurrentProject).toHaveBeenCalledWith(mockProjects[0]);
  });

  it('toggles expansion state', () => {
    render(<ProjectSelector />);
    
    // Initially expanded
    expect(screen.getByText('Project 1')).toBeVisible();
    
    // Click to collapse
    fireEvent.click(screen.getByText('Projects'));
    
    // Check if projects are hidden
    expect(screen.queryByText('Project 1')).toBeNull();
    
    // Click to expand again
    fireEvent.click(screen.getByText('Projects'));
    
    // Check if projects are visible again
    expect(screen.getByText('Project 1')).toBeVisible();
  });

  it('shows "All Projects" option when projects exist', () => {
    render(<ProjectSelector />);
    expect(screen.getByText('All Projects')).toBeInTheDocument();
  });

  it('handles "All Projects" selection', () => {
    const mockSetCurrentProject = jest.fn();
    (useTranslationStore as unknown as jest.Mock).mockReturnValue({
      currentProject: mockProjects[0],
      setCurrentProject: mockSetCurrentProject,
    });

    render(<ProjectSelector />);
    
    // Click on "All Projects"
    fireEvent.click(screen.getByText('All Projects'));
    
    expect(mockSetCurrentProject).toHaveBeenCalledWith(null);
  });

  it('shows empty state when no projects exist', () => {
    (useProjects as jest.Mock).mockReturnValue({
      data: [],
      isLoading: false,
      error: null,
    });

    render(<ProjectSelector />);
    
    expect(screen.getByText('No projects found')).toBeInTheDocument();
    expect(screen.getByText('Create Project')).toBeInTheDocument();
  });
}); 
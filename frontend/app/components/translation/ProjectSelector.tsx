'use client';

import React, { useState } from 'react';
import { ChevronDown, Plus, Settings, Folder, Users } from 'lucide-react';
import { Button } from '../ui/button';
import { useProjects } from '../../hooks/useTranslations';
import { useTranslationStore } from '../../store/translationStore';
import type { Project } from '../../types/translation';

export function ProjectSelector() {
  const { data: projects = [], isLoading, error } = useProjects();
  const { currentProject, setCurrentProject } = useTranslationStore();
  const [isExpanded, setIsExpanded] = useState(true);

  const handleProjectSelect = (project: Project) => {
    setCurrentProject(project);
  };

  if (isLoading) {
    return (
      <div className="space-y-2">
        <div className="h-4 bg-stone-200 dark:bg-stone-700 rounded animate-pulse"></div>
        <div className="h-8 bg-stone-100 dark:bg-stone-800 rounded animate-pulse"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-sm text-red-600 dark:text-red-400">
        Failed to load projects
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex items-center gap-2 text-sm font-medium text-stone-700 dark:text-stone-300 hover:text-stone-900 dark:hover:text-stone-100"
        >
          <ChevronDown 
            className={`h-4 w-4 transition-transform ${isExpanded ? 'rotate-0' : '-rotate-90'}`} 
          />
          Projects
        </button>
        <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
          <Plus className="h-3 w-3" />
        </Button>
      </div>

      {/* Project List */}
      {isExpanded && (
        <div className="space-y-1">
          {projects.length === 0 ? (
            <div className="text-center py-4 text-sm text-stone-500 dark:text-stone-400">
              <Folder className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No projects found</p>
              <Button variant="outline" size="sm" className="mt-2">
                <Plus className="h-3 w-3 mr-1" />
                Create Project
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isSelected={currentProject?.id === project.id}
                onSelect={() => handleProjectSelect(project)}
              />
            ))
          )}
        </div>
      )}

      {/* All Projects Option */}
      {isExpanded && projects.length > 0 && (
        <div className="pt-2 border-t border-stone-200 dark:border-stone-700">
          <button
            onClick={() => setCurrentProject(null)}
            className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
              !currentProject
                ? 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-stone-100'
                : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
            }`}
          >
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4" />
              <span>All Projects</span>
            </div>
          </button>
        </div>
      )}
    </div>
  );
}

interface ProjectCardProps {
  project: Project;
  isSelected: boolean;
  onSelect: () => void;
}

function ProjectCard({ project, isSelected, onSelect }: ProjectCardProps) {
  const handleSettingsClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the project selection
    // Add settings functionality here later
    console.log('Settings clicked for project:', project.name);
  };

  return (
    <div
      onClick={onSelect}
      className={`w-full text-left p-2 rounded-md transition-colors group cursor-pointer ${
        isSelected
          ? 'bg-stone-100 dark:bg-stone-700 text-stone-900 dark:text-stone-100'
          : 'text-stone-600 dark:text-stone-400 hover:bg-stone-50 dark:hover:bg-stone-800'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Folder className="h-3 w-3 flex-shrink-0" />
            <span className="text-sm font-medium truncate">
              {project.name}
            </span>
          </div>
          {project.description && (
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate mb-1">
              {project.description}
            </p>
          )}
          <div className="flex items-center gap-3 text-xs text-stone-500 dark:text-stone-400">
            <span>{project.translationKeyCount} keys</span>
            <span>{project.supportedLanguages.length} langs</span>
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
          onClick={handleSettingsClick}
        >
          <Settings className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
} 
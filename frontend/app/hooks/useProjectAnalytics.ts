import { useState, useEffect } from 'react';
import { projectApi } from '../lib/api';

export type ProjectAnalytics = {
  project_id: string;
  total_keys: number;
  completion_stats: Record<string, {
    translated: number;
    total: number;
    percentage: number;
  }>;
};

export function useProjectAnalytics(projectId: string | undefined) {
  const [analytics, setAnalytics] = useState<ProjectAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!projectId) {
      setAnalytics(null);
      return;
    }

    const fetchAnalytics = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await projectApi.getProjectAnalytics(projectId);
        setAnalytics(data);
      } catch (err) {
        setError(err instanceof Error ? err : new Error('Failed to fetch analytics'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnalytics();
  }, [projectId]);

  return { analytics, isLoading, error };
} 
import { Progress } from '../ui/progress';
import { useProjectAnalytics } from '../../hooks/useProjectAnalytics';
import { Loader2 } from 'lucide-react';

interface ProjectAnalyticsCardProps {
  projectId: string;
}

export function ProjectAnalyticsCard({ projectId }: ProjectAnalyticsCardProps) {
  const { analytics, isLoading, error } = useProjectAnalytics(projectId);

  if (isLoading) {
    return (
      <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
        <div className="flex items-center justify-center py-2">
          <Loader2 className="h-4 w-4 animate-spin text-stone-500" />
          <span className="ml-2 text-sm text-stone-600 dark:text-stone-400">
            Loading analytics...
          </span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
        <p className="text-sm text-red-600 dark:text-red-400">
          Failed to load analytics
        </p>
      </div>
    );
  }

  if (!analytics) {
    return null;
  }

  return (
    <div className="mt-4 p-4 bg-stone-50 dark:bg-stone-800 rounded-lg">
      <h2 className="text-sm font-medium text-stone-700 dark:text-stone-300 mb-3">
        Translation Completion
      </h2>
      <div className="space-y-3">
        {Object.entries(analytics.completion_stats).map(([lang, stats]) => (
          <Progress
            key={lang}
            value={stats.percentage}
            showValue
            valueFormatter={(value) => `${lang.toUpperCase()}: ${value}`}
          />
        ))}
      </div>
    </div>
  );
} 
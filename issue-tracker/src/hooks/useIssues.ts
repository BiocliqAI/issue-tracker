import { useEffect, useMemo, useState } from 'react';
import type { Issue, IssueFilters } from '../types/issue.ts';
import { subscribeToIssues } from '../services/issueService.ts';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '../constants/issueOptions.ts';

const defaultFilters: IssueFilters = {
  categories: ISSUE_CATEGORIES,
  statuses: ISSUE_STATUSES,
  priorities: ISSUE_PRIORITIES,
};

export const useIssues = (filters?: Partial<IssueFilters>) => {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const mergedFilters = useMemo<IssueFilters>(() => {
    const newFilters = {
      ...defaultFilters,
      ...filters,
      categories: filters?.categories ?? defaultFilters.categories,
      statuses: filters?.statuses ?? defaultFilters.statuses,
      priorities: filters?.priorities ?? defaultFilters.priorities,
    };

    if (filters?.showOnlyOpen) {
      newFilters.statuses = ['New', 'In Progress', 'Awaiting Customer'];
    }
    newFilters.showArchived = filters?.showArchived ?? false;

    return newFilters;
  }, [filters]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    const unsubscribe = subscribeToIssues(
      mergedFilters,
      (data) => {
        setIssues(data);
        setError(null);
        setLoading(false);
      },
      (subscribeError) => {
        setError(subscribeError);
        setLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, [mergedFilters]);

  return { issues, loading, error, filters: mergedFilters };
};

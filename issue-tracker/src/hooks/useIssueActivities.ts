import { startTransition, useEffect, useState } from 'react';
import type { IssueActivity } from '../types/issue.ts';
import { subscribeToActivities } from '../services/issueService.ts';

export const useIssueActivities = (issueId?: string | null) => {
  const [activities, setActivities] = useState<IssueActivity[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!issueId) {
      return undefined;
    }
    startTransition(() => setLoading(true));
    const unsubscribe = subscribeToActivities(issueId, (data) => {
      setActivities(data);
      setLoading(false);
    });

    return () => {
      unsubscribe();
    };
  }, [issueId]);

  if (!issueId) {
    return { activities: [], loading: false };
  }

  return { activities, loading };
};

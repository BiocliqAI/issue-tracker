import type { Issue } from '../types/issue.ts';

export const groupByStatus = (issues: Issue[]) => {
  return issues.reduce<Record<Issue['status'], Issue[]>>(
    (acc, issue) => {
      acc[issue.status] = acc[issue.status] ? [...acc[issue.status], issue] : [issue];
      return acc;
    },
    {
      'New': [],
      'In Progress': [],
      'Awaiting Customer': [],
      'Resolved': [],
      'Closed': [],
    }
  );
};

export const groupByCategory = (issues: Issue[]) => {
  return issues.reduce<Record<string, Issue[]>>((acc, issue) => {
    if (!acc[issue.category]) {
      acc[issue.category] = [];
    }
    acc[issue.category].push(issue);
    return acc;
  }, {});
};

export const getIssueSnapshot = (issues: Issue[]) => {
  const byStatus = groupByStatus(issues);
  const byCategory = groupByCategory(issues);

  const openIssues = issues.filter((issue) => issue.status !== 'Closed');
  const criticalIssues = openIssues.filter((issue) => issue.priority === 'Critical');

  const slaBreaches = openIssues.filter((issue) => issue.slaBreachRisk === 'Breached');
  const atRisk = openIssues.filter((issue) => issue.slaBreachRisk === 'At Risk');

  return {
    total: issues.length,
    open: openIssues.length,
    closed: byStatus.Closed.length,
    critical: criticalIssues.length,
    byStatus,
    byCategory,
    sla: {
      breached: slaBreaches.length,
      atRisk: atRisk.length,
    },
  };
};

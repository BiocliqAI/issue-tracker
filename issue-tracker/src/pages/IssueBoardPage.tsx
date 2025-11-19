import { Box, CircularProgress, Stack, Typography } from '@mui/material';
import { useMemo, useState } from 'react';
import IssueKanban from '../components/IssueKanban.tsx';
import IssueDetailsDrawer from '../components/IssueDetailsDrawer.tsx';
import { useIssues } from '../hooks/useIssues.ts';
import type { Issue, IssueFormValues, IssueStatus } from '../types/issue.ts';
import { updateIssue, updateIssueStatus } from '../services/issueService.ts';
import { useAuth } from '../context/AuthContext.tsx';

const IssueBoardPage = () => {
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);
  const { user } = useAuth();
  const issueFilters = useMemo(() => ({ showOnlyOpen: true }), []);
  const { issues, loading } = useIssues(issueFilters);
  const activeUser = user?.email ?? 'system@ops';

  const openIssues = useMemo(() => issues.filter((issue) => issue.status !== 'Closed'), [issues]);

  const handleStatusChange = async (issueId: string, status: IssueStatus) => {
    await updateIssueStatus(issueId, status, activeUser);
  };

  const handleUpdateIssue = async (issueId: string, values: Partial<IssueFormValues>, message?: string) => {
    await updateIssue(issueId, values, activeUser, message);
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" height={420}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Real-time Kanban board
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom>
        Align Tech and Ops on every customer-impacting incident with live status swimlanes.
      </Typography>
      <IssueKanban issues={openIssues} onOpenIssue={setSelectedIssue} />
      <IssueDetailsDrawer
        key={selectedIssue?.id}
        open={Boolean(selectedIssue)}
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdate={handleUpdateIssue}
        onStatusChange={handleStatusChange}
        onUnarchive={async () => { /* do nothing */ }}
      />
    </Box>
  );
};

export default IssueBoardPage;

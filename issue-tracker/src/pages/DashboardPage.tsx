import {
  Box,
  CircularProgress,
  Paper,
  Stack,
  Tab,
  Tabs,
  Typography,
  useMediaQuery,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useCallback, useMemo, useReducer, useState } from 'react';
import IssueFilterBar from '../components/IssueFilters.tsx';
import IssueTable from '../components/IssueTable.tsx';
import IssueKanban from '../components/IssueKanban.tsx';
import NewIssueDialog from '../components/NewIssueDialog.tsx';
import IssueDetailsDrawer from '../components/IssueDetailsDrawer.tsx';
import { useIssues } from '../hooks/useIssues.ts';
import type { Issue, IssueFilters as IssueFiltersType, IssueFormValues, IssueStatus } from '../types/issue.ts';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '../constants/issueOptions.ts';
import {
  createIssue,
  createIssueWithDocument,
  archiveIssue,
  unarchiveIssue,
  updateIssue,
  updateIssueStatus,
} from '../services/issueService.ts';
import { useAuth } from '../context/AuthContext.tsx';
import { Switch, FormControlLabel } from '@mui/material';

type DashboardView = 'table' | 'kanban';

const initialFilters: IssueFiltersType = {
  categories: ISSUE_CATEGORIES,
  statuses: ISSUE_STATUSES,
  priorities: ISSUE_PRIORITIES,
  showArchived: false,
};

const filtersReducer = (state: IssueFiltersType, action: Partial<IssueFiltersType>): IssueFiltersType => ({
  ...state,
  ...action,
});

const DashboardPage = () => {
  const theme = useTheme();
  const isSmall = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useAuth();
  const [filters, setFilters] = useReducer(filtersReducer, initialFilters);
  const { issues, loading } = useIssues(filters);
  const [view, setView] = useState<DashboardView>('table');
  const [newIssueOpen, setNewIssueOpen] = useState(false);
  const [selectedIssue, setSelectedIssue] = useState<Issue | null>(null);

  const handleFiltersChange = useCallback((patch: Partial<IssueFiltersType>) => {
    setFilters(patch);
  }, []);

  const activeUser = user?.email ?? 'system@ops';

  const handleCreateIssue = useCallback(
    async (values: IssueFormValues, file?: File | null) => {
      if (file) {
        await createIssueWithDocument(values, file, activeUser);
      } else {
        await createIssue(values, activeUser);
      }
    },
    [activeUser]
  );

  const handleUpdateIssue = useCallback(
    async (issueId: string, values: Partial<IssueFormValues>, message?: string) => {
      await updateIssue(issueId, values, activeUser, message);
    },
    [activeUser]
  );

  const handleStatusChange = useCallback(
    async (issueId: string, status: IssueStatus) => {
      await updateIssueStatus(issueId, status, activeUser);
    },
    [activeUser]
  );

  const handleArchiveIssue = useCallback(async (issueId: string) => {
    await archiveIssue(issueId, activeUser);
  }, [activeUser]);

  const handleUnarchiveIssue = useCallback(async (issueId: string) => {
    await unarchiveIssue(issueId, activeUser);
  }, [activeUser]);

  const primaryContent = useMemo(() => {
    if (loading) {
      return (
        <Stack alignItems="center" justifyContent="center" height={360}>
          <CircularProgress />
        </Stack>
      );
    }

    if (!issues.length) {
      return (
        <Paper sx={{ p: 5, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            No issues match the current filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Adjust the filters or log a new customer incident to get started.
          </Typography>
        </Paper>
      );
    }

    return view === 'kanban' ? (
      <IssueKanban issues={issues} onOpenIssue={setSelectedIssue} />
    ) : (
      <IssueTable
        issues={issues}
        onOpenIssue={setSelectedIssue}
        onChangeStatus={handleStatusChange}
        onUpdateIssue={handleUpdateIssue}
        onArchiveIssue={handleArchiveIssue}
      />
    );
  }, [handleStatusChange, issues, loading, view, handleArchiveIssue, handleUpdateIssue]);

  return (
    <Box>
      <Stack spacing={3}>
        <IssueFilterBar value={filters} onChange={handleFiltersChange} onCreate={() => setNewIssueOpen(true)} />

        <Paper sx={{ borderRadius: 3, p: 1.5, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Tabs
            value={view}
            onChange={(_event, newValue) => setView(newValue)}
            variant={isSmall ? 'fullWidth' : 'standard'}
          >
            <Tab value="table" label="Issue List" />
            <Tab value="kanban" label="Kanban board" />
          </Tabs>
          <FormControlLabel
            control={
              <Switch
                checked={filters.showArchived}
                onChange={(event) => handleFiltersChange({ showArchived: event.target.checked })}
                name="showArchived"
                color="primary"
              />
            }
            label="Show Archived"
          />
          <Typography variant="body2" color="text.secondary" sx={{ display: { xs: 'none', md: 'block' } }}>
            Real-time Firestore sync across Ops & Tech</Typography>
        </Paper>
        {primaryContent}
      </Stack>

      <NewIssueDialog open={newIssueOpen} onClose={() => setNewIssueOpen(false)} onSubmit={handleCreateIssue} />
      <IssueDetailsDrawer
        open={Boolean(selectedIssue)}
        issue={selectedIssue}
        onClose={() => setSelectedIssue(null)}
        onUpdate={handleUpdateIssue}
        onStatusChange={handleStatusChange}
        onUnarchive={handleUnarchiveIssue}
      />
    </Box>
  );
};

export default DashboardPage;

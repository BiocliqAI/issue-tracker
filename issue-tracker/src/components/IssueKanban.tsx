import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import type { Issue, IssueStatus } from '../types/issue.ts';
import { ISSUE_STATUSES } from '../constants/issueOptions.ts';

type IssueKanbanProps = {
  issues: Issue[];
  onOpenIssue: (issue: Issue) => void;
};

const statusTitles: Record<IssueStatus, string> = {
  'New': 'New Intake',
  'In Progress': 'In Motion',
  'Awaiting Customer': 'Waiting on Customer',
  'Resolved': 'Pending Closure',
  'Closed': 'Closed',
};

const IssueKanban = ({ issues, onOpenIssue }: IssueKanbanProps) => {
  return (
    <Box sx={{ width: '100%', overflowX: 'auto', pb: 1 }}>
      <Box
        sx={{
          display: 'grid',
          gap: 2,
          mt: 1,
          gridTemplateColumns: {
            xs: `repeat(${ISSUE_STATUSES.length}, minmax(280px, 1fr))`,
            sm: 'repeat(2, minmax(0, 1fr))',
            md: 'repeat(3, minmax(0, 1fr))',
            lg: 'repeat(5, minmax(0, 1fr))',
          },
        }}
      >
      {ISSUE_STATUSES.map((status) => {
        const columnIssues = issues.filter((issue) => issue.status === status);
        return (
          <Paper key={status} sx={{ p: 2, borderRadius: 3, minHeight: 420, bgcolor: 'background.paper' }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center" mb={2}>
              <Typography
                variant="subtitle2"
                fontWeight={700}
                color={status === 'Closed' ? 'success.main' : status === 'New' ? 'info.main' : 'text.primary'}
              >
                {statusTitles[status]}
              </Typography>
              <Chip size="small" label={columnIssues.length} color={status === 'Closed' ? 'success' : 'default'} />
            </Stack>
            <Stack spacing={1.5}>
              {columnIssues.map((issue) => (
                <Paper
                  key={issue.id}
                  variant="outlined"
                  sx={{
                    p: 1.5,
                    borderRadius: 2,
                    transition: 'transform 0.15s ease, box-shadow 0.15s ease',
                    '&:hover': { transform: 'translateY(-2px)', boxShadow: 3 },
                    borderColor: (theme) => theme.palette.divider,
                  }}
                >
                  <Box
                    onClick={() => onOpenIssue(issue)}
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      p: 1.5,
                      pb: 4, 
                      minHeight: '80px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      '&:hover': {
                        borderColor: 'primary.main',
                      }
                    }}
                  >
                    <Typography 
                      variant="subtitle2" 
                      fontWeight={600} 
                      sx={{ 
                        whiteSpace: 'nowrap', 
                        overflow: 'hidden', 
                        textOverflow: 'ellipsis',
                      }}
                    >
                      {issue.description}
                    </Typography>
                  </Box>
                  <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mt: 1, pl: 0.5 }}>
                    {issue.customerName ?? 'Internal'}
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mt: 1.5, pl: 0.5 }}>
                    <Chip
                      size="small"
                      label={issue.priority}
                      color={
                        issue.priority === 'Critical'
                          ? 'error'
                          : issue.priority === 'High'
                          ? 'warning'
                          : 'default'
                      }
                    />
                    <Chip size="small" label={issue.category} variant="outlined" />
                    {issue.assignee && <Chip size="small" label={issue.assignee} variant="outlined" />}
                  </Stack>
                </Paper>
              ))}
              {!columnIssues.length && (
                <Box
                  sx={{
                    border: '1px dashed rgba(15,23,42,0.12)',
                    borderRadius: 2,
                    p: 2,
                    textAlign: 'center',
                    color: 'text.secondary',
                    fontSize: 13,
                  }}
                >
                  No records in this stage.
                </Box>
              )}
            </Stack>
          </Paper>
        );
      })}
      </Box>
    </Box>
  );
};

export default IssueKanban;

import { Avatar, Box, LinearProgress, Paper, Stack, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import WarningIcon from '@mui/icons-material/WarningAmberRounded';
import CheckCircleIcon from '@mui/icons-material/CheckCircleRounded';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupsIcon from '@mui/icons-material/Groups';
import type { Issue } from '../types/issue.ts';
import { getIssueSnapshot } from '../utils/issueMetrics.ts';

type OverviewCardsProps = {
  issues: Issue[];
};

const OverviewCards = ({ issues }: OverviewCardsProps) => {
  const theme = useTheme();
  const snapshot = getIssueSnapshot(issues);

  const cards = [
    {
      label: 'Open portfolio',
      value: snapshot.open,
      helper: `${snapshot.total} total incidents`,
      icon: <TrendingUpIcon />,
      palette: 'primary' as const,
    },
    {
      label: 'Critical at risk',
      value: snapshot.critical,
      helper: `${snapshot.sla.atRisk} at risk, ${snapshot.sla.breached} breached`,
      icon: <WarningIcon />,
      palette: 'error' as const,
    },
    {
      label: 'Closed this period',
      value: snapshot.closed,
      helper: `${((snapshot.closed / Math.max(snapshot.total, 1)) * 100).toFixed(0)}% completion`,
      icon: <CheckCircleIcon />,
      palette: 'success' as const,
    },
    {
      label: 'Active assignees',
      value: new Set(issues.filter((issue) => issue.assignee).map((issue) => issue.assignee)).size,
      helper: `${issues.filter((issue) => issue.assignee === null).length} unassigned`,
      icon: <GroupsIcon />,
      palette: 'secondary' as const,
    },
  ];

  return (
    <Box
      sx={{
        display: 'grid',
        gap: 2,
        gridTemplateColumns: {
          xs: '1fr',
          sm: 'repeat(2, minmax(0, 1fr))',
          xl: 'repeat(4, minmax(0, 1fr))',
        },
      }}
    >
      {cards.map((card) => {
        const paletteColor = theme.palette[card.palette].main;
        return (
          <Paper key={card.label} sx={{ p: 3, borderRadius: 3 }}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar sx={{ bgcolor: alpha(paletteColor, 0.12), color: paletteColor }}>{card.icon}</Avatar>
            <Box flexGrow={1}>
              <Typography variant="body2" color="text.secondary">
                {card.label}
              </Typography>
              <Typography variant="h4" fontWeight={700} gutterBottom>
                {card.value}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {card.helper}
              </Typography>
            </Box>
          </Stack>
          <LinearProgress
            variant="determinate"
            sx={{
              mt: 2,
              height: 6,
              borderRadius: 999,
              bgcolor: alpha(paletteColor, 0.08),
              '& .MuiLinearProgress-bar': {
                bgcolor: paletteColor,
              },
            }}
            value={Math.min((Number(card.value) / Math.max(snapshot.total, 1)) * 100, 100)}
          />
          </Paper>
        );
      })}
    </Box>
  );
};

export default OverviewCards;

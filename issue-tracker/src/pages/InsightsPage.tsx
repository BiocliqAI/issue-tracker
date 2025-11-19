import { Box, Paper, Stack, Typography } from '@mui/material';
import { Bar, BarChart, CartesianGrid, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { useMemo } from 'react';
import { useIssues } from '../hooks/useIssues.ts';
import { getIssueSnapshot } from '../utils/issueMetrics.ts';

const InsightsPage = () => {
  const { issues } = useIssues();
  const snapshot = useMemo(() => getIssueSnapshot(issues), [issues]);

  const categoryData = useMemo(
    () =>
      Object.entries(snapshot.byCategory).map(([category, categoryIssues]) => ({
        category,
        open: categoryIssues.filter((issue) => issue.status !== 'Closed').length,
        closed: categoryIssues.filter((issue) => issue.status === 'Closed').length,
      })),
    [snapshot.byCategory]
  );

  const statusData = useMemo(
    () =>
      Object.entries(snapshot.byStatus).map(([status, statusIssues]) => ({
        name: status,
        value: statusIssues.length,
      })),
    [snapshot.byStatus]
  );

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Executive insights
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Analyze customer incident velocity and product health with live Firestore intelligence.
      </Typography>
      <Box
        sx={{
          display: 'grid',
          gap: 3,
          gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
        }}
      >
        <Paper sx={{ p: 3, borderRadius: 3, height: 420 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Open vs closed by product line
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={categoryData}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="category" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              <Bar dataKey="open" fill="#1f3c88" name="Open" radius={[6, 6, 0, 0]} />
              <Bar dataKey="closed" fill="#4ade80" name="Closed" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3, height: 420 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Status distribution
          </Typography>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={statusData} dataKey="value" cx="50%" cy="50%" outerRadius={130} label />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3, gridColumn: '1 / -1' }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Portfolio snapshot
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
            <Box flex={1}>
              <Typography variant="h3" fontWeight={700} color="primary.main">
                {snapshot.open}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Open issues actively managed across Ops & Tech
              </Typography>
            </Box>
            <Stack direction="row" spacing={3} flexWrap="wrap">
              <Metric label="Critical" value={snapshot.critical} helper="High severity across all products" />
              <Metric label="SLA Breached" value={snapshot.sla.breached} helper="Requires leadership escalation" />
              <Metric label="SLA At risk" value={snapshot.sla.atRisk} helper="Monitor closely for customer updates" />
              <Metric label="Closed" value={snapshot.closed} helper="Resolved in the current period" />
            </Stack>
          </Stack>
        </Paper>
      </Box>
    </Box>
  );
};

const Metric = ({ label, value, helper }: { label: string; value: number; helper: string }) => (
  <Stack spacing={0.5}>
    <Typography variant="subtitle2" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="h4" fontWeight={700}>
      {value}
    </Typography>
    <Typography variant="body2" color="text.secondary">
      {helper}
    </Typography>
  </Stack>
);

export default InsightsPage;

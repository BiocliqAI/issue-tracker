import { Box, Button, CircularProgress, Paper, Stack, TextField, Typography } from '@mui/material';
import { useEffect, useMemo, useState } from 'react';
import type { IssueCategory } from '../types/issue.ts';
import { useRoutingSettings } from '../hooks/useRoutingSettings.ts';
import type { RoutingSettings } from '../types/settings.ts';
import { updateRoutingSettings } from '../services/settingsService.ts';

const AdminPage = () => {
  const { settings, loading } = useRoutingSettings();
  const [localSettings, setLocalSettings] = useState<RoutingSettings>(settings);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setLocalSettings(settings);
  }, [settings]);

  const defaultAssigneeEntries = useMemo(() => Object.entries(localSettings.defaultAssignees) as [IssueCategory, string][], [localSettings.defaultAssignees]);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRoutingSettings(localSettings);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Stack alignItems="center" justifyContent="center" height={320}>
        <CircularProgress />
      </Stack>
    );
  }

  return (
    <Box>
      <Typography variant="h5" fontWeight={700} gutterBottom>
        Operating rules & notifications
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Fine tune routing, default assignees, and escalation watchers for each product line.
      </Typography>
      <Stack spacing={3}>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Default assignees per product
          </Typography>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            {defaultAssigneeEntries.map(([category, owner]) => (
              <TextField
                key={category}
                label={`${category} owner`}
                fullWidth
                value={owner}
                placeholder="e.g. operations@yourcompany.com"
                onChange={(event) =>
                  setLocalSettings((prev) => ({
                    ...prev,
                    defaultAssignees: { ...prev.defaultAssignees, [category]: event.target.value },
                  }))
                }
              />
            ))}
          </Box>
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Escalation contacts
          </Typography>
          <TextField
            label="Escalation distribution list"
            helperText="Comma separated emails notified when issues breach SLAs"
            fullWidth
            value={localSettings.escalationContacts.join(', ')}
            onChange={(event) =>
              setLocalSettings((prev) => ({
                ...prev,
                escalationContacts: event.target.value
                  .split(',')
                  .map((entry) => entry.trim())
                  .filter(Boolean),
              }))
            }
          />
        </Paper>
        <Paper sx={{ p: 3, borderRadius: 3 }}>
          <Typography variant="subtitle1" fontWeight={600} gutterBottom>
            Watchers
          </Typography>
          <TextField
            label="Ops & leadership watchers"
            helperText="These teammates receive daily digests"
            fullWidth
            multiline
            minRows={3}
            value={localSettings.watchers.join('\n')}
            onChange={(event) =>
              setLocalSettings((prev) => ({
                ...prev,
                watchers: event.target.value
                  .split('\n')
                  .map((entry) => entry.trim())
                  .filter(Boolean),
              }))
            }
          />
        </Paper>
        <Box display="flex" justifyContent="flex-end">
          <Button variant="contained" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : 'Save settings'}
          </Button>
        </Box>
      </Stack>
    </Box>
  );
};

export default AdminPage;

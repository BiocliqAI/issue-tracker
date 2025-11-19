import { Box, Button, Chip, Divider, Drawer, IconButton, Link, LinearProgress, MenuItem, Paper, Stack, TextField, Typography, Select } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useForm } from 'react-hook-form';
import { useEffect, useState } from 'react';
import type { Issue, IssueFormValues, IssueStatus } from '../types/issue.ts';
import { ASSIGNABLE_USERS, ISSUE_PRIORITIES } from '../constants/issueOptions.ts';
import { useIssueActivities } from '../hooks/useIssueActivities.ts';
import { addDocumentToIssue, uploadDocument } from '../services/issueService.ts';

type IssueDetailsDrawerProps = {
  issue: Issue | null;
  open: boolean;
  onClose: () => void;
  onUpdate: (issueId: string, values: Partial<IssueFormValues>, message?: string) => Promise<void>;
  onStatusChange: (issueId: string, status: IssueStatus) => Promise<void>;
  onUnarchive: (issueId: string) => Promise<void>;
};

type UpdateForm = Pick<IssueFormValues, 'assignee' | 'priority' | 'expectedResolution'>;

const IssueDetailsDrawer = ({ issue, open, onClose, onUpdate, onStatusChange, onUnarchive }: IssueDetailsDrawerProps) => {
  const { activities } = useIssueActivities(issue?.id ?? null);
  const [saving, setSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const { register, handleSubmit, reset } = useForm<UpdateForm>();

  useEffect(() => {
    if (issue) {
      reset({
        assignee: issue.assignee ?? '',
        priority: issue.priority ?? 'Medium',
        expectedResolution: issue.expectedResolution ?? '',
      });
    }
  }, [issue, reset]);

  if (!issue) {
    return null;
  }

  const handleUpdate = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await onUpdate(
        issue.id,
        {
          ...values,
          assignee: values.assignee?.trim() || null,
          expectedResolution: values.expectedResolution?.trim() || null,
        },
        'Issue ownership updated'
      );
    } finally {
      setSaving(false);
    }
  });

  const handleStatusChange = async (status: IssueStatus) => {
    if (status === issue.status) return;
    setStatusSaving(true);
    try {
      await onStatusChange(issue.id, status);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleFileUpload = async () => {
    if (!selectedFile) return;
    setUploading(true);
    try {
      const downloadUrl = await uploadDocument(issue.id, selectedFile);
      await addDocumentToIssue(issue.id, { name: selectedFile.name, url: downloadUrl });
      setSelectedFile(null);
    } finally {
      setUploading(false);
    }
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose} PaperProps={{ sx: { width: { xs: '100%', sm: 520 } } }}>
      <Box
        key={issue.id}
        sx={{ p: 3, display: 'flex', flexDirection: 'column', height: '100%' }}
        component="form"
        onSubmit={handleUpdate}
      >
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start" mb={2}>
          <Box>
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {issue.description}
            </Typography>
            <Stack direction="row" spacing={1} flexWrap="wrap">
              <Chip label={issue.category} variant="outlined" />
              <Chip
                label={issue.priority}
                color={issue.priority === 'Critical' ? 'error' : issue.priority === 'High' ? 'warning' : 'default'}
              />
              <Chip
                label={issue.status}
                color={issue.status === 'Closed' ? 'success' : issue.status === 'Resolved' ? 'success' : 'info'}
              />
              {issue.isArchived && <Chip label="Archived" color="default" />}
            </Stack>
          </Box>
          <IconButton onClick={onClose}>
            <CloseIcon />
          </IconButton>
        </Stack>
        <Divider sx={{ my: 2 }} />
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
          }}
        >
          <Box>
            <Select label="Assignee" fullWidth {...register('assignee')}>
              {ASSIGNABLE_USERS.map((user) => (
                <MenuItem key={user.email} value={user.name}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </Box>
          <Box>
            <TextField label="Priority" select fullWidth {...register('priority')}>
              {ISSUE_PRIORITIES.map((priority) => (
                <MenuItem key={priority} value={priority}>
                  {priority}
                </MenuItem>
              ))}
            </TextField>
          </Box>
          <Box sx={{ gridColumn: { xs: 'span 1', sm: 'span 2' } }}>
            <TextField
              label="Latest Update"
              placeholder="e.g. ETA Friday 4PM ET after patch deployment"
              fullWidth
              {...register('expectedResolution')}
            />
          </Box>

        </Box>
        <Stack direction="row" spacing={2} mt={3}>
          <Button type="submit" variant="contained" disabled={saving}>
            Save updates
          </Button>
          <Button
            variant="outlined"
            disabled={statusSaving}
            onClick={() => handleStatusChange(issue.status === 'Resolved' ? 'Closed' : 'Resolved')}
          >
            {issue.status === 'Resolved' ? 'Close issue' : 'Mark resolved'}
          </Button>
          {issue.isArchived && (
            <Button
              variant="outlined"
              color="secondary"
              onClick={() => onUnarchive(issue.id)}
            >
              Unarchive
            </Button>
          )}
        </Stack>
        <Divider sx={{ my: 3 }} />
        <Box>
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Documents
          </Typography>
          <Stack spacing={1.5}>
            {issue.documents?.map((doc) => (
              <Paper key={doc.url} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                <Link href={doc.url} target="_blank" rel="noopener">
                  {doc.name}
                </Link>
              </Paper>
            ))}
          </Stack>
          <Stack direction="row" spacing={2} mt={2}>
            <Button component="label" variant="outlined" size="small">
              Choose file
              <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
            </Button>
            <Button onClick={handleFileUpload} disabled={!selectedFile || uploading} variant="contained" size="small">
              Upload
            </Button>
          </Stack>
          {selectedFile && (
            <Typography variant="body2" mt={1}>
              Selected: {selectedFile.name}
            </Typography>
          )}
          {uploading && <LinearProgress sx={{ mt: 1 }} />}
        </Box>
        <Divider sx={{ my: 3 }} />
        <Box flexGrow={1} overflow="auto">
          <Typography variant="subtitle1" fontWeight={600} mb={2}>
            Activity timeline
          </Typography>
          <Stack spacing={2}>
            {activities.map((activity) => (
              <Paper key={activity.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                <Typography variant="subtitle2" fontWeight={600}>
                  {activity.actor}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  {new Date(activity.timestamp).toLocaleString()}
                </Typography>
                <Typography variant="body2" mt={1}>
                  {activity.message}
                </Typography>
              </Paper>
            ))}
            {!activities.length && (
              <Typography variant="body2" color="text.secondary">
                Activity will appear here as your teams collaborate.
              </Typography>
            )}
          </Stack>
        </Box>
      </Box>
    </Drawer>
  );
};

export default IssueDetailsDrawer;

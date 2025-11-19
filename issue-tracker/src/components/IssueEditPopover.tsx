import { Popover, Box, TextField, Button, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import type { Issue } from '../types/issue.ts';
import { useState } from 'react';

type IssueEditPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  issue: Issue;
  onSave: (issueId: string, description: string) => Promise<void>;
};

type IssueEditForm = {
  description: string;
};

const IssueEditPopover = ({ open, anchorEl, onClose, issue, onSave }: IssueEditPopoverProps) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm<IssueEditForm>({
    defaultValues: {
      description: issue.description,
    },
  });

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await onSave(issue.id, values.description);
      onClose();
    } finally {
      setSaving(false);
    }
  });

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'left',
      }}
      transformOrigin={{
        vertical: 'top',
        horizontal: 'left',
      }}
    >
      <Box component="form" onSubmit={submit} sx={{ p: 2, width: 300 }}>
        <Typography variant="subtitle2" fontWeight={600} gutterBottom>
          Edit Issue Details
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Issue Description"
            fullWidth
            multiline
            minRows={3}
            size="small"
            {...register('description', { required: true })}
          />
          <Button type="submit" variant="contained" size="small" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};

export default IssueEditPopover;

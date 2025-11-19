import { Popover, Box, TextField, Button, Stack, Typography } from '@mui/material';
import { useForm } from 'react-hook-form';
import type { Issue } from '../types/issue.ts';
import { useState } from 'react';

type ExpectedResolutionEditPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  issue: Issue;
  onSave: (issueId: string, expectedResolution: string) => Promise<void>;
};

type ExpectedResolutionEditForm = {
  expectedResolution: string;
};

const ExpectedResolutionEditPopover = ({ open, anchorEl, onClose, issue, onSave }: ExpectedResolutionEditPopoverProps) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm<ExpectedResolutionEditForm>({
    defaultValues: {
      expectedResolution: issue.expectedResolution ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await onSave(issue.id, values.expectedResolution);
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
          Edit Latest Update
        </Typography>
        <Stack spacing={2}>
          <TextField
            label="Expected Resolution"
            fullWidth
            multiline
            minRows={2}
            size="small"
            {...register('expectedResolution')}
          />
          <Button type="submit" variant="contained" size="small" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};

export default ExpectedResolutionEditPopover;

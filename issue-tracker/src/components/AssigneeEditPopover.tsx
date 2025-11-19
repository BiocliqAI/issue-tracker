import { Popover, Box, Button, Stack, Typography, Select, MenuItem } from '@mui/material';
import { useForm } from 'react-hook-form';
import type { Issue } from '../types/issue.ts';
import { useState } from 'react';
import { ASSIGNABLE_USERS } from '../constants/issueOptions.ts';

type AssigneeEditPopoverProps = {
  open: boolean;
  anchorEl: HTMLElement | null;
  onClose: () => void;
  issue: Issue;
  onSave: (issueId: string, assignee: string) => Promise<void>;
};

type AssigneeEditForm = {
  assignee: string;
};

const AssigneeEditPopover = ({ open, anchorEl, onClose, issue, onSave }: AssigneeEditPopoverProps) => {
  const [saving, setSaving] = useState(false);
  const { register, handleSubmit } = useForm<AssigneeEditForm>({
    defaultValues: {
      assignee: issue.assignee ?? '',
    },
  });

  const submit = handleSubmit(async (values) => {
    setSaving(true);
    try {
      await onSave(issue.id, values.assignee);
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
          Edit Assignee
        </Typography>
        <Stack spacing={2}>
          <Select
            label="Assignee"
            fullWidth
            size="small"
            {...register('assignee')}
          >
            {ASSIGNABLE_USERS.map((user) => (
              <MenuItem key={user.email} value={user.name}>
                {user.name}
              </MenuItem>
            ))}
          </Select>
          <Button type="submit" variant="contained" size="small" disabled={saving}>
            {saving ? 'Saving...' : 'Save'}
          </Button>
        </Stack>
      </Box>
    </Popover>
  );
};

export default AssigneeEditPopover;

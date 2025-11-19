import { Box, Dialog, DialogContent, DialogTitle, MenuItem, Stack, TextField, Typography, Button } from '@mui/material';
import { useForm } from 'react-hook-form';
import { useState } from 'react';
import type { IssueFormValues } from '../types/issue.ts';
import { ASSIGNABLE_USERS, ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '../constants/issueOptions.ts';

type NewIssueDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: IssueFormValues, file?: File | null) => Promise<void>;
};

const NewIssueDialog = ({ open, onClose, onSubmit }: NewIssueDialogProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const {
    register,
    handleSubmit,
    reset,
    formState: { isSubmitting },
  } = useForm<IssueFormValues>({
    defaultValues: {
      description: '',
      category: 'Urologiq',
      status: 'New',
      priority: 'Medium',
      assignee: '',
      reporter: '',
      customerName: '',
      expectedResolution: '',
      tags: [],
    },
  });

  const submit = handleSubmit(async (values) => {
    await onSubmit(
      {
        ...values,
        assignee: values.assignee || null,
        expectedResolution: values.expectedResolution || null,
        tags: values.tags?.filter(Boolean) ?? [],
      },
      selectedFile
    );
    reset();
    setSelectedFile(null);
    onClose();
  });

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle fontWeight={700}>Log new customer issue</DialogTitle>
      <DialogContent dividers>
        <Typography variant="body2" color="text.secondary" mb={3}>
          Capture the customer context, impact, and current owner to activate the right playbook.
        </Typography>
        <Stack component="form" spacing={2.5} onSubmit={submit}>
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(3, minmax(0, 1fr))' },
            }}
          >
            <Box sx={{ gridColumn: { xs: 'span 1', md: 'span 2' } }}>
              <TextField label="Issue Description" fullWidth required multiline minRows={3} {...register('description', { required: true })} />
            </Box>
            <Box>
              <TextField label="Product" select fullWidth defaultValue="Urologiq" {...register('category')}>
                {ISSUE_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField label="Priority" select fullWidth defaultValue="Medium" {...register('priority')}>
                {ISSUE_PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField label="Status" select fullWidth defaultValue="New" {...register('status')}>
                {ISSUE_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
          <TextField label="Customer / Account" fullWidth {...register('customerName')} />
          <Box
            sx={{
              display: 'grid',
              gap: 2,
              gridTemplateColumns: { xs: '1fr', md: 'repeat(2, minmax(0, 1fr))' },
            }}
          >
            <Box>
              <TextField label="Assignee" select fullWidth {...register('assignee')}>
                {ASSIGNABLE_USERS.map((user) => (
                  <MenuItem key={user.email} value={user.name}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
            <Box>
              <TextField label="Reporter" select fullWidth required {...register('reporter', { required: true })}>
                {ASSIGNABLE_USERS.map((user) => (
                  <MenuItem key={user.email} value={user.name}>
                    {user.name}
                  </MenuItem>
                ))}
              </TextField>
            </Box>
          </Box>
          <TextField
            label="Latest Update"
            fullWidth
            placeholder="Next milestone or target closure date"
            {...register('expectedResolution')}
          />
          <Stack direction="row" spacing={2} alignItems="center">
            <Button component="label" variant="outlined">
              Attach file
              <input type="file" hidden onChange={(e) => setSelectedFile(e.target.files?.[0] ?? null)} />
            </Button>
            {selectedFile && <Typography variant="body2">{selectedFile.name}</Typography>}
          </Stack>
          <Button type="submit" variant="contained" size="large" disabled={isSubmitting} sx={{ alignSelf: 'flex-end' }}>
            Create issue
          </Button>
        </Stack>
      </DialogContent>
    </Dialog>
  );
};

export default NewIssueDialog;

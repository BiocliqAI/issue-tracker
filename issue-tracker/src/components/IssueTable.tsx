import { useMemo, useState } from 'react';
import { Box, Button, Chip, IconButton, Menu, MenuItem, Stack, Tooltip, Typography, Select, FormControl } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import type { GridColDef, GridRenderCellParams } from '@mui/x-data-grid';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import BoltIcon from '@mui/icons-material/Bolt';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import EditIcon from '@mui/icons-material/Edit';
import ArchiveIcon from '@mui/icons-material/Archive';
import type { Issue, IssueFormValues, IssueStatus } from '../types/issue.ts';
import { ISSUE_STATUSES, ASSIGNABLE_USERS } from '../constants/issueOptions.ts';
import IssueEditPopover from './IssueEditPopover.tsx';
import ExpectedResolutionEditPopover from './ExpectedResolutionEditPopover.tsx';

type IssueTableProps = {
  issues: Issue[];
  onOpenIssue: (issue: Issue) => void;
  onChangeStatus: (issueId: string, status: IssueStatus) => Promise<void>;
  onUpdateIssue: (issueId: string, values: Partial<IssueFormValues>, message?: string) => Promise<void>;
  onArchiveIssue: (issueId: string) => Promise<void>;
};

const priorityChipColor: Record<Issue['priority'], 'default' | 'success' | 'warning' | 'error'> = {
  Low: 'default',
  Medium: 'success',
  High: 'warning',
  Critical: 'error',
};

const statusButtonColor: Record<IssueStatus, 'inherit' | 'info' | 'warning' | 'success' | 'primary'> = {
  'New': 'info',
  'In Progress': 'warning',
  'Awaiting Customer': 'inherit',
  'Resolved': 'success',
  'Closed': 'success',
};

const IssueTable = ({
  issues,
  onOpenIssue,
  onChangeStatus,
  onUpdateIssue,
  onArchiveIssue,
}: IssueTableProps) => {
  const [issueEditAnchorEl, setIssueEditAnchorEl] = useState<HTMLElement | null>(null);
  const [issueToEdit, setIssueToEdit] = useState<Issue | null>(null);
  const [expectedResolutionEditAnchorEl, setExpectedResolutionEditAnchorEl] = useState<HTMLElement | null>(null);
  const [expectedResolutionIssueToEdit, setExpectedResolutionIssueToEdit] = useState<Issue | null>(null);

  const handleProcessRowUpdate = async (newRow: Issue) => {
    // No longer handling assignee here as it will be handled by the popover
    return newRow;
  };

  const handleSaveIssueDetails = async (issueId: string, description: string) => {
    await onUpdateIssue(issueId, { description }, 'Issue details updated');
  };

  const handleSaveExpectedResolution = async (issueId: string, expectedResolution: string) => {
    await onUpdateIssue(issueId, { expectedResolution }, 'Expected resolution updated');
  };

  const columns = useMemo<GridColDef<Issue>[]>(
    () => [
      {
        field: 'serialNumber',
        headerName: 'ID',
        width: 50,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <Typography variant="body2">{params.value}</Typography>
          </Box>
        ),
      },
      {
        field: 'description',
        headerName: 'Issue',
        width: 600, // Set a fixed width for the column
        renderCell: (params: GridRenderCellParams<Issue, string>) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <Box
              sx={{
                p: 1,
                borderRadius: 1,
                border: '1px solid rgba(0, 0, 0, 0.12)',
                display: 'flex',
                alignItems: 'center',
                flexWrap: 'wrap',
                cursor: 'pointer',
              }}
              onClick={(event) => {
                setIssueEditAnchorEl(event.currentTarget);
                setIssueToEdit(params.row);
              }}
            >
              <Typography variant="subtitle2" fontWeight={600} sx={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4', maxWidth: '75ch' }}>
                {params.row?.description}
              </Typography>
            </Box>
          </Box>
        ),
      },
      {
        field: 'category',
        headerName: 'Product',
        width: 140,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <Chip label={params.value} variant="outlined" />
          </Box>
        ),
      },
      {
        field: 'priority',
        headerName: 'Priority',
        width: 130,
        renderCell: (params) => {
          if (!params.value) return null;
          return (
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <Chip
                size="small"
                color={priorityChipColor[params.value as Issue['priority']]}
                icon={params.value === 'Critical' ? <BoltIcon fontSize="small" /> : undefined}
                label={params.value}
              />
            </Box>
          );
        },
      },
      {
        field: 'createdAt',
        headerName: 'Open Since',
        width: 120,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <Typography variant="body2">
              {new Date(params.value).toLocaleDateString()}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'assignee',
        headerName: 'Owner',
        width: 160,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <FormControl variant="standard" sx={{ minWidth: 120 }}>
              <Select
                value={params.value || ''}
                onChange={(event) => {
                  onUpdateIssue(params.row.id, { assignee: event.target.value as string }, 'Assignee updated');
                }}
                displayEmpty
                inputProps={{ 'aria-label': 'Assignee select' }}
              >
                <MenuItem value="">
                  <em>Unassigned</em>
                </MenuItem>
                {ASSIGNABLE_USERS.map((user) => (
                  <MenuItem key={user.email} value={user.name}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ),
      },
      {
        field: 'status',
        headerName: 'Status',
        width: 170,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            {params.row ? <StatusMenu issue={params.row} onChange={onChangeStatus} /> : null}
          </Box>
        ),
      },
      {
        field: 'customerName',
        headerName: 'Customer',
        width: 180,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            {params.value}
          </Box>
        ),
      },
      {
        field: 'expectedResolution',
        headerName: 'Latest Update',
        flex: 1,
        minWidth: 180,
        renderCell: (params: GridRenderCellParams<Issue, string>) => (
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, py: 2 }}>
            <Typography variant="body2" color="text.secondary" sx={{ whiteSpace: 'normal', wordBreak: 'break-word', lineHeight: '1.4' }}>
              {params.row?.expectedResolution || 'Not set'}
            </Typography>
          </Box>
        ),
      },
      {
        field: 'editExpectedResolution',
        headerName: '',
        width: 50,
        sortable: false,
        filterable: false,
        renderCell: (params) => (
          <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
            <IconButton
              size="small"
              onClick={(event) => {
                setExpectedResolutionEditAnchorEl(event.currentTarget);
                setExpectedResolutionIssueToEdit(params.row);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Box>
        ),
      },
      {
        field: 'actions',
        headerName: '',
        width: 120,
        sortable: false,
        filterable: false,
        renderCell: (params) =>
          params.row ? (
            <Box sx={{ display: 'flex', alignItems: 'center', py: 2 }}>
              <Stack direction="row" spacing={1}>
                <Tooltip title="Open details">
                  <IconButton color="primary" onClick={() => onOpenIssue(params.row)}>
                    <OpenInNewIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="Archive issue">
                  <IconButton color="error" onClick={() => onArchiveIssue(params.row.id)}>
                    <ArchiveIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Box>
          ) : null,
      },
    ],
    [onChangeStatus, onOpenIssue, onArchiveIssue, onUpdateIssue]
  );

  return (
    <Box sx={{ height: 520, mt: 3 }}>
      <DataGrid<Issue>
        rows={issues}
        columns={columns}
        getRowId={(row) => row.id}
        getRowHeight={() => 'auto'}
        disableRowSelectionOnClick
        processRowUpdate={handleProcessRowUpdate}
        slots={{ toolbar: GridToolbar }}
        slotProps={{ toolbar: { showQuickFilter: true } }}
        sx={{
          border: 'none',
          '& .MuiDataGrid-columnHeaders': {
            bgcolor: 'background.paper',
            borderBottom: '1px solid rgba(15,23,42,0.08)',
          },
          '& .MuiDataGrid-cell': {
            borderBottom: '1px solid rgba(15,23,42,0.06)',
          },
        }}
      />
      {issueToEdit && (
        <IssueEditPopover
          open={Boolean(issueEditAnchorEl)}
          anchorEl={issueEditAnchorEl}
          onClose={() => setIssueEditAnchorEl(null)}
          issue={issueToEdit}
          onSave={handleSaveIssueDetails}
        />
      )}
      {expectedResolutionIssueToEdit && (
        <ExpectedResolutionEditPopover
          open={Boolean(expectedResolutionEditAnchorEl)}
          anchorEl={expectedResolutionEditAnchorEl}
          onClose={() => setExpectedResolutionEditAnchorEl(null)}
          issue={expectedResolutionIssueToEdit}
          onSave={handleSaveExpectedResolution}
        />
      )}
    </Box>
  );
};

const StatusMenu = ({ issue, onChange }: { issue: Issue; onChange: IssueTableProps['onChangeStatus'] }) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  return (
    <>
      <Button
        size="small"
        variant="outlined"
        color={statusButtonColor[issue.status]}
        endIcon={<KeyboardArrowDownIcon fontSize="small" />}
        onClick={(event) => setAnchorEl(event.currentTarget)}
      >
        {issue.status}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={() => setAnchorEl(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        {ISSUE_STATUSES.map((status) => (
          <MenuItem
            key={status}
            selected={status === issue.status}
            onClick={async () => {
              setAnchorEl(null);
              if (status !== issue.status) {
                await onChange(issue.id, status);
              }
            }}
          >
            {status}
          </MenuItem>
        ))}
      </Menu>
    </>
  );
};


export default IssueTable;
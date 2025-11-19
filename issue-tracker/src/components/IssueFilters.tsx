import {
  Box,
  Button,
  Chip,
  Collapse,
  Divider,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/AddCircleOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { debounce } from '@mui/material/utils';
import { useEffect, useMemo, useState } from 'react';
import type { IssueFilters } from '../types/issue.ts';
import { ISSUE_CATEGORIES, ISSUE_PRIORITIES, ISSUE_STATUSES } from '../constants/issueOptions.ts';

type IssueFilterBarProps = {
  value: IssueFilters;
  onChange: (filters: Partial<IssueFilters>) => void;
  onCreate: () => void;
};

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
  PaperProps: {
    style: {
      maxHeight: ITEM_HEIGHT * 5 + ITEM_PADDING_TOP,
      width: 240,
    },
  },
};

const IssueFilterBar = ({ value, onChange, onCreate }: IssueFilterBarProps) => {
  const [expanded, setExpanded] = useState(false);

  const debouncedSearchChange = useMemo(
    () =>
      debounce((searchText: string) => {
        onChange({ search: searchText });
      }, 300),
    [onChange]
  );

  useEffect(() => {
    return () => {
      debouncedSearchChange.clear?.();
    };
  }, [debouncedSearchChange]);

  return (
    <Paper sx={{ p: 3, borderRadius: 3 }}>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ xs: 'stretch', md: 'center' }}>
        <Box flexGrow={1}>
          <Typography variant="h6" gutterBottom fontWeight={700}>
            Command Center Filters
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Slice customer incidents by product, status, assignee, and SLAs.
          </Typography>
        </Box>
        <IconButton
          onClick={() => setExpanded(!expanded)}
          sx={{
            transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.3s',
          }}
        >
          <ExpandMoreIcon />
        </IconButton>
      </Stack>
      <Box sx={{ width: '100%', textAlign: 'center', mt: 2 }}>
        <Button variant="contained" startIcon={<AddIcon />} size="large" onClick={onCreate}>
          Log new issue
        </Button>
      </Box>
      <Collapse in={expanded}>
        <Divider sx={{ my: 3 }} />
        <Box
          sx={{
            display: 'grid',
            gap: 2,
            gridTemplateColumns: {
              xs: '1fr',
              md: 'repeat(4, minmax(0, 1fr))',
            },
          }}
        >
          <Box>
            <FormControl fullWidth>
              <InputLabel>Products</InputLabel>
              <Select
                multiple
                value={value.categories}
                onChange={(event) => onChange({ categories: event.target.value as IssueFilters['categories'] })}
                input={<OutlinedInput label="Products" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((item) => (
                      <Chip key={item} label={item} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {ISSUE_CATEGORIES.map((category) => (
                  <MenuItem key={category} value={category}>
                    {category}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel>Status</InputLabel>
              <Select
                multiple
                value={value.statuses}
                onChange={(event) => onChange({ statuses: event.target.value as IssueFilters['statuses'] })}
                input={<OutlinedInput label="Status" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((item) => (
                      <Chip key={item} label={item} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {ISSUE_STATUSES.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <FormControl fullWidth>
              <InputLabel>Priority</InputLabel>
              <Select
                multiple
                value={value.priorities}
                onChange={(event) => onChange({ priorities: event.target.value as IssueFilters['priorities'] })}
                input={<OutlinedInput label="Priority" />}
                renderValue={(selected) => (
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                    {selected.map((item) => (
                      <Chip key={item} label={item} />
                    ))}
                  </Box>
                )}
                MenuProps={MenuProps}
              >
                {ISSUE_PRIORITIES.map((priority) => (
                  <MenuItem key={priority} value={priority}>
                    {priority}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Search by keyword"
              placeholder="Customer, assignee, or description"
              defaultValue={value.search ?? ''}
              onChange={(event) => debouncedSearchChange(event.target.value)}
            />
          </Box>
          <Box>
            <TextField
              fullWidth
              label="Assignee"
              placeholder="Filter by assignee"
              value={value.assignee ?? ''}
              onChange={(event) => onChange({ assignee: event.target.value || undefined })}
            />
          </Box>
          <Box>
            <Stack direction="row" alignItems="center" spacing={1} height="100%">
              <Switch
                checked={Boolean(value.showOnlyOpen)}
                onChange={(event) => onChange({ showOnlyOpen: event.target.checked })}
              />
              <Box>
                <Typography variant="subtitle2">Only actionable</Typography>
                <Typography variant="body2" color="text.secondary">
                  Hide closed incidents
                </Typography>
              </Box>
            </Stack>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );
};

export default IssueFilterBar;

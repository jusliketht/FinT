import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  IconButton,
  Typography,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { DataTable, FilterBar, SearchInput } from '../../../components/common';
import { formatCurrency, formatDate } from '../../../utils/format';
import JournalEntryForm from './JournalEntryForm';
import JournalEntryDetail from './JournalEntryDetail';

const JournalEntry = ({
  entries,
  accounts,
  onAdd,
  onEdit,
  onDelete,
  onFilterChange,
  onSearch,
  filters,
  loading,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}) => {
  const [deleteDialog, setDeleteDialog] = useState({ open: false, entry: null });
  const [formDialog, setFormDialog] = useState({ open: false, entry: null });
  const [detailDialog, setDetailDialog] = useState({ open: false, entry: null });

  const columns = [
    {
      id: 'date',
      label: 'Date',
      minWidth: 120,
      render: (row) => formatDate(row.date)
    },
    {
      id: 'reference',
      label: 'Reference',
      minWidth: 120
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200
    },
    {
      id: 'status',
      label: 'Status',
      minWidth: 100,
      render: (row) => (
        <Chip
          label={row.status.charAt(0).toUpperCase() + row.status.slice(1)}
          size="small"
          color={row.status === 'posted' ? 'success' : 'warning'}
        />
      )
    },
    {
      id: 'total',
      label: 'Total',
      minWidth: 120,
      align: 'right',
      render: (row) => formatCurrency(row.total)
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 150,
      align: 'center',
      render: (row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => setDetailDialog({ open: true, entry: row })}
            aria-label="view"
          >
            <VisibilityIcon />
          </IconButton>
          {row.status === 'draft' && (
            <>
              <IconButton
                size="small"
                onClick={() => setFormDialog({ open: true, entry: row })}
                aria-label="edit"
              >
                <EditIcon />
              </IconButton>
              <IconButton
                size="small"
                onClick={() => setDeleteDialog({ open: true, entry: row })}
                aria-label="delete"
                color="error"
              >
                <DeleteIcon />
              </IconButton>
            </>
          )}
        </Box>
      )
    }
  ];

  const filterOptions = [
    {
      id: 'status',
      label: 'Status',
      type: 'select',
      value: filters.status || '',
      options: [
        { value: 'draft', label: 'Draft' },
        { value: 'posted', label: 'Posted' }
      ]
    },
    {
      id: 'dateRange',
      label: 'Date Range',
      type: 'dateRange',
      value: filters.dateRange || null
    }
  ];

  const handleDeleteConfirm = () => {
    if (deleteDialog.entry) {
      onDelete(deleteDialog.entry.id);
      setDeleteDialog({ open: false, entry: null });
    }
  };

  const handleFormSubmit = (values) => {
    if (formDialog.entry) {
      onEdit(formDialog.entry.id, values);
    } else {
      onAdd(values);
    }
    setFormDialog({ open: false, entry: null });
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Journal Entries
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setFormDialog({ open: true, entry: null })}
        >
          New Entry
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchInput
          value={filters.search || ''}
          onChange={(value) => onSearch(value)}
          onClear={() => onSearch('')}
          placeholder="Search journal entries..."
        />
      </Box>

      <FilterBar
        filters={filterOptions}
        onFilterChange={onFilterChange}
        onReset={() => {
          onFilterChange('status', '');
          onFilterChange('dateRange', null);
        }}
      />

      <DataTable
        columns={columns}
        data={entries}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, entry: null })}
      >
        <DialogTitle>Delete Journal Entry</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this journal entry?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, entry: null })}
          >
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Journal Entry Form Dialog */}
      <JournalEntryForm
        open={formDialog.open}
        onClose={() => setFormDialog({ open: false, entry: null })}
        onSubmit={handleFormSubmit}
        entry={formDialog.entry}
        accounts={accounts}
        loading={loading}
      />

      {/* Journal Entry Detail Dialog */}
      <JournalEntryDetail
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, entry: null })}
        entry={detailDialog.entry}
      />
    </Box>
  );
};

JournalEntry.propTypes = {
  entries: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      reference: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      status: PropTypes.oneOf(['draft', 'posted']).isRequired,
      total: PropTypes.number.isRequired,
      lines: PropTypes.arrayOf(
        PropTypes.shape({
          id: PropTypes.string.isRequired,
          accountId: PropTypes.string.isRequired,
          account: PropTypes.shape({
            id: PropTypes.string.isRequired,
            code: PropTypes.string.isRequired,
            name: PropTypes.string.isRequired
          }).isRequired,
          debit: PropTypes.number,
          credit: PropTypes.number,
          description: PropTypes.string
        })
      ).isRequired
    })
  ).isRequired,
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })
  ).isRequired,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  filters: PropTypes.shape({
    status: PropTypes.string,
    dateRange: PropTypes.shape({
      startDate: PropTypes.instanceOf(Date),
      endDate: PropTypes.instanceOf(Date)
    }),
    search: PropTypes.string
  }).isRequired,
  loading: PropTypes.bool,
  totalCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired
};

export default JournalEntry; 
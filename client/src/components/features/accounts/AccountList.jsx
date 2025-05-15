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
import { DataTable, FilterBar, SearchInput } from '../../../components/common';
import { formatCurrency } from '../../../utils/format';

const AccountList = ({
  accounts,
  categories,
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
  const [deleteDialog, setDeleteDialog] = useState({ open: false, account: null });

  const columns = [
    {
      id: 'code',
      label: 'Account Code',
      minWidth: 100
    },
    {
      id: 'name',
      label: 'Account Name',
      minWidth: 200
    },
    {
      id: 'category',
      label: 'Category',
      minWidth: 150,
      render: (row) => (
        <Chip 
          label={row.category.name}
          size="small"
          color={row.category.type === 'asset' ? 'primary' : 'secondary'}
        />
      )
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 100,
      render: (row) => (
        <Typography variant="body2" color="text.secondary">
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </Typography>
      )
    },
    {
      id: 'balance',
      label: 'Balance',
      minWidth: 150,
      align: 'right',
      render: (row) => formatCurrency(row.balance)
    },
    {
      id: 'actions',
      label: 'Actions',
      minWidth: 120,
      align: 'center',
      render: (row) => (
        <Box>
          <IconButton
            size="small"
            onClick={() => onEdit(row)}
            aria-label="edit"
          >
            <EditIcon />
          </IconButton>
          <IconButton
            size="small"
            onClick={() => setDeleteDialog({ open: true, account: row })}
            aria-label="delete"
            color="error"
          >
            <DeleteIcon />
          </IconButton>
        </Box>
      )
    }
  ];

  const filterOptions = [
    {
      id: 'category',
      label: 'Category',
      type: 'select',
      value: filters.category || '',
      options: categories.map(cat => ({
        value: cat.id,
        label: cat.name
      }))
    },
    {
      id: 'type',
      label: 'Type',
      type: 'select',
      value: filters.type || '',
      options: [
        { value: 'asset', label: 'Asset' },
        { value: 'liability', label: 'Liability' },
        { value: 'equity', label: 'Equity' },
        { value: 'revenue', label: 'Revenue' },
        { value: 'expense', label: 'Expense' }
      ]
    }
  ];

  const handleDeleteConfirm = () => {
    if (deleteDialog.account) {
      onDelete(deleteDialog.account.id);
      setDeleteDialog({ open: false, account: null });
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5" component="h2">
          Accounts
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAdd}
        >
          Add Account
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <SearchInput
          value={filters.search || ''}
          onChange={(value) => onSearch(value)}
          onClear={() => onSearch('')}
          placeholder="Search accounts..."
        />
      </Box>

      <FilterBar
        filters={filterOptions}
        onFilterChange={onFilterChange}
        onReset={() => {
          onFilterChange('category', '');
          onFilterChange('type', '');
        }}
      />

      <DataTable
        columns={columns}
        data={accounts}
        page={page}
        rowsPerPage={rowsPerPage}
        totalCount={totalCount}
        onPageChange={onPageChange}
        onRowsPerPageChange={onRowsPerPageChange}
      />

      <Dialog
        open={deleteDialog.open}
        onClose={() => setDeleteDialog({ open: false, account: null })}
      >
        <DialogTitle>Delete Account</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete the account "{deleteDialog.account?.name}"?
            This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => setDeleteDialog({ open: false, account: null })}
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
    </Box>
  );
};

AccountList.propTypes = {
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['asset', 'liability', 'equity', 'revenue', 'expense']).isRequired,
      category: PropTypes.shape({
        id: PropTypes.string.isRequired,
        name: PropTypes.string.isRequired,
        type: PropTypes.string.isRequired
      }).isRequired,
      balance: PropTypes.number.isRequired
    })
  ).isRequired,
  categories: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
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
    category: PropTypes.string,
    type: PropTypes.string,
    search: PropTypes.string
  }).isRequired,
  loading: PropTypes.bool,
  totalCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired
};

export default AccountList; 
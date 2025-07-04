import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Button,
  IconButton,
  Text,
  Tag,
  HStack,
  VStack
} from '@chakra-ui/react';
import { DataTable, FilterBar, SearchInput } from '../../../components/common';
import { formatCurrency } from '../../../utils/format';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';

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
        <Tag 
          colorScheme={row.category.type === 'asset' ? 'blue' : 'green'}
          size="sm"
        >
          {row.category.name}
        </Tag>
      )
    },
    {
      id: 'type',
      label: 'Type',
      minWidth: 100,
      render: (row) => (
        <Text fontSize="sm" color="gray.500">
          {row.type.charAt(0).toUpperCase() + row.type.slice(1)}
        </Text>
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
        <HStack spacing={1}>
          <IconButton
            size="sm"
            icon={<ViewIcon />}
            aria-label="View account"
            variant="ghost"
            onClick={() => onEdit(row)}
          />
          <IconButton
            size="sm"
            icon={<EditIcon />}
            aria-label="Edit account"
            variant="ghost"
            onClick={() => onEdit(row)}
          />
          <IconButton
            size="sm"
            icon={<DeleteIcon />}
            aria-label="Delete account"
            variant="ghost"
            colorScheme="red"
            onClick={() => setDeleteDialog({ open: true, account: row })}
          />
        </HStack>
      )
    }
  ];

  const handleDelete = () => {
    if (deleteDialog.account) {
      onDelete(deleteDialog.account.id);
      setDeleteDialog({ open: false, account: null });
    }
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">
            Accounts
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onAdd}
          >
            Add Account
          </Button>
        </HStack>

        <SearchInput
          value={filters.search || ''}
          onChange={(value) => onFilterChange('search', value)}
          onClear={() => onFilterChange('search', '')}
          placeholder="Search accounts..."
        />

        <DataTable
          columns={columns}
          data={accounts}
          loading={loading}
          page={page}
          rowsPerPage={rowsPerPage}
          totalCount={totalCount}
          onPageChange={onPageChange}
          onRowsPerPageChange={onRowsPerPageChange}
        />
      </VStack>

      {/* Delete Confirmation Dialog */}
      {deleteDialog.open && (
        <Box
          position="fixed"
          top={0}
          left={0}
          right={0}
          bottom={0}
          bg="rgba(0, 0, 0, 0.5)"
          zIndex={1000}
          display="flex"
          alignItems="center"
          justifyContent="center"
          onClick={() => setDeleteDialog({ open: false, account: null })}
        >
          <Box
            bg="white"
            borderRadius="md"
            p={6}
            maxW="md"
            w="90%"
            onClick={(e) => e.stopPropagation()}
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>Delete Account</Text>
            <Text mb={6}>
              Are you sure you want to delete the account "{deleteDialog.account?.name}"?
              This action cannot be undone.
            </Text>
            <HStack spacing={3} justifyContent="flex-end">
              <Button
                variant="ghost"
                onClick={() => setDeleteDialog({ open: false, account: null })}
              >
                Cancel
              </Button>
              <Button colorScheme="red" onClick={handleDelete}>
                Delete
              </Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

AccountList.propTypes = {
  accounts: PropTypes.array.isRequired,
  categories: PropTypes.array.isRequired,
  onAdd: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onSearch: PropTypes.func.isRequired,
  filters: PropTypes.object.isRequired,
  loading: PropTypes.bool,
  totalCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired
};

export default AccountList;
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
import { DataTable, SearchInput } from '../../../components/common';
import { formatCurrency, formatDate } from '../../../utils/format';
import JournalEntryForm from './JournalEntryForm';
import JournalEntryDetail from './JournalEntryDetail';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';

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
      id: 'entryNumber',
      label: 'Entry Number',
      minWidth: 120
    },
    {
      id: 'date',
      label: 'Date',
      minWidth: 100,
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
        <Tag 
          colorScheme={
            row.status === 'posted' ? 'green' : 
            row.status === 'draft' ? 'orange' : 'red'
          }
          size="sm"
        >
          {row.status}
        </Tag>
      )
    },
    {
      id: 'total',
      label: 'Total',
      minWidth: 120,
      align: 'right',
      render: (row) => {
        const total = row.lines?.reduce((sum, line) => sum + (line.debit || 0), 0) || 0;
        return formatCurrency(total);
      }
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
            aria-label="View entry"
            variant="ghost"
            onClick={() => setDetailDialog({ open: true, entry: row })}
          />
          <IconButton
            size="sm"
            icon={<EditIcon />}
            aria-label="Edit entry"
            variant="ghost"
            onClick={() => setFormDialog({ open: true, entry: row })}
          />
          <IconButton
            size="sm"
            icon={<DeleteIcon />}
            aria-label="Delete entry"
            variant="ghost"
            colorScheme="red"
            onClick={() => setDeleteDialog({ open: true, entry: row })}
          />
        </HStack>
      )
    }
  ];

  const handleDelete = () => {
    if (deleteDialog.entry) {
      onDelete(deleteDialog.entry.id);
      setDeleteDialog({ open: false, entry: null });
    }
  };

  const handleFormSubmit = (data) => {
    if (formDialog.entry) {
      onEdit(formDialog.entry.id, data);
    } else {
      onAdd(data);
    }
    setFormDialog({ open: false, entry: null });
  };

  return (
    <Box>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="xl" fontWeight="bold">
            Journal Entries
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => setFormDialog({ open: true, entry: null })}
          >
            Add Entry
          </Button>
        </HStack>

        <SearchInput
          value={filters.search || ''}
          onChange={(value) => onFilterChange('search', value)}
          onClear={() => onFilterChange('search', '')}
          placeholder="Search entries..."
        />

        <DataTable
          columns={columns}
          data={entries}
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
          onClick={() => setDeleteDialog({ open: false, entry: null })}
        >
          <Box
            bg="white"
            borderRadius="md"
            p={6}
            maxW="md"
            w="90%"
            onClick={(e) => e.stopPropagation()}
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>Delete Journal Entry</Text>
            <Text mb={6}>
              Are you sure you want to delete the journal entry "{deleteDialog.entry?.entryNumber}"?
              This action cannot be undone.
            </Text>
            <HStack spacing={3} justifyContent="flex-end">
              <Button
                variant="ghost"
                onClick={() => setDeleteDialog({ open: false, entry: null })}
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

      {/* Form Modal */}
      <JournalEntryForm
        open={formDialog.open}
        onClose={() => setFormDialog({ open: false, entry: null })}
        onSubmit={handleFormSubmit}
        entry={formDialog.entry}
        accounts={accounts}
      />

      {/* Detail Modal */}
      <JournalEntryDetail
        open={detailDialog.open}
        onClose={() => setDetailDialog({ open: false, entry: null })}
        entry={detailDialog.entry}
        accounts={accounts}
        onEdit={() => {
          setDetailDialog({ open: false, entry: null });
          setFormDialog({ open: true, entry: detailDialog.entry });
        }}
        onDelete={() => {
          setDetailDialog({ open: false, entry: null });
          setDeleteDialog({ open: true, entry: detailDialog.entry });
        }}
      />
    </Box>
  );
};

JournalEntry.propTypes = {
  entries: PropTypes.array.isRequired,
  accounts: PropTypes.array.isRequired,
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

export default JournalEntry;
import React from 'react';
import { Box, Breadcrumb, BreadcrumbItem, BreadcrumbLink, Text } from '@chakra-ui/react';
import { Link } from 'react-router-dom';
import { ChevronRightIcon, AddIcon } from '@chakra-ui/icons';
import JournalEntryForm from '../../components/features/accounting/JournalEntryForm';
import { useToast } from '../../contexts/ToastContext';

const NewJournalEntry = () => {
  const { showToast } = useToast();

  return (
    <Box>
      {/* Breadcrumb navigation */}
      <Box p={4} mb={4} bg="white" borderRadius="md" shadow="sm">
        <Breadcrumb spacing="8px" separator={<ChevronRightIcon color="gray.500" />}>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/" display="flex" alignItems="center">
              Dashboard
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem>
            <BreadcrumbLink as={Link} to="/journal" display="flex" alignItems="center">
              Journal Entries
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <Text display="flex" alignItems="center" color="blue.500">
              <AddIcon mr={1} />
              New Journal Entry
            </Text>
          </BreadcrumbItem>
        </Breadcrumb>
      </Box>

      <JournalEntryForm />
    </Box>
  );
};

export default NewJournalEntry; 
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  TableContainer,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Badge,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  useDisclosure,
} from '@chakra-ui/react';
import { SearchIcon, AddIcon, EditIcon, ViewIcon } from '@chakra-ui/icons';
import { customerService } from '../../services/customerService';
import { useBusiness } from '../../contexts/BusinessContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import CustomerForm from './CustomerForm';

const CustomerList = () => {
  const { selectedBusiness } = useBusiness();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  const fetchCustomers = useCallback(async () => {
    if (!selectedBusiness) return;

    setLoading(true);
    setError(null);

    try {
      const params = {
        businessId: selectedBusiness.id,
        search: searchTerm,
      };

      const response = await customerService.getAll(params);
      setCustomers(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch customers');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, searchTerm]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchCustomers();
    }
  }, [selectedBusiness, fetchCustomers]);

  const handleEdit = (customer) => {
    setSelectedCustomer(customer);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedCustomer(null);
    onOpen();
  };

  const handleFormSubmit = () => {
    onClose();
    fetchCustomers();
  };

  if (loading) return <LoadingSpinner />;
  if (error) return <ErrorMessage message={error} />;

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <Heading size="md">Customers</Heading>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={handleCreate}
              >
                Add Customer
              </Button>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <InputGroup>
                <InputLeftElement pointerEvents="none">
                  <SearchIcon color="gray.300" />
                </InputLeftElement>
                <Input
                  placeholder="Search customers..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </InputGroup>

              <TableContainer>
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Name</Th>
                      <Th>Email</Th>
                      <Th>Phone</Th>
                      <Th>City</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {customers.map((customer) => (
                      <Tr key={customer.id}>
                        <Td fontWeight="medium">{customer.name}</Td>
                        <Td>{customer.email || '-'}</Td>
                        <Td>{customer.phone || '-'}</Td>
                        <Td>{customer.city || '-'}</Td>
                        <Td>
                          <Badge
                            colorScheme={customer.isActive ? 'green' : 'red'}
                            variant="subtle"
                          >
                            {customer.isActive ? 'Active' : 'Inactive'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <IconButton
                              icon={<ViewIcon />}
                              size="sm"
                              variant="ghost"
                              aria-label="View customer"
                              onClick={() => handleEdit(customer)}
                            />
                            <IconButton
                              icon={<EditIcon />}
                              size="sm"
                              variant="ghost"
                              aria-label="Edit customer"
                              onClick={() => handleEdit(customer)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              </TableContainer>

              {customers.length === 0 && (
                <Text textAlign="center" color="gray.500">
                  No customers found
                </Text>
              )}
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      <CustomerForm
        isOpen={isOpen}
        onClose={onClose}
        customer={selectedCustomer}
        onSubmit={handleFormSubmit}
      />
    </Box>
  );
};

export default CustomerList; 
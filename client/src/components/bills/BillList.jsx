import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  useToast,
  SimpleGrid,
  Skeleton,
  Alert,
  AlertIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Input,
  Select,
  InputGroup,
  InputLeftElement,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon, SearchIcon } from '@chakra-ui/icons';
import billService from '../../services/billService';
import { useBusiness } from '../../contexts/BusinessContext';
import LoadingSpinner from '../common/LoadingSpinner';
import ErrorMessage from '../common/ErrorMessage';
import BillForm from './BillForm';

const BillList = ({ onBillCreated }) => {
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [bills, setBills] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBill, setSelectedBill] = useState(null);

  const fetchBills = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await billService.getAll();
      setBills(response.data || response);
    } catch (err) {
      setError('Failed to fetch bills');
      toast({
        title: 'Error',
        description: 'Failed to load bills',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchBills();
    }
  }, [selectedBusiness, fetchBills]);

  const handleEdit = (bill) => {
    setSelectedBill(bill);
    onOpen();
  };

  const handleCreate = () => {
    setSelectedBill(null);
    onOpen();
  };

  const handleFormSubmit = () => {
    onClose();
    fetchBills();
    if (onBillCreated) {
      onBillCreated();
    }
    toast({
      title: 'Success',
      description: 'Bill saved successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleDelete = async (billId) => {
    if (window.confirm('Are you sure you want to delete this bill?')) {
      try {
        await billService.delete(billId);
        fetchBills();
        toast({
          title: 'Success',
          description: 'Bill deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to delete bill',
          status: 'error',
          duration: 3000,
          isClosable: true,
        });
      }
    }
  };

  const handleMarkAsPaid = async (billId) => {
    try {
      await billService.markAsPaid(billId);
      fetchBills();
      toast({
        title: 'Success',
        description: 'Bill marked as paid',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to mark bill as paid',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'RECEIVED': return 'blue';
      case 'PAID': return 'green';
      case 'OVERDUE': return 'red';
      case 'VOID': return 'blackAlpha';
      default: return 'gray';
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const filteredBills = bills.filter(bill =>
    bill.vendorName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    bill.billNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  ).filter(bill => !statusFilter || bill.status === statusFilter);

  if (loading) {
    return (
      <VStack spacing={4} align="stretch">
        <Skeleton height="40px" />
        <Skeleton height="200px" />
        <Skeleton height="200px" />
      </VStack>
    );
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={fetchBills} />;
  }

  return (
    <VStack spacing={6} align="stretch">
      {/* Filters */}
      <HStack spacing={4}>
        <InputGroup maxW="300px">
          <InputLeftElement pointerEvents="none">
            <SearchIcon color="gray.300" />
          </InputLeftElement>
          <Input
            placeholder="Search bills..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </InputGroup>
        <Select
          placeholder="Filter by status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          maxW="200px"
        >
          <option value="DRAFT">Draft</option>
          <option value="RECEIVED">Received</option>
          <option value="PAID">Paid</option>
          <option value="OVERDUE">Overdue</option>
          <option value="VOID">Void</option>
        </Select>
      </HStack>

      {/* Bills Table */}
      <Box overflowX="auto">
        <Table variant="simple">
          <Thead>
            <Tr>
              <Th>Bill #</Th>
              <Th>Vendor</Th>
              <Th>Issue Date</Th>
              <Th>Due Date</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {filteredBills.length === 0 ? (
              <Tr>
                <Td colSpan={7} textAlign="center" py={8}>
                  <VStack spacing={2}>
                    <Text color="gray.500">No bills found</Text>
                    <Button size="sm" colorScheme="blue" onClick={handleCreate}>
                      Create First Bill
                    </Button>
                  </VStack>
                </Td>
              </Tr>
            ) : (
              filteredBills.map((bill) => (
                <Tr key={bill.id}>
                  <Td fontWeight="bold">{bill.billNumber}</Td>
                  <Td>{bill.vendorName}</Td>
                  <Td>{new Date(bill.issueDate).toLocaleDateString()}</Td>
                  <Td>{new Date(bill.dueDate).toLocaleDateString()}</Td>
                  <Td fontWeight="bold">{formatCurrency(bill.totalAmount)}</Td>
                  <Td>
                    <Badge colorScheme={getStatusColor(bill.status)}>
                      {bill.status}
                    </Badge>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        size="sm"
                        icon={<ViewIcon />}
                        onClick={() => handleEdit(bill)}
                        aria-label="View bill"
                      />
                      {bill.status === 'RECEIVED' && (
                        <IconButton
                          size="sm"
                          colorScheme="green"
                          onClick={() => handleMarkAsPaid(bill.id)}
                          aria-label="Mark as paid"
                        >
                          ✓
                        </IconButton>
                      )}
                      {bill.status === 'DRAFT' && (
                        <>
                          <IconButton
                            size="sm"
                            colorScheme="blue"
                            icon={<EditIcon />}
                            onClick={() => handleEdit(bill)}
                            aria-label="Edit bill"
                          />
                          <IconButton
                            size="sm"
                            colorScheme="red"
                            icon={<DeleteIcon />}
                            onClick={() => handleDelete(bill.id)}
                            aria-label="Delete bill"
                          />
                        </>
                      )}
                    </HStack>
                  </Td>
                </Tr>
              ))
            )}
          </Tbody>
        </Table>
      </Box>

      {/* Bill Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedBill ? 'Edit Bill' : 'Create New Bill'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <BillForm
              bill={selectedBill}
              onSuccess={handleFormSubmit}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </VStack>
  );
};

export default BillList; 
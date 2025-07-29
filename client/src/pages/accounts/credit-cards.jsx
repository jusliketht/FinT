import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Card,
  CardBody,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Button,
  Badge,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  useDisclosure
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon, DownloadIcon } from '@chakra-ui/icons';
import { useApi } from '../../hooks/useApi';

const CreditCards = () => {
  const api = useApi();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [loading, setLoading] = useState(false);
  const [creditCards, setCreditCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [formData, setFormData] = useState({
    cardName: '',
    cardNumber: '',
    cardType: '',
    bankName: '',
    creditLimit: '',
    dueDate: '',
    statementDate: ''
  });

  const fetchCreditCards = useCallback(async () => {
    setLoading(true);
    try {
      const response = await api.get('/credit-cards');
      setCreditCards(response.data);
    } catch (error) {
      console.error('Error fetching credit cards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load credit cards',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [api, toast]);

  useEffect(() => {
    fetchCreditCards();
  }, [fetchCreditCards]);

  const handleAddCard = () => {
    setSelectedCard(null);
    setFormData({
      cardName: '',
      cardNumber: '',
      cardType: '',
      bankName: '',
      creditLimit: '',
      dueDate: '',
      statementDate: ''
    });
    onOpen();
  };

  const handleEditCard = (card) => {
    setSelectedCard(card);
    setFormData({
      cardName: card.cardName || '',
      cardNumber: card.cardNumber || '',
      cardType: card.cardType || '',
      bankName: card.bankName || '',
      creditLimit: card.creditLimit || '',
      dueDate: card.dueDate || '',
      statementDate: card.statementDate || ''
    });
    onOpen();
  };

  const handleDeleteCard = async (cardId) => {
    if (!window.confirm('Are you sure you want to delete this credit card?')) {
      return;
    }

    try {
      await api.delete(`/credit-cards/${cardId}`);
      toast({
        title: 'Success',
        description: 'Credit card deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchCreditCards();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete credit card',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleSubmit = async () => {
    try {
      if (selectedCard) {
        await api.put(`/credit-cards/${selectedCard.id}`, formData);
        toast({
          title: 'Success',
          description: 'Credit card updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        await api.post('/credit-cards', formData);
        toast({
          title: 'Success',
          description: 'Credit card added successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      onClose();
      fetchCreditCards();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to save credit card',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getCardTypeColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'visa': return 'blue';
      case 'mastercard': return 'red';
      case 'amex': return 'green';
      case 'rupay': return 'purple';
      default: return 'gray';
    }
  };

  const calculateTotalCreditLimit = () => {
    return creditCards.reduce((total, card) => total + (parseFloat(card.creditLimit) || 0), 0);
  };

  const calculateTotalOutstanding = () => {
    return creditCards.reduce((total, card) => total + (parseFloat(card.outstandingAmount) || 0), 0);
  };

  const calculateUtilizationRate = () => {
    const totalLimit = calculateTotalCreditLimit();
    const totalOutstanding = calculateTotalOutstanding();
    return totalLimit > 0 ? (totalOutstanding / totalLimit) * 100 : 0;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={10}>
        <Spinner size="xl" />
        <Text mt={4}>Loading Credit Cards...</Text>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>Credit Cards</Heading>
            <Text color="gray.600">
              Manage your credit cards and track expenses
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            onClick={handleAddCard}
            colorScheme="blue"
          >
            Add New Card
          </Button>
        </HStack>

        {/* Summary Stats */}
        <StatGroup>
          <Stat>
            <StatLabel>Total Cards</StatLabel>
            <StatNumber color="blue.500">{creditCards.length}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Credit Limit</StatLabel>
            <StatNumber color="green.500">
              {formatCurrency(calculateTotalCreditLimit())}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Total Outstanding</StatLabel>
            <StatNumber color="red.500">
              {formatCurrency(calculateTotalOutstanding())}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Utilization Rate</StatLabel>
            <StatNumber color={calculateUtilizationRate() > 80 ? 'red.500' : 'green.500'}>
              {calculateUtilizationRate().toFixed(1)}%
            </StatNumber>
          </Stat>
        </StatGroup>

        {/* Credit Cards Table */}
        <Card>
          <CardBody>
            <VStack spacing={4} align="stretch">
              <HStack justify="space-between">
                <Heading size="md">Credit Cards</Heading>
                <Text fontSize="sm" color="gray.600">
                  {creditCards.length} cards
                </Text>
              </HStack>

              {creditCards.length > 0 ? (
                <Table variant="simple" size="sm">
                  <Thead>
                    <Tr>
                      <Th>Card Name</Th>
                      <Th>Bank</Th>
                      <Th>Type</Th>
                      <Th>Credit Limit</Th>
                      <Th>Outstanding</Th>
                      <Th>Due Date</Th>
                      <Th>Status</Th>
                      <Th>Actions</Th>
                    </Tr>
                  </Thead>
                  <Tbody>
                    {creditCards.map((card) => (
                      <Tr key={card.id}>
                        <Td fontWeight="medium">{card.cardName}</Td>
                        <Td>{card.bankName}</Td>
                        <Td>
                          <Badge colorScheme={getCardTypeColor(card.cardType)} size="sm">
                            {card.cardType}
                          </Badge>
                        </Td>
                        <Td color="green.500" fontWeight="medium">
                          {formatCurrency(card.creditLimit)}
                        </Td>
                        <Td color="red.500" fontWeight="medium">
                          {formatCurrency(card.outstandingAmount)}
                        </Td>
                        <Td>{formatDate(card.dueDate)}</Td>
                        <Td>
                          <Badge 
                            colorScheme={card.outstandingAmount > 0 ? 'red' : 'green'} 
                            size="sm"
                          >
                            {card.outstandingAmount > 0 ? 'Outstanding' : 'Paid'}
                          </Badge>
                        </Td>
                        <Td>
                          <HStack spacing={2}>
                            <Button
                              size="sm"
                              icon={<ViewIcon />}
                              aria-label="View card"
                              variant="ghost"
                            />
                            <Button
                              size="sm"
                              icon={<EditIcon />}
                              aria-label="Edit card"
                              variant="ghost"
                              onClick={() => handleEditCard(card)}
                            />
                            <Button
                              size="sm"
                              icon={<DeleteIcon />}
                              aria-label="Delete card"
                              variant="ghost"
                              colorScheme="red"
                              onClick={() => handleDeleteCard(card.id)}
                            />
                          </HStack>
                        </Td>
                      </Tr>
                    ))}
                  </Tbody>
                </Table>
              ) : (
                <Alert status="info">
                  <AlertIcon />
                  No credit cards found. Add your first credit card to get started.
                </Alert>
              )}
            </VStack>
          </CardBody>
        </Card>

        {/* Add/Edit Card Modal */}
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>
              {selectedCard ? 'Edit Credit Card' : 'Add New Credit Card'}
            </ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <VStack spacing={4}>
                <FormControl>
                  <FormLabel>Card Name</FormLabel>
                  <Input
                    value={formData.cardName}
                    onChange={(e) => setFormData({ ...formData, cardName: e.target.value })}
                    placeholder="e.g., HDFC Regalia"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Card Number (Last 4 digits)</FormLabel>
                  <Input
                    value={formData.cardNumber}
                    onChange={(e) => setFormData({ ...formData, cardNumber: e.target.value })}
                    placeholder="1234"
                    maxLength={4}
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Card Type</FormLabel>
                  <Select
                    value={formData.cardType}
                    onChange={(e) => setFormData({ ...formData, cardType: e.target.value })}
                    placeholder="Select card type"
                  >
                    <option value="Visa">Visa</option>
                    <option value="Mastercard">Mastercard</option>
                    <option value="American Express">American Express</option>
                    <option value="RuPay">RuPay</option>
                  </Select>
                </FormControl>
                <FormControl>
                  <FormLabel>Bank Name</FormLabel>
                  <Input
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="e.g., HDFC Bank"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Credit Limit</FormLabel>
                  <Input
                    value={formData.creditLimit}
                    onChange={(e) => setFormData({ ...formData, creditLimit: e.target.value })}
                    placeholder="500000"
                    type="number"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Due Date</FormLabel>
                  <Input
                    value={formData.dueDate}
                    onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                    type="date"
                  />
                </FormControl>
                <FormControl>
                  <FormLabel>Statement Date</FormLabel>
                  <Input
                    value={formData.statementDate}
                    onChange={(e) => setFormData({ ...formData, statementDate: e.target.value })}
                    type="date"
                  />
                </FormControl>
              </VStack>
            </ModalBody>
            <ModalFooter>
              <Button variant="ghost" mr={3} onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue" onClick={handleSubmit}>
                {selectedCard ? 'Update' : 'Add'} Card
              </Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </VStack>
    </Box>
  );
};

export default CreditCards; 
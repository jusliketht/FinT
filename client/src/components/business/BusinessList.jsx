import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Card,
  CardBody,
  CardHeader,
  Heading,
  Text,
  Badge,
  HStack,
  VStack,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Avatar,
  AvatarGroup
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon, UsersIcon } from '@chakra-ui/icons';
import businessService from '../../services/businessService';
import BusinessForm from './BusinessForm';
import BusinessUsers from './BusinessUsers';

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [showUsers, setShowUsers] = useState(false);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getAll();
      setBusinesses(data);
    } catch (err) {
      setError('Failed to fetch businesses');
      toast({
        title: 'Error',
        description: 'Failed to load businesses',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = () => {
    setSelectedBusiness(null);
    onOpen();
  };

  const handleEdit = (business) => {
    setSelectedBusiness(business);
    onOpen();
  };

  const handleDelete = async (business) => {
    if (!window.confirm(`Are you sure you want to delete ${business.name}? This action cannot be undone.`)) {
      return;
    }

    try {
      await businessService.delete(business.id);
      toast({
        title: 'Success',
        description: 'Business deleted successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchBusinesses();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to delete business',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleViewUsers = (business) => {
    setSelectedBusiness(business);
    setShowUsers(true);
  };

  const handleFormSuccess = () => {
    onClose();
    fetchBusinesses();
    toast({
      title: 'Success',
      description: selectedBusiness ? 'Business updated successfully' : 'Business created successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const getBusinessTypeColor = (type) => {
    const colors = {
      sole_proprietorship: 'blue',
      partnership: 'green',
      corporation: 'purple',
      llc: 'orange'
    };
    return colors[type] || 'gray';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading businesses...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  if (showUsers && selectedBusiness) {
    return (
      <BusinessUsers 
        business={selectedBusiness}
        onBack={() => setShowUsers(false)}
      />
    );
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">My Businesses</Heading>
        <Button
          leftIcon={<AddIcon />}
          colorScheme="blue"
          onClick={handleCreate}
        >
          Create Business
        </Button>
      </HStack>

      {businesses.length === 0 ? (
        <Card>
          <CardBody textAlign="center" py={12}>
            <Text fontSize="lg" color="gray.500" mb={4}>
              You don't have any businesses yet
            </Text>
            <Button colorScheme="blue" onClick={handleCreate}>
              Create Your First Business
            </Button>
          </CardBody>
        </Card>
      ) : (
        <VStack spacing={4} align="stretch">
          {businesses.map((business) => (
            <Card key={business.id} variant="outline">
              <CardHeader>
                <HStack justify="space-between">
                  <VStack align="start" spacing={2}>
                    <Heading size="md">{business.name}</Heading>
                    <HStack spacing={4}>
                      <Badge colorScheme={getBusinessTypeColor(business.type)}>
                        {business.type.replace('_', ' ').toUpperCase()}
                      </Badge>
                      {business.registrationNumber && (
                        <Text fontSize="sm" color="gray.600">
                          Reg: {business.registrationNumber}
                        </Text>
                      )}
                    </HStack>
                  </VStack>
                  <HStack spacing={2}>
                    <IconButton
                      icon={<UsersIcon />}
                      aria-label="View users"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleViewUsers(business)}
                    />
                    <IconButton
                      icon={<EditIcon />}
                      aria-label="Edit business"
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEdit(business)}
                    />
                    <IconButton
                      icon={<DeleteIcon />}
                      aria-label="Delete business"
                      size="sm"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(business)}
                    />
                  </HStack>
                </HStack>
              </CardHeader>
              <CardBody pt={0}>
                <VStack align="start" spacing={3}>
                  {business.description && (
                    <Text color="gray.600">{business.description}</Text>
                  )}
                  
                  <HStack spacing={6} fontSize="sm" color="gray.500">
                    {business.incorporationDate && (
                      <Text>Incorporated: {formatDate(business.incorporationDate)}</Text>
                    )}
                    {business.fiscalYearStart && business.fiscalYearEnd && (
                      <Text>
                        Fiscal Year: {formatDate(business.fiscalYearStart)} - {formatDate(business.fiscalYearEnd)}
                      </Text>
                    )}
                  </HStack>

                  {business.address && (
                    <Text fontSize="sm" color="gray.500">
                      📍 {business.address}
                      {business.city && `, ${business.city}`}
                      {business.state && `, ${business.state}`}
                    </Text>
                  )}

                  {business.Users && business.Users.length > 0 && (
                    <Box>
                      <Text fontSize="sm" fontWeight="medium" mb={2}>
                        Team Members ({business.Users.length})
                      </Text>
                      <AvatarGroup size="sm" max={3}>
                        {business.Users.map((userBusiness) => (
                          <Avatar
                            key={userBusiness.User.id}
                            name={userBusiness.User.name}
                            src={userBusiness.User.avatar}
                            title={`${userBusiness.User.name} (${userBusiness.role})`}
                          />
                        ))}
                      </AvatarGroup>
                    </Box>
                  )}
                </VStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      )}

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedBusiness ? 'Edit Business' : 'Create New Business'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <BusinessForm
              business={selectedBusiness}
              onSuccess={handleFormSuccess}
              onCancel={onClose}
            />
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BusinessList; 
import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Card,
  CardBody,
  CardHeader,
  Badge,
  IconButton,
  useDisclosure,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Avatar,
  AvatarGroup,
  AvatarBadge,
} from '@chakra-ui/react';
import { DeleteIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../contexts/BusinessContext';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import BusinessForm from './BusinessForm';

const BusinessList = () => {
  const { businesses, loading, error, fetchBusinesses, deleteBusiness } = useBusiness();
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [selectedBusiness, setSelectedBusiness] = useState(null);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleEdit = (business) => {
    setSelectedBusiness(business);
    onOpen();
  };

  const handleDelete = async (businessId) => {
    try {
      await deleteBusiness(businessId);
      showToast('Business deleted successfully', 'success');
    } catch (error) {
      showToast('Failed to delete business', 'error');
    }
  };

  const handleFormClose = () => {
    setSelectedBusiness(null);
    onClose();
  };

  const handleFormSuccess = () => {
    handleFormClose();
    fetchBusinesses();
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading businesses...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <Box>
          <AlertTitle>Error loading businesses</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Box>
      </Alert>
    );
  }

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Box>
            <Text fontSize="2xl" fontWeight="bold">
              My Businesses
            </Text>
            <Text color="gray.600">
              Manage your business accounts and settings
            </Text>
          </Box>
          <Button colorScheme="blue" onClick={onOpen}>
            Add Business
          </Button>
        </HStack>

        {businesses.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={12}>
              <Text fontSize="lg" color="gray.500" mb={4}>
                No businesses found
              </Text>
              <Text color="gray.400" mb={6}>
                Create your first business to get started with financial management
              </Text>
              <Button colorScheme="blue" onClick={onOpen}>
                Create Business
              </Button>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {businesses.map((business) => (
              <Card key={business.id} variant="outline">
                <CardHeader>
                  <HStack justify="space-between" align="center">
                    <HStack spacing={4}>
                      <Avatar
                        name={business.name}
                        bg="blue.500"
                        size="md"
                      >
                        <AvatarBadge
                          boxSize="1em"
                          bg={business.isActive ? 'green.500' : 'gray.400'}
                        />
                      </Avatar>
                      <Box>
                        <Text fontSize="lg" fontWeight="semibold">
                          {business.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {business.type} • {business.address}
                        </Text>
                      </Box>
                    </HStack>
                    <HStack spacing={2}>
                      {business.isDefault && (
                        <Badge colorScheme="green" variant="subtle">
                          Default
                        </Badge>
                      )}
                      <Badge
                        colorScheme={business.isActive ? 'green' : 'gray'}
                        variant="subtle"
                      >
                        {business.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={3} align="stretch">
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Registration: {business.registrationNumber || 'Not specified'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        GST: {business.gstNumber || 'Not specified'}
                      </Text>
                    </HStack>
                    
                    <HStack justify="space-between">
                      <Text fontSize="sm" color="gray.600">
                        Phone: {business.phone || 'Not specified'}
                      </Text>
                      <Text fontSize="sm" color="gray.600">
                        Email: {business.email || 'Not specified'}
                      </Text>
                    </HStack>

                    <HStack justify="end" spacing={2}>
                      <IconButton
                        icon={<ViewIcon />}
                        variant="ghost"
                        size="sm"
                        aria-label="View details"
                        onClick={() => handleEdit(business)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        variant="ghost"
                        size="sm"
                        colorScheme="red"
                        aria-label="Delete business"
                        onClick={() => handleDelete(business.id)}
                        isDisabled={business.isDefault}
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Business Form Modal */}
      <BusinessForm
        isOpen={isOpen}
        onClose={handleFormClose}
        business={selectedBusiness}
        onSuccess={handleFormSuccess}
      />
    </Box>
  );
};

export default BusinessList; 
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Input,
  Text,
  Card,
  CardBody,
  SimpleGrid,
  Tooltip,
  IconButton,
  Select,
  Textarea,
  VStack,
  HStack,
  useDisclosure,
  Heading
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../contexts/BusinessContext';
import { useToast } from '../../contexts/ToastContext';
import { BusinessType } from '../../constants/businessTypes';

const BusinessSelector = () => {
  const navigate = useNavigate();
  const { businesses, setSelectedBusiness, createBusiness, deleteBusiness, loading, error } = useBusiness();
  const { showToast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [newBusiness, setNewBusiness] = useState({
    name: '',
    registrationNumber: '',
    type: BusinessType.SoleProprietorship,
    description: ''
  });

  const handleSelectBusiness = (business) => {
    setSelectedBusiness(business);
    navigate('/');
  };

  const handleCreateBusiness = async () => {
    try {
      await createBusiness(newBusiness);
      onClose();
      setNewBusiness({
        name: '',
        registrationNumber: '',
        type: BusinessType.SoleProprietorship,
        description: ''
      });
      showToast('Business created successfully', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to create business', 'error');
    }
  };

  const handleDeleteBusiness = async (businessId, event) => {
    event.stopPropagation();
    if (window.confirm('Are you sure you want to delete this business? This action cannot be undone.')) {
      try {
        await deleteBusiness(businessId);
        showToast('Business deleted successfully', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to delete business', 'error');
      }
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Text>Loading businesses...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <Text color="red.500">{error}</Text>
      </Box>
    );
  }

  return (
    <Box p={3}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Heading size="lg">Select a Business</Heading>
        <Button
          colorScheme="blue"
          leftIcon={<AddIcon />}
          onClick={onOpen}
        >
          Create New Business
        </Button>
      </Box>

      <SimpleGrid columns={{ base: 1, sm: 2, md: 3 }} spacing={3}>
        {businesses.map((business) => (
          <Card
            key={business.id}
            cursor="pointer"
            _hover={{ boxShadow: 'lg' }}
            onClick={() => handleSelectBusiness(business)}
          >
            <CardBody>
              <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                <Heading size="md" mb={2}>
                  {business.name}
                </Heading>
                <HStack>
                  <Tooltip label="Edit Business">
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/businesses/${business.id}`);
                      }}
                    />
                  </Tooltip>
                  <Tooltip label="Delete Business">
                    <IconButton
                      size="sm"
                      colorScheme="red"
                      icon={<DeleteIcon />}
                      onClick={(e) => handleDeleteBusiness(business.id, e)}
                    />
                  </Tooltip>
                </HStack>
              </Box>
              <Text color="gray.600" mb={2}>
                {business.type}
              </Text>
              <Text color="gray.600" fontSize="sm">
                Registration: {business.registrationNumber}
              </Text>
              {business.description && (
                <Text color="gray.600" fontSize="sm" mt={2}>
                  {business.description}
                </Text>
              )}
            </CardBody>
          </Card>
        ))}
      </SimpleGrid>

      {isOpen && (
        <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
          <Box bg="white" p={8} borderRadius="lg" minW="350px" boxShadow="lg">
            <Heading size="md" mb={4}>Create New Business</Heading>
            <VStack spacing={4}>
              <Box>
                <Text fontWeight="medium" mb={2}>Business Name *</Text>
                <Input
                  value={newBusiness.name}
                  onChange={(e) => setNewBusiness({ ...newBusiness, name: e.target.value })}
                />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Registration Number *</Text>
                <Input
                  value={newBusiness.registrationNumber}
                  onChange={(e) => setNewBusiness({ ...newBusiness, registrationNumber: e.target.value })}
                />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Business Type *</Text>
                <Select
                  value={newBusiness.type}
                  onChange={(e) => setNewBusiness({ ...newBusiness, type: e.target.value })}
                >
                  {Object.entries(BusinessType).map(([key, value]) => (
                    <option key={key} value={value}>
                      {key.replace(/([A-Z])/g, ' $1').trim()}
                    </option>
                  ))}
                </Select>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Description</Text>
                <Textarea
                  value={newBusiness.description}
                  onChange={(e) => setNewBusiness({ ...newBusiness, description: e.target.value })}
                  rows={3}
                />
              </Box>
            </VStack>
            <HStack mt={6} justify="flex-end">
              <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleCreateBusiness}>Create</Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BusinessSelector; 
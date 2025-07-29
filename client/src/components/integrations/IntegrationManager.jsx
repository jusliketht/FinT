import React, { useState, useEffect, useCallback } from 'react';
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
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Input,
  Select,
  Switch,
} from '@chakra-ui/react';
import { SettingsIcon, DeleteIcon, EditIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../contexts/BusinessContext';
import { useToast } from '../../contexts/ToastContext';

const IntegrationManager = () => {
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    apiKey: '',
    apiSecret: '',
    webhookUrl: '',
    isActive: false,
  });

  const fetchIntegrations = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      // Replace with actual API call
      const response = await fetch(`/api/businesses/${selectedBusiness.id}/integrations`);
      if (response.ok) {
        const data = await response.json();
        setIntegrations(data.data || []);
      } else {
        throw new Error('Failed to fetch integrations');
      }
    } catch (err) {
      setError(err.message);
      showToast('Failed to load integrations', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness, showToast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchIntegrations();
    }
  }, [selectedBusiness, fetchIntegrations]);

  const handleCreate = () => {
    setSelectedIntegration(null);
    setFormData({
      name: '',
      type: '',
      apiKey: '',
      apiSecret: '',
      webhookUrl: '',
      isActive: false,
    });
    onOpen();
  };

  const handleEdit = (integration) => {
    setSelectedIntegration(integration);
    setFormData({
      name: integration.name,
      type: integration.type,
      apiKey: integration.apiKey || '',
      apiSecret: integration.apiSecret || '',
      webhookUrl: integration.webhookUrl || '',
      isActive: integration.isActive,
    });
    onOpen();
  };

  const handleDelete = async (integrationId) => {
    try {
      const response = await fetch(`/api/businesses/${selectedBusiness.id}/integrations/${integrationId}`, {
        method: 'DELETE',
      });
      if (response.ok) {
        showToast('Integration deleted successfully', 'success');
        fetchIntegrations();
      } else {
        throw new Error('Failed to delete integration');
      }
    } catch (error) {
      showToast('Failed to delete integration', 'error');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const url = selectedIntegration
        ? `/api/businesses/${selectedBusiness.id}/integrations/${selectedIntegration.id}`
        : `/api/businesses/${selectedBusiness.id}/integrations`;
      
      const method = selectedIntegration ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        showToast(
          selectedIntegration ? 'Integration updated successfully' : 'Integration created successfully',
          'success'
        );
        onClose();
        fetchIntegrations();
      } else {
        throw new Error('Failed to save integration');
      }
    } catch (error) {
      showToast('Failed to save integration', 'error');
    }
  };

  const getIntegrationTypeColor = (type) => {
    const colors = {
      bank: 'blue',
      payment: 'green',
      accounting: 'purple',
      crm: 'orange',
      erp: 'teal',
    };
    return colors[type] || 'gray';
  };

  const getIntegrationTypeLabel = (type) => {
    const labels = {
      bank: 'Bank Integration',
      payment: 'Payment Gateway',
      accounting: 'Accounting Software',
      crm: 'CRM System',
      erp: 'ERP System',
    };
    return labels[type] || type;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="lg" />
        <Text mt={4}>Loading integrations...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error" borderRadius="lg">
        <AlertIcon />
        <Box>
          <AlertTitle>Error loading integrations</AlertTitle>
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
              Integrations
            </Text>
            <Text color="gray.600">
              Connect with external services and APIs
            </Text>
          </Box>
          <Button colorScheme="blue" onClick={handleCreate}>
            Add Integration
          </Button>
        </HStack>

        {integrations.length === 0 ? (
          <Card>
            <CardBody textAlign="center" py={12}>
              <Text fontSize="lg" color="gray.500" mb={4}>
                No integrations found
              </Text>
              <Text color="gray.400" mb={6}>
                Connect your FinT account with external services to streamline your workflow
              </Text>
              <Button colorScheme="blue" onClick={handleCreate}>
                Add First Integration
              </Button>
            </CardBody>
          </Card>
        ) : (
          <VStack spacing={4} align="stretch">
            {integrations.map((integration) => (
              <Card key={integration.id} variant="outline">
                <CardHeader>
                  <HStack justify="space-between" align="center">
                    <HStack spacing={4}>
                      <Box>
                        <Text fontSize="lg" fontWeight="semibold">
                          {integration.name}
                        </Text>
                        <Text fontSize="sm" color="gray.600">
                          {getIntegrationTypeLabel(integration.type)}
                        </Text>
                      </Box>
                    </HStack>
                    <HStack spacing={2}>
                      <Badge
                        colorScheme={integration.isActive ? 'green' : 'gray'}
                        variant="subtle"
                      >
                        {integration.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                      <Badge colorScheme={getIntegrationTypeColor(integration.type)}>
                        {integration.type}
                      </Badge>
                    </HStack>
                  </HStack>
                </CardHeader>
                <CardBody pt={0}>
                  <VStack spacing={3} align="stretch">
                    {integration.webhookUrl && (
                      <Text fontSize="sm" color="gray.600">
                        Webhook: {integration.webhookUrl}
                      </Text>
                    )}
                    
                    <HStack justify="end" spacing={2}>
                      <IconButton
                        icon={<EditIcon />}
                        variant="ghost"
                        size="sm"
                        aria-label="Edit integration"
                        onClick={() => handleEdit(integration)}
                      />
                      <IconButton
                        icon={<DeleteIcon />}
                        variant="ghost"
                        size="sm"
                        colorScheme="red"
                        aria-label="Delete integration"
                        onClick={() => handleDelete(integration.id)}
                      />
                    </HStack>
                  </VStack>
                </CardBody>
              </Card>
            ))}
          </VStack>
        )}
      </VStack>

      {/* Integration Form Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {selectedIntegration ? 'Edit Integration' : 'Add Integration'}
          </ModalHeader>
          <ModalCloseButton />
          <ModalBody pb={6}>
            <form onSubmit={handleSubmit}>
              <VStack spacing={4}>
                <FormControl isRequired>
                  <FormLabel>Integration Name</FormLabel>
                  <Input
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Enter integration name"
                  />
                </FormControl>

                <FormControl isRequired>
                  <FormLabel>Integration Type</FormLabel>
                  <Select
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    placeholder="Select integration type"
                  >
                    <option value="bank">Bank Integration</option>
                    <option value="payment">Payment Gateway</option>
                    <option value="accounting">Accounting Software</option>
                    <option value="crm">CRM System</option>
                    <option value="erp">ERP System</option>
                  </Select>
                </FormControl>

                <FormControl>
                  <FormLabel>API Key</FormLabel>
                  <Input
                    value={formData.apiKey}
                    onChange={(e) => setFormData({ ...formData, apiKey: e.target.value })}
                    placeholder="Enter API key"
                    type="password"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>API Secret</FormLabel>
                  <Input
                    value={formData.apiSecret}
                    onChange={(e) => setFormData({ ...formData, apiSecret: e.target.value })}
                    placeholder="Enter API secret"
                    type="password"
                  />
                </FormControl>

                <FormControl>
                  <FormLabel>Webhook URL</FormLabel>
                  <Input
                    value={formData.webhookUrl}
                    onChange={(e) => setFormData({ ...formData, webhookUrl: e.target.value })}
                    placeholder="Enter webhook URL"
                  />
                </FormControl>

                <FormControl display="flex" alignItems="center">
                  <FormLabel mb="0">
                    Active
                  </FormLabel>
                  <Switch
                    isChecked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    colorScheme="blue"
                  />
                </FormControl>

                <HStack spacing={3} w="full" justify="end">
                  <Button variant="ghost" onClick={onClose}>
                    Cancel
                  </Button>
                  <Button colorScheme="blue" type="submit">
                    {selectedIntegration ? 'Update' : 'Create'}
                  </Button>
                </HStack>
              </VStack>
            </form>
          </ModalBody>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default IntegrationManager; 
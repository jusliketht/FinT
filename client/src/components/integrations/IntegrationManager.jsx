import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
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
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon } from '@chakra-ui/icons';
import integrationService from '../../services/integrationService';

const IntegrationManager = () => {
  const [integrations, setIntegrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedIntegration, setSelectedIntegration] = useState(null);
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const fetchIntegrationData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await integrationService.getAll();
      setIntegrations(response.data || response);
    } catch (err) {
      setError('Failed to fetch integrations');
      toast({
        title: 'Error',
        description: 'Failed to load integrations',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchIntegrationData();
  }, [fetchIntegrationData]);

  const handleEdit = (integration) => {
    setSelectedIntegration(integration);
    onOpen();
  };

  const handleDelete = async (id) => {
    try {
      await integrationService.delete(id);
      toast({
        title: 'Success',
        description: 'Integration deleted successfully',
        status: 'success',
        duration: 5000,
        isClosable: true,
      });
      fetchIntegrationData();
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to delete integration',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleAdd = () => {
    setSelectedIntegration(null);
    onOpen();
  };

  const handleSave = async (integration) => {
    try {
      if (integration.id) {
        await integrationService.update(integration.id, integration);
        toast({
      setLoading(true);
      // Placeholder data - would fetch from API
      setBankConnections([
        { id: 'bank_1', name: 'HDFC Bank', status: 'connected', lastSync: '2024-01-15' },
        { id: 'bank_2', name: 'ICICI Bank', status: 'disconnected', lastSync: null }
      ]);
      setPaymentGateways([
        { id: 'stripe', name: 'Stripe', status: 'connected', type: 'payment' },
        { id: 'paypal', name: 'PayPal', status: 'disconnected', type: 'payment' }
      ]);
      setEmailSettings({
        notifications: true,
        lowStockAlerts: true,
        invoiceReminders: true,
        paymentConfirmations: true
      });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch integration data', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const connectBank = async () => {
    try {
      const response = await api.post('/integrations/bank/connect', {
        businessId: 'demo-business',
        bankCredentials
      });
      toast({ title: 'Success', description: 'Bank connected successfully', status: 'success' });
      setShowBankForm(false);
      setBankCredentials({});
      fetchIntegrationData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to connect bank', status: 'error' });
    }
  };

  const disconnectBank = async (connectionId) => {
    try {
      await api.delete(`/integrations/bank/disconnect/${connectionId}`);
      toast({ title: 'Success', description: 'Bank disconnected successfully', status: 'success' });
      fetchIntegrationData();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to disconnect bank', status: 'error' });
    }
  };

  const syncBankTransactions = async (connectionId) => {
    try {
      const response = await api.post('/integrations/bank/sync', {
        businessId: 'demo-business',
        connectionId
      });
      toast({ title: 'Success', description: `Synced ${response.data.transactionsCount} transactions`, status: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to sync transactions', status: 'error' });
    }
  };

  const toggleEmailSetting = async (setting) => {
    try {
      const newSettings = { ...emailSettings, [setting]: !emailSettings[setting] };
      setEmailSettings(newSettings);
      // Would call API to update settings
      toast({ title: 'Success', description: 'Email settings updated', status: 'success' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update email settings', status: 'error' });
    }
  };

  return (
    <Box>
      <Heading mb={6}>Integration Management</Heading>

      <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={6} mb={8}>
        <Card>
          <CardHeader>
            <Flex justify="space-between" align="center">
              <Heading size="md">Bank Connections</Heading>
              <Button size="sm" onClick={() => setShowBankForm(true)}>
                Connect Bank
              </Button>
            </Flex>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {bankConnections.map(connection => (
                <Flex key={connection.id} justify="space-between" align="center" p={3} border="1px" borderColor="gray.200" borderRadius="md">
                  <Box>
                    <Text fontWeight="bold">{connection.name}</Text>
                    <Text fontSize="sm" color="gray.600">
                      Last sync: {connection.lastSync || 'Never'}
                    </Text>
                  </Box>
                  <HStack>
                    <Badge colorScheme={connection.status === 'connected' ? 'green' : 'red'}>
                      {connection.status}
                    </Badge>
                    {connection.status === 'connected' && (
                      <Button size="sm" onClick={() => syncBankTransactions(connection.id)}>
                        Sync
                      </Button>
                    )}
                    <Button size="sm" colorScheme="red" onClick={() => disconnectBank(connection.id)}>
                      Disconnect
                    </Button>
                  </HStack>
                </Flex>
              ))}
            </VStack>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <Heading size="md">Payment Gateways</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4} align="stretch">
              {paymentGateways.map(gateway => (
                <Flex key={gateway.id} justify="space-between" align="center" p={3} border="1px" borderColor="gray.200" borderRadius="md">
                  <Box>
                    <Text fontWeight="bold">{gateway.name}</Text>
                    <Text fontSize="sm" color="gray.600">{gateway.type}</Text>
                  </Box>
                  <HStack>
                    <Badge colorScheme={gateway.status === 'connected' ? 'green' : 'red'}>
                      {gateway.status}
                    </Badge>
                    <Button size="sm" leftIcon={<ExternalLinkIcon />}>
                      Configure
                    </Button>
                  </HStack>
                </Flex>
              ))}
            </VStack>
          </CardBody>
        </Card>
      </SimpleGrid>

      <Card>
        <CardHeader>
          <Heading size="md">Email Notifications</Heading>
        </CardHeader>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">General Notifications</Text>
                <Text fontSize="sm" color="gray.600">Receive general system notifications</Text>
              </Box>
              <Switch isChecked={emailSettings.notifications} onChange={() => toggleEmailSetting('notifications')} />
            </Flex>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">Low Stock Alerts</Text>
                <Text fontSize="sm" color="gray.600">Get notified when inventory is low</Text>
              </Box>
              <Switch isChecked={emailSettings.lowStockAlerts} onChange={() => toggleEmailSetting('lowStockAlerts')} />
            </Flex>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">Invoice Reminders</Text>
                <Text fontSize="sm" color="gray.600">Send automatic invoice reminders to customers</Text>
              </Box>
              <Switch isChecked={emailSettings.invoiceReminders} onChange={() => toggleEmailSetting('invoiceReminders')} />
            </Flex>
            <Flex justify="space-between" align="center">
              <Box>
                <Text fontWeight="bold">Payment Confirmations</Text>
                <Text fontSize="sm" color="gray.600">Send payment confirmations to customers</Text>
              </Box>
              <Switch isChecked={emailSettings.paymentConfirmations} onChange={() => toggleEmailSetting('paymentConfirmations')} />
            </Flex>
          </VStack>
        </CardBody>
      </Card>

      {showBankForm && (
        <Card mt={6}>
          <CardHeader>
            <Heading size="md">Connect Bank Account</Heading>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Bank Name</FormLabel>
                <Input placeholder="Enter bank name" value={bankCredentials.bankName || ''} onChange={(e) => setBankCredentials({...bankCredentials, bankName: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>Account Number</FormLabel>
                <Input placeholder="Enter account number" value={bankCredentials.accountNumber || ''} onChange={(e) => setBankCredentials({...bankCredentials, accountNumber: e.target.value})} />
              </FormControl>
              <FormControl>
                <FormLabel>IFSC Code</FormLabel>
                <Input placeholder="Enter IFSC code" value={bankCredentials.ifscCode || ''} onChange={(e) => setBankCredentials({...bankCredentials, ifscCode: e.target.value})} />
              </FormControl>
              <HStack>
                <Button onClick={connectBank}>Connect</Button>
                <Button variant="outline" onClick={() => setShowBankForm(false)}>Cancel</Button>
              </HStack>
            </VStack>
          </CardBody>
        </Card>
      )}
    </Box>
  );
};

export default IntegrationManager; 
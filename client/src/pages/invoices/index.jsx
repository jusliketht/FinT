import React from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  VStack,
  HStack,
  Button,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import InvoiceList from '../../components/invoices/InvoiceList';
import CreateInvoiceModal from '../../components/invoices/CreateInvoiceModal';
import { useBusiness } from '../../contexts/BusinessContext';

const InvoicesPage = () => {
  const { selectedBusiness } = useBusiness();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleInvoiceCreated = () => {
    onClose();
    toast({
      title: 'Invoice Created',
      description: 'Invoice has been created successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  if (!selectedBusiness) {
    return (
      <Container maxW="container.xl" py={8}>
        <Alert status="warning" borderRadius="lg">
          <AlertIcon />
          <Box>
            <Text fontWeight="bold">Business Required</Text>
            <Text>Please select a business to manage invoices.</Text>
          </Box>
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between" align="center">
          <Box>
            <Heading size="lg" mb={2}>
              Invoices
            </Heading>
            <Text color="gray.600">
              Manage customer invoices for {selectedBusiness.name}
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Create Invoice
          </Button>
        </HStack>

        <InvoiceList onInvoiceCreated={handleInvoiceCreated} />

        <CreateInvoiceModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={handleInvoiceCreated}
        />
      </VStack>
    </Container>
  );
};

export default InvoicesPage; 
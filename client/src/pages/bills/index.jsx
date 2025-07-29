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
import BillList from '../../components/bills/BillList';
import CreateBillModal from '../../components/bills/CreateBillModal';
import { useBusiness } from '../../contexts/BusinessContext';

const BillsPage = () => {
  const { selectedBusiness } = useBusiness();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  const handleBillCreated = () => {
    onClose();
    toast({
      title: 'Bill Created',
      description: 'Bill has been created successfully',
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
            <Text>Please select a business to manage bills.</Text>
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
              Bills
            </Heading>
            <Text color="gray.600">
              Manage vendor bills for {selectedBusiness.name}
            </Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Create Bill
          </Button>
        </HStack>

        <BillList onBillCreated={handleBillCreated} />

        <CreateBillModal
          isOpen={isOpen}
          onClose={onClose}
          onSuccess={handleBillCreated}
        />
      </VStack>
    </Container>
  );
};

export default BillsPage; 
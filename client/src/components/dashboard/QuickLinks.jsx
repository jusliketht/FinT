import React from 'react';
import {
  Box,
  SimpleGrid,
  Button,
  VStack,
  Text,
  useColorModeValue,
  Icon,
  useDisclosure,
  Tooltip,
  HStack,
} from '@chakra-ui/react';
import {
  AddIcon,
  ViewIcon,
  AttachmentIcon,
  SettingsIcon,
  CheckCircleIcon,
} from '@chakra-ui/icons';
import { FiFileText, FiBarChart2, FiDollarSign, FiCreditCard } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import TransactionForm from '../transactions/TransactionForm';
import { useBusiness } from '../../contexts/BusinessContext';

const QuickLinks = () => {
  const { selectedBusiness } = useBusiness();
  const { isOpen: isTransactionModalOpen, onOpen: onTransactionModalOpen, onClose: onTransactionModalClose } = useDisclosure();
  
  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const quickActions = [
    {
      icon: AddIcon,
      label: 'Add Transaction',
      description: 'Record a new financial transaction',
      colorScheme: 'blue',
      action: 'modal',
      modalType: 'transaction',
    },
    {
      icon: ViewIcon,
      label: 'View Reports',
      description: 'Generate financial reports',
      colorScheme: 'green',
      action: 'navigate',
      to: '/reports',
    },
    {
      icon: AttachmentIcon,
      label: 'Upload Statement',
      description: 'Import bank statements',
      colorScheme: 'purple',
      action: 'navigate',
      to: '/bank-statements',
    },
    {
      icon: SettingsIcon,
      label: 'Chart of Accounts',
      description: 'Manage account structure',
      colorScheme: 'orange',
      action: 'navigate',
      to: '/accounts',
    },
    {
      icon: FiDollarSign,
      label: 'Create Invoice',
      description: 'Generate customer invoices',
      colorScheme: 'teal',
      action: 'navigate',
      to: '/invoices',
    },
    {
      icon: FiCreditCard,
      label: 'Record Bill',
      description: 'Track vendor bills',
      colorScheme: 'red',
      action: 'navigate',
      to: '/bills',
    },
    {
      icon: CheckCircleIcon,
      label: 'Reconciliation',
      description: 'Reconcile accounts',
      colorScheme: 'pink',
      action: 'navigate',
      to: '/bank-statements',
    },
  ];

  const handleAction = (action) => {
    if (action.action === 'modal' && action.modalType === 'transaction') {
      onTransactionModalOpen();
    }
  };

  const QuickActionButton = ({ action }) => {
    const IconComponent = action.icon;
    
    if (action.action === 'modal') {
      return (
        <Tooltip label={action.description} placement="top">
          <Button
            onClick={() => handleAction(action)}
            leftIcon={<Icon as={IconComponent} />}
            colorScheme={action.colorScheme}
            variant="outline"
            size="md"
            w="full"
            h="50px"
            fontSize="sm"
            fontWeight="medium"
            _hover={{
              transform: 'translateY(-1px)',
              boxShadow: 'md',
            }}
            transition="all 0.2s"
          >
            {action.label}
          </Button>
        </Tooltip>
      );
    }

    return (
      <Tooltip label={action.description} placement="top">
        <Button
          as={Link}
          to={action.to}
          leftIcon={<Icon as={IconComponent} />}
          colorScheme={action.colorScheme}
          variant="outline"
          size="md"
          w="full"
          h="50px"
          fontSize="sm"
          fontWeight="medium"
          _hover={{
            transform: 'translateY(-1px)',
            boxShadow: 'md',
          }}
          transition="all 0.2s"
        >
          {action.label}
        </Button>
      </Tooltip>
    );
  };

  return (
    <Box>
      <VStack spacing={6} align="stretch">
        <Box>
          <Text fontSize="lg" fontWeight="semibold" mb={4}>
            Quick Actions
          </Text>
          <SimpleGrid columns={{ base: 1, md: 2, lg: 3 }} spacing={4}>
            {quickActions.map((action, index) => (
              <QuickActionButton key={index} action={action} />
            ))}
          </SimpleGrid>
        </Box>
      </VStack>

      {/* Transaction Modal */}
      {isTransactionModalOpen && (
        <TransactionForm
          isOpen={isTransactionModalOpen}
          onClose={onTransactionModalClose}
          businessId={selectedBusiness?.id}
        />
      )}
    </Box>
  );
};

export default QuickLinks; 
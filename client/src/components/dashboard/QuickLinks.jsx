import React from 'react';
import {
  Box,
  SimpleGrid,
  Button,
  VStack,
  Text,
  useColorModeValue,
  Icon,
} from '@chakra-ui/react';
import {
  AddIcon,
  UploadIcon,
  SettingsIcon,
  SearchIcon,
} from '@chakra-ui/icons';
import { FiFileText, FiBarChart2 } from 'react-icons/fi';
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
    <>
      <Box
        bg={cardBg}
        borderRadius="xl"
        boxShadow="md"
        border="1px"
        borderColor={borderColor}
        overflow="hidden"
      >
        <Box p={6} borderBottom="1px" borderColor={borderColor}>
          <HStack justify="space-between" align="center">
            <Text fontSize="lg" fontWeight="bold">
              Quick Actions
            </Text>
            {selectedBusiness && (
              <Text fontSize="sm" color="gray.500">
                {selectedBusiness.name}
              </Text>
            )}
          </HStack>
        </Box>
        
        <Box p={6}>
          <VStack spacing={3}>
            {quickActions.map((action, index) => (
              <QuickActionButton key={index} action={action} />
            ))}
          </VStack>
        </Box>
      </Box>

      {/* Transaction Modal */}
      <TransactionForm
        isOpen={isTransactionModalOpen}
        onClose={onTransactionModalClose}
        onSuccess={() => {
          onTransactionModalClose();
          // Optionally refresh dashboard data
        }}
      />
    </>
  );
};

export default QuickLinks; 
import React, { useState } from 'react';
import {
  Box,
  Container,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
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
  Textarea,
  useDisclosure,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  Flex,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  AddIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  DownloadIcon,
  AttachmentIcon,
  ChevronDownIcon,
} from '@chakra-ui/icons';
import BusinessList from '../../components/business/BusinessList';
import { useBusiness } from '../../contexts/BusinessContext';

const BusinessManagement = () => {
  const { selectedBusiness, setSelectedBusiness } = useBusiness();
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [activeTab, setActiveTab] = useState(0);

  // Sample business data
  const businesses = [
    { id: 1, name: 'Acme Corp', type: 'Corporation', status: 'active', accounts: 45 },
    { id: 2, name: 'Tech Startup', type: 'LLC', status: 'active', accounts: 32 },
    { id: 3, name: 'Consulting Firm', type: 'Partnership', status: 'inactive', accounts: 28 },
  ];

  // Sample chart of accounts
  const chartOfAccounts = [
    { code: '1000', name: 'Cash', type: 'Asset', balance: 25000, category: 'Current Assets' },
    { code: '1100', name: 'Accounts Receivable', type: 'Asset', balance: 15000, category: 'Current Assets' },
    { code: '1200', name: 'Inventory', type: 'Asset', balance: 8000, category: 'Current Assets' },
    { code: '2000', name: 'Accounts Payable', type: 'Liability', balance: 12000, category: 'Current Liabilities' },
    { code: '3000', name: 'Common Stock', type: 'Equity', balance: 50000, category: 'Equity' },
    { code: '4000', name: 'Sales Revenue', type: 'Revenue', balance: 75000, category: 'Revenue' },
    { code: '5000', name: 'Cost of Goods Sold', type: 'Expense', balance: 45000, category: 'Expenses' },
  ];

  const handleBusinessSwitch = (business) => {
    setSelectedBusiness(business);
    toast({
      title: 'Business Switched',
      description: `Now managing: ${business.name}`,
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleCreateBusiness = () => {
    onOpen();
  };

  const getAccountTypeColor = (type) => {
    switch (type) {
      case 'Asset': return 'green';
      case 'Liability': return 'red';
      case 'Equity': return 'blue';
      case 'Revenue': return 'purple';
      case 'Expense': return 'orange';
      default: return 'gray';
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={8} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Business Management</Heading>
          <Text color="gray.600">
            Manage your businesses and chart of accounts
          </Text>
        </Box>

        {/* Business Selector */}
        <Card>
          <CardBody>
            <HStack justify="space-between" mb={4}>
              <Box>
                <Text fontWeight="medium" mb={1}>Current Business</Text>
                <Text fontSize="sm" color="gray.600">
                  {selectedBusiness ? selectedBusiness.name : 'No business selected'}
                </Text>
              </Box>
              <Button
                leftIcon={<AddIcon />}
                colorScheme="blue"
                onClick={handleCreateBusiness}
              >
                Create Business
              </Button>
            </HStack>

            {/* Business List */}
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Business Name</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Accounts</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {businesses.map((business) => (
                  <Tr key={business.id}>
                    <Td>
                      <Text fontWeight="medium">{business.name}</Text>
                    </Td>
                    <Td>
                      <Badge variant="outline">{business.type}</Badge>
                    </Td>
                    <Td>
                      <Badge
                        colorScheme={business.status === 'active' ? 'green' : 'gray'}
                        size="sm"
                      >
                        {business.status}
                      </Badge>
                    </Td>
                    <Td>{business.accounts}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Button
                          size="sm"
                          variant="ghost"
                          colorScheme="blue"
                          onClick={() => handleBusinessSwitch(business)}
                        >
                          Switch
                        </Button>
                        <IconButton
                          size="sm"
                          icon={<EditIcon />}
                          variant="ghost"
                          aria-label="Edit business"
                        />
                        <IconButton
                          size="sm"
                          icon={<ViewIcon />}
                          variant="ghost"
                          aria-label="View business"
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </CardBody>
        </Card>

        {/* Chart of Accounts */}
        <Card>
          <CardBody>
            <Tabs index={activeTab} onChange={setActiveTab}>
              <TabList>
                <Tab>Chart of Accounts</Tab>
                <Tab>Account Categories</Tab>
                <Tab>Import/Export</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <HStack justify="space-between">
                      <Text fontWeight="medium">Chart of Accounts</Text>
                      <HStack spacing={2}>
                        <Button
                          leftIcon={<AddIcon />}
                          size="sm"
                          colorScheme="blue"
                        >
                          Add Account
                        </Button>
                        <Button
                          leftIcon={<DownloadIcon />}
                          size="sm"
                          variant="outline"
                        >
                          Export
                        </Button>
                      </HStack>
                    </HStack>

                    <Table variant="simple">
                      <Thead>
                        <Tr>
                          <Th>Code</Th>
                          <Th>Name</Th>
                          <Th>Type</Th>
                          <Th>Category</Th>
                          <Th>Balance</Th>
                          <Th>Actions</Th>
                        </Tr>
                      </Thead>
                      <Tbody>
                        {chartOfAccounts.map((account) => (
                          <Tr key={account.code}>
                            <Td fontFamily="mono">{account.code}</Td>
                            <Td>{account.name}</Td>
                            <Td>
                              <Badge
                                colorScheme={getAccountTypeColor(account.type)}
                                size="sm"
                              >
                                {account.type}
                              </Badge>
                            </Td>
                            <Td>{account.category}</Td>
                            <Td fontFamily="mono">
                              ₹{account.balance.toLocaleString()}
                            </Td>
                            <Td>
                              <HStack spacing={1}>
                                <IconButton
                                  size="sm"
                                  icon={<EditIcon />}
                                  variant="ghost"
                                  aria-label="Edit account"
                                />
                                <IconButton
                                  size="sm"
                                  icon={<ViewIcon />}
                                  variant="ghost"
                                  aria-label="View account"
                                />
                              </HStack>
                            </Td>
                          </Tr>
                        ))}
                      </Tbody>
                    </Table>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="medium">Account Categories</Text>
                    <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4}>
                      <Stat>
                        <StatLabel>Assets</StatLabel>
                        <StatNumber>₹48,000</StatNumber>
                        <StatHelpText>Current + Fixed Assets</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Liabilities</StatLabel>
                        <StatNumber>₹12,000</StatNumber>
                        <StatHelpText>Current Liabilities</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Equity</StatLabel>
                        <StatNumber>₹50,000</StatNumber>
                        <StatHelpText>Owner's Equity</StatHelpText>
                      </Stat>
                      <Stat>
                        <StatLabel>Revenue</StatLabel>
                        <StatNumber>₹75,000</StatNumber>
                        <StatHelpText>Total Revenue</StatHelpText>
                      </Stat>
                    </SimpleGrid>
                  </VStack>
                </TabPanel>

                <TabPanel>
                  <VStack spacing={4} align="stretch">
                    <Text fontWeight="medium">Import/Export Accounts</Text>
                    <HStack spacing={4}>
                      <Button
                        leftIcon={<AttachmentIcon />}
                        colorScheme="green"
                        variant="outline"
                      >
                        Import CSV
                      </Button>
                      <Button
                        leftIcon={<DownloadIcon />}
                        colorScheme="blue"
                        variant="outline"
                      >
                        Export CSV
                      </Button>
                    </HStack>
                  </VStack>
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>

      {/* Create Business Modal */}
      <Modal isOpen={isOpen} onClose={onClose} size="lg">
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Create New Business</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>Business Name</FormLabel>
                <Input placeholder="Enter business name" />
              </FormControl>
              <FormControl>
                <FormLabel>Business Type</FormLabel>
                <Select placeholder="Select business type">
                  <option value="corporation">Corporation</option>
                  <option value="llc">LLC</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                </Select>
              </FormControl>
              <FormControl>
                <FormLabel>Description</FormLabel>
                <Textarea placeholder="Enter business description" />
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <HStack spacing={3}>
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button colorScheme="blue">
                Create Business
              </Button>
            </HStack>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Container>
  );
};

export default BusinessManagement;
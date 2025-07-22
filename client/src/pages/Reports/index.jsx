import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  Button,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  IconButton,
  useToast,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
} from '@chakra-ui/react';
import { 
  DownloadIcon, 
  ViewIcon, 
  EditIcon, 
  AddIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@chakra-ui/icons';
import IncomeStatement from '../../components/reports/IncomeStatement';
import BalanceSheet from './BalanceSheet';
import TrialBalance from './TrialBalance';
import CashFlow from './CashFlow';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dateRange, setDateRange] = useState('01/01/2024 - 12/31/2024');
  const toast = useToast();

  const handleExport = () => {
    toast({
      title: 'Export Report',
      description: 'Report exported successfully',
      status: 'success',
      duration: 3000,
      isClosable: true,
    });
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEdit = () => {
    toast({
      title: 'Edit Report',
      description: 'Edit functionality coming soon',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  const handleAdd = () => {
    toast({
      title: 'Add Report',
      description: 'Add new report functionality coming soon',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Breadcrumb Navigation */}
        <Breadcrumb 
          spacing="8px" 
          separator={<ChevronRightIcon color="gray.500" />}
          fontSize="sm"
        >
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Reports</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbItem isCurrentPage>
            <BreadcrumbLink href="/reports">Financial Reports</BreadcrumbLink>
          </BreadcrumbItem>
        </Breadcrumb>

        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Financial Reports</Heading>
        </Box>

        {/* Reports Tabs */}
        <Card>
          <CardBody p={0}>
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
              <TabList bg="gray.50" px={6} pt={6}>
                <Tab 
                  _selected={{ 
                    bg: 'primary.500', 
                    color: 'white',
                    borderBottomColor: 'primary.500'
                  }}
                  mr={2}
                >
                  Trial Balance
                </Tab>
                <Tab 
                  _selected={{ 
                    bg: 'primary.500', 
                    color: 'white',
                    borderBottomColor: 'primary.500'
                  }}
                  mr={2}
                >
                  P&L Statement
                </Tab>
                <Tab 
                  _selected={{ 
                    bg: 'primary.500', 
                    color: 'white',
                    borderBottomColor: 'primary.500'
                  }}
                  mr={2}
                >
                  Balance Sheet
                </Tab>
                <Tab 
                  _selected={{ 
                    bg: 'primary.500', 
                    color: 'white',
                    borderBottomColor: 'primary.500'
                  }}
                >
                  Cash Flow
                </Tab>
              </TabList>

              {/* Controls Section */}
              <Box px={6} py={4} bg="white" borderBottom="1px solid" borderColor="gray.200">
                <HStack justify="space-between" align="center">
                  <HStack spacing={4}>
                    {/* Date Range Selector */}
                    <InputGroup maxW="300px">
                      <InputLeftElement pointerEvents="none">
                        <CalendarIcon color="gray.400" />
                      </InputLeftElement>
                      <Input
                        value={dateRange}
                        onChange={(e) => setDateRange(e.target.value)}
                        placeholder="MM/DD/YYYY - MM/DD/YYYY"
                        size="md"
                      />
                    </InputGroup>

                    {/* Filter Button */}
                    <Select placeholder="Filter" maxW="150px" size="md">
                      <option value="all">All Accounts</option>
                      <option value="assets">Assets</option>
                      <option value="liabilities">Liabilities</option>
                      <option value="equity">Equity</option>
                    </Select>
                  </HStack>

                  {/* Action Buttons */}
                  <HStack spacing={2}>
                    <Button
                      leftIcon={<DownloadIcon />}
                      onClick={handleExport}
                      size="sm"
                      variant="outline"
                    >
                      Export
                    </Button>
                    <Button
                      leftIcon={<ViewIcon />}
                      onClick={handlePrint}
                      size="sm"
                      variant="outline"
                    >
                      Print
                    </Button>
                    <Button
                      leftIcon={<EditIcon />}
                      onClick={handleEdit}
                      size="sm"
                      variant="outline"
                    >
                      Edit
                    </Button>
                    <IconButton
                      icon={<AddIcon />}
                      onClick={handleAdd}
                      size="sm"
                      variant="outline"
                      aria-label="Add"
                    />
                  </HStack>
                </HStack>
              </Box>

              <TabPanels>
                <TabPanel p={6}>
                  <TrialBalance />
                </TabPanel>
                <TabPanel p={6}>
                  <IncomeStatement />
                </TabPanel>
                <TabPanel p={6}>
                  <BalanceSheet />
                </TabPanel>
                <TabPanel p={6}>
                  <CashFlow />
                </TabPanel>
              </TabPanels>
            </Tabs>
          </CardBody>
        </Card>
      </VStack>
    </Box>
  );
};

export default Reports; 
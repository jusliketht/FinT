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
  useToast
} from '@chakra-ui/react';
import { DownloadIcon, PrintIcon } from '@chakra-ui/icons';
import IncomeStatement from '../../components/reports/IncomeStatement';
import BalanceSheet from '../../components/reports/BalanceSheet';
import TrialBalance from '../../components/reports/TrialBalance';

const Reports = () => {
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  const handleExportAll = async () => {
    toast({
      title: 'Export All Reports',
      description: 'This feature will export all reports as a combined PDF',
      status: 'info',
      duration: 3000,
      isClosable: true,
    });
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg" mb={2}>Financial Reports</Heading>
            <Text color="gray.600">
              Generate and view comprehensive financial reports
            </Text>
          </Box>
          <HStack spacing={3}>
            <Button
              leftIcon={<DownloadIcon />}
              onClick={handleExportAll}
              colorScheme="green"
              variant="outline"
            >
              Export All
            </Button>
            <Button
              leftIcon={<PrintIcon />}
              onClick={() => window.print()}
              colorScheme="purple"
              variant="outline"
            >
              Print All
            </Button>
          </HStack>
        </HStack>

        {/* Reports Tabs */}
        <Card>
          <CardBody>
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
              <TabList>
                <Tab>Income Statement</Tab>
                <Tab>Balance Sheet</Tab>
                <Tab>Trial Balance</Tab>
                <Tab>Cash Flow</Tab>
                <Tab>General Ledger</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <IncomeStatement />
                </TabPanel>
                <TabPanel>
                  <BalanceSheet />
                </TabPanel>
                <TabPanel>
                  <TrialBalance />
                </TabPanel>
                <TabPanel>
                  <Box textAlign="center" py={10}>
                    <Text fontSize="lg" color="gray.600">
                      Cash Flow Statement coming soon...
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      This report will show cash inflows and outflows
                    </Text>
                  </Box>
                </TabPanel>
                <TabPanel>
                  <Box textAlign="center" py={10}>
                    <Text fontSize="lg" color="gray.600">
                      General Ledger coming soon...
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      This report will show detailed account transactions
                    </Text>
                  </Box>
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
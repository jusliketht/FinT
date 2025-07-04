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
import GeneralLedger from './GeneralLedger';
import TrialBalance from './TrialBalance';

const Ledgers = () => {
  const [activeTab, setActiveTab] = useState(0);
  const toast = useToast();

  const handleExportAll = async () => {
    toast({
      title: 'Export All Ledgers',
      description: 'This feature will export all ledgers as a combined PDF',
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
            <Heading size="lg" mb={2}>Ledgers</Heading>
            <Text color="gray.600">
              General Ledger, Trial Balance, and Account Details
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

        {/* Ledgers Tabs */}
        <Card>
          <CardBody>
            <Tabs index={activeTab} onChange={setActiveTab} variant="enclosed">
              <TabList>
                <Tab>General Ledger</Tab>
                <Tab>Trial Balance</Tab>
                <Tab>Account Details</Tab>
              </TabList>

              <TabPanels>
                <TabPanel>
                  <GeneralLedger />
                </TabPanel>
                <TabPanel>
                  <TrialBalance />
                </TabPanel>
                <TabPanel>
                  <Box textAlign="center" py={10}>
                    <Text fontSize="lg" color="gray.600">
                      Account Details coming soon...
                    </Text>
                    <Text fontSize="sm" color="gray.500" mt={2}>
                      This will show detailed information for individual accounts
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

export default Ledgers;

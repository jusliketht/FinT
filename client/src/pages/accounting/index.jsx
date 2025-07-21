import React from 'react';
import { Box, Text, Tabs, TabList, Tab, TabPanels, TabPanel, Button } from '@chakra-ui/react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import JournalList from './JournalList';

const Accounting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/')[2] || 'journal';

  const handleTabChange = (index) => {
    const tabs = ['journal', 'ledger', 'trial-balance'];
    navigate(`/accounting/${tabs[index]}`);
  };

  return (
    <Box flexGrow={1} p={6}>
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Accounting
      </Text>
      <Box borderBottom="1px" borderColor="gray.200" mb={6} display="flex" alignItems="center">
        <Tabs index={['journal', 'ledger', 'trial-balance'].indexOf(currentPath)} onChange={handleTabChange}>
          <TabList>
            <Tab>Journal</Tab>
            <Tab>Ledger</Tab>
            <Tab>Trial Balance</Tab>
          </TabList>
        </Tabs>
        {currentPath === 'journal' && (
          <Button
            colorScheme="blue"
            ml={4}
            onClick={() => navigate('/accounting/journal/add')}
          >
            Add Journal Entry
          </Button>
        )}
      </Box>
      <Outlet />
      {currentPath === 'journal' && <JournalList />}
    </Box>
  );
};

export default Accounting; 
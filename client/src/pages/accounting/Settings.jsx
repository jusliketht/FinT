import React, { useState, useEffect } from 'react';
import {
  Box,
  Text,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Button,
  Alert,
  AlertIcon,
  Spinner,
  IconButton,
  Tooltip,
  useDisclosure,
  VStack,
  HStack
} from '@chakra-ui/react';
import { AddIcon } from '@chakra-ui/icons';
import axios from 'axios';
import AccountForm from '../../components/accounting/AccountForm';
import AccountTree from '../../components/accounting/AccountTree';

const Settings = () => {
  // const theme = useTheme();
  // const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [expanded, setExpanded] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filterDrawerOpen, setFilterDrawerOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/accounts');
      setAccounts(response.data.data || []);
      // Expand all nodes by default
      setExpanded(response.data.data.map(acc => acc._id));
    } catch (err) {
      setError('Failed to fetch accounts');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handleOpenDialog = (account = null) => {
    setEditingAccount(account);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingAccount(null);
  };

  const handleAccountSubmit = async (values) => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      if (editingAccount) {
        await axios.put(`/accounts/${editingAccount._id}`, values);
        setSuccess('Account updated successfully');
      } else {
        await axios.post('/accounts', values);
        setSuccess('Account added successfully');
      }
      fetchAccounts();
      handleCloseDialog();
    } catch (err) {
      setError(err.response?.data?.message || 'Error saving account');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAccount = async (accountId) => {
    if (window.confirm('Are you sure you want to delete this account?')) {
      try {
        setLoading(true);
        await axios.delete(`/accounts/${accountId}`);
        setSuccess('Account deleted successfully');
        fetchAccounts();
      } catch (err) {
        setError(err.response?.data?.message || 'Error deleting account');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleNodeToggle = (event, nodeIds) => {
    setExpanded(nodeIds);
  };

  const handleNodeSelect = (event, nodeId) => {
    setSelected(nodeId);
  };

  const filteredAccounts = accounts.filter(account => {
    const searchLower = searchQuery.toLowerCase();
    return (
      account.name.toLowerCase().includes(searchLower) ||
      account.code.toLowerCase().includes(searchLower) ||
      account.description?.toLowerCase().includes(searchLower)
    );
  });

  const renderAccountHeadsTab = () => (
    <Box h="100%" display="flex" flexDirection="column">
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
        flexWrap="wrap"
        gap={1}
      >
        <Text fontSize="lg" fontWeight="semibold">Chart of Accounts</Text>
        <HStack spacing={2}>
          <Button
            colorScheme="blue"
            leftIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            Add Account
          </Button>
        </HStack>
      </Box>

      {loading && accounts.length === 0 ? (
        <Box display="flex" justifyContent="center" alignItems="center" flex={1}>
          <Spinner size="lg" />
        </Box>
      ) : (
        <Box flex={1} minH={0}>
          <AccountTree
            accounts={filteredAccounts}
            onEdit={handleOpenDialog}
            onDelete={handleDeleteAccount}
            expanded={expanded}
            onNodeToggle={handleNodeToggle}
            selected={selected}
            onNodeSelect={handleNodeSelect}
          />
        </Box>
      )}
    </Box>
  );

  return (
    <Box h="100%" display="flex" flexDirection="column">
      <Text fontSize="2xl" fontWeight="bold" mb={4}>
        Accounting Settings
      </Text>

      {error && <Alert status="error" mb={2}><AlertIcon />{error}</Alert>}
      {success && <Alert status="success" mb={2}><AlertIcon />{success}</Alert>}

      <Box mb={4}>
        <Tabs index={activeTab} onChange={setActiveTab}>
          <TabList>
            <Tab>Account Heads</Tab>
            <Tab>General Settings</Tab>
            <Tab>Tax Settings</Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              {renderAccountHeadsTab()}
            </TabPanel>
            <TabPanel>
              <Text>General settings content will go here</Text>
            </TabPanel>
            <TabPanel>
              <Text>Tax settings content will go here</Text>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Box>

      <AccountForm
        open={openDialog}
        onClose={handleCloseDialog}
        onSubmit={handleAccountSubmit}
        initialValues={editingAccount}
        accounts={accounts}
        loading={loading}
        error={error}
      />
    </Box>
  );
};

export default Settings; 
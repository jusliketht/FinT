import React, { useState, useEffect } from 'react';
// import {
//   Box,
//   Typography,
//   Tabs,
//   Tab,
//   Paper,
//   Button,
//   Alert,
//   useTheme,
//   useMediaQuery,
//   CircularProgress,
//   IconButton,
//   Tooltip,
//   Drawer,
// } from '@mui/material';
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
      const response = await axios.get('/api/v1/accounts');
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
        await axios.put(`/api/v1/accounts/${editingAccount._id}`, values);
        setSuccess('Account updated successfully');
      } else {
        await axios.post('/api/v1/accounts', values);
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
        await axios.delete(`/api/v1/accounts/${accountId}`);
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          mb: 2,
          flexWrap: 'wrap',
          gap: 1,
        }}
      >
        <Typography variant="h6">Chart of Accounts</Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {/* {isMobile ? (
            <Tooltip title="Filter & Search">
              <IconButton onClick={() => setFilterDrawerOpen(true)}>
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          ) : (
            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
              <SearchIcon color="action" />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  border: 'none',
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  padding: '4px 8px',
                  outline: 'none',
                  width: 200,
                }}
              />
            </Box>
          )} */}
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenDialog()}
          >
            {/* {isMobile ? '' : 'Add Account'} */}
          </Button>
        </Box>
      </Box>

      {loading && accounts.length === 0 ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flex: 1 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box sx={{ flex: 1, minHeight: 0 }}>
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h4" gutterBottom>
        Accounting Settings
      </Typography>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant={/* isMobile ? 'fullWidth' : 'standard' */}
        >
          <Tab label="Account Heads" />
          <Tab label="General Settings" />
          <Tab label="Tax Settings" />
        </Tabs>
      </Paper>

      <Box sx={{ flex: 1, minHeight: 0, display: 'flex', flexDirection: 'column' }}>
        {activeTab === 0 && renderAccountHeadsTab()}
        {activeTab === 1 && (
          <Typography>General settings content will go here</Typography>
        )}
        {activeTab === 2 && (
          <Typography>Tax settings content will go here</Typography>
        )}
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

      {/* Drawer removed for Chakra UI v3 compatibility */}
    </Box>
  );
};

export default Settings; 
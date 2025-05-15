import React, { useState } from 'react';
import { 
  Box, 
  Tabs, 
  Tab,
  Typography,
  Paper,
  Breadcrumbs,
  Link as MuiLink
} from '@mui/material';
import { Link } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import ReceiptIcon from '@mui/icons-material/Receipt';
import BalanceIcon from '@mui/icons-material/Balance';
import GeneralLedger from '../components/features/ledgers/GeneralLedger';
import TrialBalance from '../components/features/ledgers/TrialBalance';

// TabPanel component for handling tab switching
function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`ledger-tabpanel-${index}`}
      aria-labelledby={`ledger-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

const Ledgers = () => {
  // State for tab selection
  const [activeTab, setActiveTab] = useState(0);

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  return (
    <Box>
      {/* Breadcrumb navigation */}
      <Paper sx={{ p: 2, mb: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <MuiLink
            component={Link}
            to="/"
            color="inherit"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <HomeIcon sx={{ mr: 0.5 }} fontSize="small" />
            Dashboard
          </MuiLink>
          <Typography sx={{ display: 'flex', alignItems: 'center' }} color="text.primary">
            <AccountBalanceIcon sx={{ mr: 0.5 }} fontSize="small" />
            Ledgers
          </Typography>
        </Breadcrumbs>
      </Paper>

      {/* Page title */}
      <Typography variant="h4" component="h1" gutterBottom sx={{ px: 2 }}>
        Ledgers
      </Typography>

      {/* Tab navigation */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs 
          value={activeTab} 
          onChange={handleTabChange} 
          aria-label="ledger tabs"
          sx={{ px: 2 }}
        >
          <Tab 
            icon={<ReceiptIcon />} 
            iconPosition="start" 
            label="General Ledger" 
            id="ledger-tab-0" 
            aria-controls="ledger-tabpanel-0" 
          />
          <Tab 
            icon={<BalanceIcon />} 
            iconPosition="start" 
            label="Trial Balance" 
            id="ledger-tab-1" 
            aria-controls="ledger-tabpanel-1" 
          />
          {/* Future tab for Account Ledger can be added here */}
        </Tabs>
      </Box>

      {/* Tab panels */}
      <TabPanel value={activeTab} index={0}>
        <GeneralLedger />
      </TabPanel>
      
      <TabPanel value={activeTab} index={1}>
        <TrialBalance />
      </TabPanel>
    </Box>
  );
};

export default Ledgers; 
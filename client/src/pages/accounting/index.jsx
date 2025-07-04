import React from 'react';
// import { Box, Typography, Tabs, Tab, Button } from '@mui/material';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';
import JournalList from './JournalList';

const Accounting = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname.split('/')[2] || 'journal';

  const handleTabChange = (event, newValue) => {
    navigate(`/accounting/${newValue}`);
  };

  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Accounting
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3, display: 'flex', alignItems: 'center' }}>
        <Tabs value={currentPath} onChange={handleTabChange}>
          <Tab label="Journal" value="journal" />
          <Tab label="Ledger" value="ledger" />
          <Tab label="Trial Balance" value="trial-balance" />
        </Tabs>
        {currentPath === 'journal' && (
          <Button
            variant="contained"
            color="primary"
            sx={{ ml: 2 }}
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
import React from 'react';
import { Box, Typography, Grid, Paper } from '@mui/material';

const Reports = () => {
  return (
    <Box sx={{ flexGrow: 1, p: 3 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Financial Reports
      </Typography>
      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Income Statement
            </Typography>
            {/* Add income statement content */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Balance Sheet
            </Typography>
            {/* Add balance sheet content */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Cash Flow Statement
            </Typography>
            {/* Add cash flow statement content */}
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Budget vs Actual
            </Typography>
            {/* Add budget vs actual content */}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Reports; 
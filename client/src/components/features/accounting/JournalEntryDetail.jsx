import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  Divider,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { formatCurrency, formatDate } from '../../../utils/format';

const JournalEntryDetail = ({ open, onClose, entry }) => {
  if (!entry) {
    return null;
  }

  // Calculate totals
  const totalDebits = entry.items?.reduce(
    (sum, item) => sum + parseFloat(item.debitAmount || 0), 
    0
  ) || 0;
  
  const totalCredits = entry.items?.reduce(
    (sum, item) => sum + parseFloat(item.creditAmount || 0), 
    0
  ) || 0;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      aria-labelledby="journal-entry-detail-title"
    >
      <DialogTitle id="journal-entry-detail-title">
        Journal Entry Details
      </DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 3 }}>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Reference</Typography>
              <Typography variant="body1">{entry.reference || '-'}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Date</Typography>
              <Typography variant="body1">{formatDate(entry.date)}</Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle2" color="text.secondary">Status</Typography>
              <Chip
                label={entry.status?.charAt(0).toUpperCase() + entry.status?.slice(1) || 'Unknown'}
                size="small"
                color={entry.status === 'posted' ? 'success' : 'warning'}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="subtitle2" color="text.secondary">Description</Typography>
              <Typography variant="body1">{entry.description || '-'}</Typography>
            </Grid>
          </Grid>
        </Box>

        <Divider sx={{ my: 2 }} />
        
        <Typography variant="h6" gutterBottom>Line Items</Typography>
        
        <TableContainer component={Paper} variant="outlined">
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Account</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Debit</TableCell>
                <TableCell align="right">Credit</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entry.items && entry.items.length > 0 ? (
                <>
                  {entry.items.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {item.accountCode ? `${item.accountCode} - ${item.accountName}` : item.accountName || item.accountId}
                      </TableCell>
                      <TableCell>{item.description || entry.description}</TableCell>
                      <TableCell align="right">
                        {item.debitAmount > 0 ? formatCurrency(item.debitAmount) : ''}
                      </TableCell>
                      <TableCell align="right">
                        {item.creditAmount > 0 ? formatCurrency(item.creditAmount) : ''}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2} align="right" sx={{ fontWeight: 'bold' }}>
                      TOTALS
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(totalDebits)}
                    </TableCell>
                    <TableCell align="right" sx={{ fontWeight: 'bold' }}>
                      {formatCurrency(totalCredits)}
                    </TableCell>
                  </TableRow>
                </>
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">No line items found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        
        {entry.createdBy && (
          <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
            <Typography variant="caption" color="text.secondary">
              Created by {entry.createdBy} on {formatDate(entry.createdAt)}
            </Typography>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

JournalEntryDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entry: PropTypes.object
};

export default JournalEntryDetail; 
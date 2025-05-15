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
import { format } from 'date-fns';

const JournalEntryView = ({
  open,
  onClose,
  entry,
  accounts,
  onEdit,
  onDelete
}) => {
  if (!entry) return null;

  const getAccountName = (accountId) => {
    const account = accounts.find(acc => acc.id === accountId);
    return account ? `${account.code} - ${account.name}` : 'Unknown Account';
  };

  const calculateTotals = () => {
    const totalDebit = entry.lines.reduce((sum, line) => sum + (line.debit || 0), 0);
    const totalCredit = entry.lines.reduce((sum, line) => sum + (line.credit || 0), 0);
    return { totalDebit, totalCredit };
  };

  const { totalDebit, totalCredit } = calculateTotals();

  const getStatusColor = (status) => {
    switch (status.toLowerCase()) {
      case 'posted':
        return 'success';
      case 'draft':
        return 'warning';
      case 'void':
        return 'error';
      default:
        return 'default';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="h6">
            Journal Entry Details
          </Typography>
          <Chip
            label={entry.status}
            color={getStatusColor(entry.status)}
            size="small"
          />
        </Box>
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 1 }}>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Date
            </Typography>
            <Typography variant="body1">
              {format(new Date(entry.date), 'PPP')}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" color="textSecondary">
              Reference
            </Typography>
            <Typography variant="body1">
              {entry.reference}
            </Typography>
          </Grid>
          <Grid item xs={12}>
            <Typography variant="subtitle2" color="textSecondary">
              Description
            </Typography>
            <Typography variant="body1">
              {entry.description}
            </Typography>
          </Grid>

          {/* Journal Entry Lines */}
          <Grid item xs={12}>
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
                  {entry.lines.map((line, index) => (
                    <TableRow key={index}>
                      <TableCell>{getAccountName(line.accountId)}</TableCell>
                      <TableCell>{line.description}</TableCell>
                      <TableCell align="right">
                        {line.debit ? line.debit.toFixed(2) : '-'}
                      </TableCell>
                      <TableCell align="right">
                        {line.credit ? line.credit.toFixed(2) : '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                  <TableRow>
                    <TableCell colSpan={2}>
                      <Typography variant="subtitle2">
                        Totals
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {totalDebit.toFixed(2)}
                      </Typography>
                    </TableCell>
                    <TableCell align="right">
                      <Typography variant="subtitle2">
                        {totalCredit.toFixed(2)}
                      </Typography>
                    </TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>

          {/* Additional Information */}
          {entry.createdAt && (
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">
                Created: {format(new Date(entry.createdAt), 'PPpp')}
              </Typography>
            </Grid>
          )}
          {entry.updatedAt && entry.updatedAt !== entry.createdAt && (
            <Grid item xs={12}>
              <Typography variant="caption" color="textSecondary">
                Last Updated: {format(new Date(entry.updatedAt), 'PPpp')}
              </Typography>
            </Grid>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
        {entry.status === 'draft' && (
          <>
            <Button
              onClick={onEdit}
              variant="outlined"
              color="primary"
            >
              Edit
            </Button>
            <Button
              onClick={onDelete}
              variant="outlined"
              color="error"
            >
              Delete
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

JournalEntryView.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  entry: PropTypes.shape({
    id: PropTypes.string.isRequired,
    date: PropTypes.string.isRequired,
    reference: PropTypes.string.isRequired,
    description: PropTypes.string.isRequired,
    status: PropTypes.string.isRequired,
    lines: PropTypes.arrayOf(
      PropTypes.shape({
        id: PropTypes.string,
        accountId: PropTypes.string.isRequired,
        description: PropTypes.string,
        debit: PropTypes.number,
        credit: PropTypes.number
      })
    ).isRequired,
    createdAt: PropTypes.string,
    updatedAt: PropTypes.string
  }),
  accounts: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      code: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    })
  ).isRequired,
  onEdit: PropTypes.func.isRequired,
  onDelete: PropTypes.func.isRequired
};

export default JournalEntryView; 
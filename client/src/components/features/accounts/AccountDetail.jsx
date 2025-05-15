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
  Chip,
  Divider,
  Card,
  CardContent
} from '@mui/material';
import { DataTable, NotFound } from '../../../components/common';
import { formatCurrency, formatDate } from '../../../utils/format';

const AccountDetail = ({
  open,
  onClose,
  account,
  transactions,
  totalCount,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange
}) => {
  const columns = [
    {
      id: 'date',
      label: 'Date',
      minWidth: 120,
      render: (row) => formatDate(row.date)
    },
    {
      id: 'description',
      label: 'Description',
      minWidth: 200
    },
    {
      id: 'reference',
      label: 'Reference',
      minWidth: 120
    },
    {
      id: 'debit',
      label: 'Debit',
      minWidth: 120,
      align: 'right',
      render: (row) => row.debit ? formatCurrency(row.debit) : '-'
    },
    {
      id: 'credit',
      label: 'Credit',
      minWidth: 120,
      align: 'right',
      render: (row) => row.credit ? formatCurrency(row.credit) : '-'
    },
    {
      id: 'balance',
      label: 'Balance',
      minWidth: 120,
      align: 'right',
      render: (row) => formatCurrency(row.balance)
    }
  ];

  if (!account) return null;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
    >
      <DialogTitle>
        Account Details
      </DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          {/* Account Information */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Code
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {account.code}
                    </Typography>
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Type
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {account.type.charAt(0).toUpperCase() + account.type.slice(1)}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Account Name
                    </Typography>
                    <Typography variant="body1" gutterBottom>
                      {account.name}
                    </Typography>
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="subtitle2" color="text.secondary">
                      Category
                    </Typography>
                    <Chip
                      label={account.category.name}
                      size="small"
                      color={account.category.type === 'asset' ? 'primary' : 'secondary'}
                      sx={{ mt: 0.5 }}
                    />
                  </Grid>
                  {account.description && (
                    <Grid item xs={12}>
                      <Typography variant="subtitle2" color="text.secondary">
                        Description
                      </Typography>
                      <Typography variant="body2">
                        {account.description}
                      </Typography>
                    </Grid>
                  )}
                  <Grid item xs={12}>
                    <Divider sx={{ my: 1 }} />
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <Typography variant="subtitle1">
                        Current Balance
                      </Typography>
                      <Typography
                        variant="h6"
                        color={account.balance >= 0 ? 'success.main' : 'error.main'}
                      >
                        {formatCurrency(account.balance)}
                      </Typography>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {/* Transaction History */}
          <Grid item xs={12}>
            <Typography variant="h6" gutterBottom>
              Transaction History
            </Typography>
            <DataTable
              columns={columns}
              data={transactions}
              page={page}
              rowsPerPage={rowsPerPage}
              totalCount={totalCount}
              onPageChange={onPageChange}
              onRowsPerPageChange={onRowsPerPageChange}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>
          Close
        </Button>
      </DialogActions>
    </Dialog>
  );
};

AccountDetail.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  account: PropTypes.shape({
    id: PropTypes.string.isRequired,
    code: PropTypes.string.isRequired,
    name: PropTypes.string.isRequired,
    type: PropTypes.string.isRequired,
    category: PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      type: PropTypes.string.isRequired
    }).isRequired,
    description: PropTypes.string,
    balance: PropTypes.number.isRequired
  }),
  transactions: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      date: PropTypes.string.isRequired,
      description: PropTypes.string.isRequired,
      reference: PropTypes.string,
      debit: PropTypes.number,
      credit: PropTypes.number,
      balance: PropTypes.number.isRequired
    })
  ).isRequired,
  totalCount: PropTypes.number.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired
};

export default AccountDetail; 
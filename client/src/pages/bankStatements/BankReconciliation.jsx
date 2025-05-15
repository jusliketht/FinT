import React, { useState, useEffect } from 'react';
import { Container, Box, Typography, Alert, Divider } from '@mui/material';
import { useSnackbar } from 'notistack';
import BankStatementUpload from '../../components/bankStatements/BankStatementUpload';
import ReconciliationTable from '../../components/bankStatements/ReconciliationTable';
import { accountsAPI } from '../../services/api';

const BankReconciliation = () => {
  const { enqueueSnackbar } = useSnackbar();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await accountsAPI.getAll();
      setAccounts(response.data);
    } catch (err) {
      setError('Failed to fetch accounts');
      enqueueSnackbar('Failed to load accounts', { variant: 'error' });
    }
  };

  const handleUpload = async (formData) => {
    try {
      setLoading(true);
      const response = await accountsAPI.uploadBankStatement(formData);
      setTransactions(response.data.transactions);
      enqueueSnackbar('Bank statement processed successfully', { variant: 'success' });
    } catch (err) {
      setError(err.message || 'Failed to process bank statement');
      enqueueSnackbar('Failed to process bank statement', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleReconcile = async (reconciliationData) => {
    try {
      setLoading(true);
      await accountsAPI.reconcileTransactions(reconciliationData);
      
      // Update transactions to reflect reconciliation
      setTransactions(prev =>
        prev.map(t => {
          const reconciled = reconciliationData.find(r => r.transactionId === t.id);
          return reconciled ? { ...t, isReconciled: true } : t;
        })
      );

      enqueueSnackbar('Transactions reconciled successfully', { variant: 'success' });
    } catch (err) {
      setError(err.message || 'Failed to reconcile transactions');
      enqueueSnackbar('Failed to reconcile transactions', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateJournalEntries = async (journalData) => {
    try {
      setLoading(true);
      await accountsAPI.createBulkJournalEntries(journalData);
      enqueueSnackbar('Journal entries created successfully', { variant: 'success' });
      
      // Optionally refresh the transactions list or mark them as processed
      setTransactions(prev =>
        prev.map(t => {
          const processed = journalData.find(j => j.transactionId === t.id);
          return processed ? { ...t, hasJournalEntry: true } : t;
        })
      );
    } catch (err) {
      setError(err.message || 'Failed to create journal entries');
      enqueueSnackbar('Failed to create journal entries', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom>
        Bank Statement Reconciliation
      </Typography>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <BankStatementUpload
          onUpload={handleUpload}
          isLoading={loading}
        />
      </Box>

      {transactions.length > 0 && (
        <>
          <Divider sx={{ my: 4 }} />
          <ReconciliationTable
            transactions={transactions}
            accounts={accounts}
            onReconcile={handleReconcile}
            onCreateJournalEntry={handleCreateJournalEntries}
            isLoading={loading}
          />
        </>
      )}
    </Container>
  );
};

export default BankReconciliation; 
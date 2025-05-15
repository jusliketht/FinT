import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Chip,
  Box,
  TextField,
  Grid,
  Alert
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Visibility as ViewIcon } from '@mui/icons-material';
import { accountsAPI } from '../../services/api';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useSnackbar } from 'notistack';

const JournalEntries = () => {
  const navigate = useNavigate();
  const { enqueueSnackbar } = useSnackbar();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    status: ''
  });

  useEffect(() => {
    fetchEntries();
  }, [filters]);

  const fetchEntries = async () => {
    try {
      setLoading(true);
      const response = await accountsAPI.getJournalEntries(filters);
      setEntries(response.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch journal entries');
      enqueueSnackbar('Failed to load journal entries', { variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handlePost = async (id) => {
    try {
      await accountsAPI.postJournalEntry(id);
      enqueueSnackbar('Journal entry posted successfully', { variant: 'success' });
      fetchEntries();
    } catch (err) {
      enqueueSnackbar('Failed to post journal entry', { variant: 'error' });
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft':
        return 'default';
      case 'posted':
        return 'success';
      default:
        return 'default';
    }
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">
          Journal Entries
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/journal-entries/new')}
        >
          New Entry
        </Button>
      </Box>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Start Date"
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="End Date"
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="Status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              SelectProps={{ native: true }}
            >
              <option value="">All</option>
              <option value="draft">Draft</option>
              <option value="posted">Posted</option>
            </TextField>
          </Grid>
        </Grid>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Reference</TableCell>
                <TableCell>Description</TableCell>
                <TableCell align="right">Amount</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Created By</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.reference}</TableCell>
                  <TableCell>{entry.description}</TableCell>
                  <TableCell align="right">{formatCurrency(entry.amount)}</TableCell>
                  <TableCell>
                    <Chip
                      label={entry.status}
                      color={getStatusColor(entry.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{entry.user.name}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      onClick={() => navigate(`/journal-entries/${entry.id}`)}
                    >
                      <ViewIcon />
                    </IconButton>
                    {entry.status === 'draft' && (
                      <>
                        <IconButton
                          size="small"
                          onClick={() => navigate(`/journal-entries/${entry.id}/edit`)}
                        >
                          <EditIcon />
                        </IconButton>
                        <Button
                          size="small"
                          onClick={() => handlePost(entry.id)}
                        >
                          Post
                        </Button>
                      </>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center">
                    No journal entries found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Container>
  );
};

export default JournalEntries; 
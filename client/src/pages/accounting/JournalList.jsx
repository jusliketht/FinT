import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Box,
  Text,
  Spinner,
  Alert
} from '@chakra-ui/react';

const JournalList = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    axios.get('/api/journal-entries')
      .then(res => setEntries(res.data))
      .catch(err => setError(err.response?.data?.message || 'Error fetching entries'))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Box mt={6}>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Journal Entries
      </Text>
      {loading && <Spinner size="lg" my={4} />}
      {error && <Alert status="error" my={4}>{error}</Alert>}
      {!loading && !error && (
        <Box overflowX="auto" borderWidth="1px" borderRadius="lg">
          <table style={{ width: '100%', minWidth: '650px', borderCollapse: 'collapse' }}>
            <thead style={{ backgroundColor: '#f7fafc' }}>
              <tr>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Date</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Description</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Debit Account</th>
                <th style={{ textAlign: 'left', padding: '12px', fontWeight: 'bold' }}>Credit Account</th>
                <th style={{ textAlign: 'right', padding: '12px', fontWeight: 'bold' }}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {entries.map(entry => (
                <tr key={entry.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                  <td style={{ padding: '12px' }}>{new Date(entry.date).toLocaleDateString()}</td>
                  <td style={{ padding: '12px' }}>{entry.description}</td>
                  <td style={{ padding: '12px' }}>{entry.debitAccount?.name || entry.debitAccountId}</td>
                  <td style={{ padding: '12px' }}>{entry.creditAccount?.name || entry.creditAccountId}</td>
                  <td style={{ textAlign: 'right', padding: '12px' }}>{entry.amount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Box>
      )}
    </Box>
  );
};

export default JournalList; 
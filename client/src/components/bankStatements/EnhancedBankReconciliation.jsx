import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  HStack,
  VStack,
  Select,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Stat,
  StatLabel,
  StatNumber,
  SimpleGrid,
  Badge,
  useToast,
  Spinner,
  Text,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  FormControl,
  FormLabel,
  Input,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
  useDisclosure
} from '@chakra-ui/react';
import { formatCurrency, formatDate } from '../../utils/formatters';
import { useApi } from '../../hooks/useApi';

const EnhancedBankReconciliation = () => {
  const [reconciliation, setReconciliation] = useState(null);
  const [bankLines, setBankLines] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [matches, setMatches] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState('');
  const [selectedBankStatement, setSelectedBankStatement] = useState('');
  const [accounts, setAccounts] = useState([]);
  const [bankStatements, setBankStatements] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedBankLine, setSelectedBankLine] = useState(null);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const api = useApi();

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await api.get('/accounts');
      setAccounts(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch accounts',
        status: 'error'
      });
    }
  }, [api, toast]);

  const fetchBankStatements = useCallback(async () => {
    try {
      const response = await api.get('/bank-statements');
      setBankStatements(response.data);
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to fetch bank statements',
        status: 'error'
      });
    }
  }, [api, toast]);

  useEffect(() => {
    fetchAccounts();
    fetchBankStatements();
  }, [fetchAccounts, fetchBankStatements]);

  const performAutoReconciliation = async () => {
    if (!selectedAccount || !selectedBankStatement) {
      toast({
        title: 'Error',
        description: 'Please select both account and bank statement',
        status: 'error'
      });
      return;
    }

    try {
      setLoading(true);
      const result = await api.post('/bank-reconciliation/auto-match', {
        accountId: selectedAccount,
        bankStatementId: selectedBankStatement
      });
      
      setMatches(result.data.matches);
      setBankLines(result.data.unmatchedBankLines);
      setTransactions(result.data.unmatchedTransactions);
      
      toast({
        title: 'Success',
        description: `Auto-matched ${result.data.totalMatches} transactions`,
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Auto-reconciliation failed',
        status: 'error'
      });
    } finally {
      setLoading(false);
    }
  };

  const manualMatch = async (bankLineId, transactionId) => {
    try {
      await api.post(`/bank-reconciliation/${reconciliation?.id}/manual-match`, {
        bankLineId,
        transactionId
      });
      
      // Update local state
      const newMatch = { 
        bankLineId, 
        transactionId, 
        isManual: true,
        matchScore: 1.0
      };
      setMatches([...matches, newMatch]);
      
      // Remove from unmatched lists
      setBankLines(bankLines.filter(bl => bl.id !== bankLineId));
      setTransactions(transactions.filter(t => t.id !== transactionId));
      
      toast({
        title: 'Success',
        description: 'Manual match created successfully',
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create manual match',
        status: 'error'
      });
    }
  };

  const createOutstandingItem = async (data) => {
    try {
      await api.post(`/bank-reconciliation/${reconciliation?.id}/outstanding-item`, data);
      toast({
        title: 'Success',
        description: 'Outstanding item created successfully',
        status: 'success'
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create outstanding item',
        status: 'error'
      });
    }
  };

  const getMatchScoreColor = (score) => {
    if (score >= 0.9) return 'green';
    if (score >= 0.7) return 'yellow';
    return 'red';
  };

  const getDifferenceColor = () => {
    if (!reconciliation) return 'gray';
    const difference = Math.abs((reconciliation.bookBalance || 0) - (reconciliation.statementBalance || 0));
    return difference < 0.01 ? 'green' : 'red';
  };

  const handleCreateTransaction = (bankLine) => {
    setSelectedBankLine(bankLine);
    onOpen();
  };

  const handleMarkOutstanding = (transaction) => {
    setSelectedTransaction(transaction);
    onOpen();
  };

  return (
    <Box p={6}>
      <Heading mb={6}>Enhanced Bank Reconciliation</Heading>
      
      {/* Account and Statement Selection */}
      <HStack spacing={4} mb={6}>
        <Select 
          placeholder="Select Account"
          value={selectedAccount}
          onChange={(e) => setSelectedAccount(e.target.value)}
        >
          {accounts.map(account => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
        
        <Select
          placeholder="Select Bank Statement"
          value={selectedBankStatement}
          onChange={(e) => setSelectedBankStatement(e.target.value)}
        >
          {bankStatements.map(statement => (
            <option key={statement.id} value={statement.id}>
              {statement.fileName} - {formatDate(statement.uploadDate)}
            </option>
          ))}
        </Select>
        
        <Button 
          onClick={performAutoReconciliation} 
          colorScheme="blue"
          isLoading={loading}
          loadingText="Auto Reconciling"
        >
          Auto Reconcile
        </Button>
      </HStack>

      {/* Reconciliation Summary */}
      {reconciliation && (
        <SimpleGrid columns={4} spacing={4} mb={6}>
          <Stat>
            <StatLabel>Book Balance</StatLabel>
            <StatNumber>{formatCurrency(reconciliation.bookBalance || 0)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Statement Balance</StatLabel>
            <StatNumber>{formatCurrency(reconciliation.statementBalance || 0)}</StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Difference</StatLabel>
            <StatNumber color={getDifferenceColor()}>
              {formatCurrency(Math.abs((reconciliation.bookBalance || 0) - (reconciliation.statementBalance || 0)))}
            </StatNumber>
          </Stat>
          <Stat>
            <StatLabel>Matched Items</StatLabel>
            <StatNumber>{matches.length}</StatNumber>
          </Stat>
        </SimpleGrid>
      )}

      {/* Matched Transactions */}
      {matches.length > 0 && (
        <Box mb={6}>
          <Heading size="md" mb={4}>Matched Transactions</Heading>
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Bank Amount</Th>
                <Th>Book Amount</Th>
                <Th>Match Score</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {matches.map(match => (
                <Tr key={`${match.bankLineId}-${match.transactionId}`}>
                  <Td>{formatDate(new Date())}</Td>
                  <Td>Matched Transaction</Td>
                  <Td>{formatCurrency(0)}</Td>
                  <Td>{formatCurrency(0)}</Td>
                  <Td>
                    <Badge colorScheme={getMatchScoreColor(match.matchScore)}>
                      {(match.matchScore * 100).toFixed(0)}%
                    </Badge>
                  </Td>
                  <Td>
                    <Button size="sm" colorScheme="red">
                      Unmatch
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

      {/* Unmatched Items - Side by Side */}
      <SimpleGrid columns={2} spacing={6}>
        <Box>
          <Heading size="md" mb={4}>Unmatched Bank Transactions</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Amount</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {bankLines.map(line => (
                <Tr key={line.id}>
                  <Td>{formatDate(line.transactionDate)}</Td>
                  <Td>{line.description}</Td>
                  <Td>{formatCurrency(line.amount)}</Td>
                  <Td>
                    <Button 
                      size="xs" 
                      onClick={() => handleCreateTransaction(line)}
                    >
                      Create Transaction
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>

        <Box>
          <Heading size="md" mb={4}>Unmatched Book Transactions</Heading>
          <Table size="sm">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Description</Th>
                <Th>Amount</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.map(transaction => (
                <Tr key={transaction.id}>
                  <Td>{formatDate(transaction.date)}</Td>
                  <Td>{transaction.description}</Td>
                  <Td>{formatCurrency(transaction.amount)}</Td>
                  <Td>
                    <Button 
                      size="xs" 
                      onClick={() => handleMarkOutstanding(transaction)}
                    >
                      Mark Outstanding
                    </Button>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      </SimpleGrid>

      {/* Manual Match Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Manual Match</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              {selectedBankLine && (
                <Box>
                  <Text fontWeight="bold">Bank Transaction:</Text>
                  <Text>{selectedBankLine.description}</Text>
                  <Text>{formatCurrency(selectedBankLine.amount)}</Text>
                </Box>
              )}
              {selectedTransaction && (
                <Box>
                  <Text fontWeight="bold">Book Transaction:</Text>
                  <Text>{selectedTransaction.description}</Text>
                  <Text>{formatCurrency(selectedTransaction.amount)}</Text>
                </Box>
              )}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button 
              colorScheme="blue" 
              onClick={() => {
                if (selectedBankLine && selectedTransaction) {
                  manualMatch(selectedBankLine.id, selectedTransaction.id);
                  onClose();
                }
              }}
            >
              Create Match
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default EnhancedBankReconciliation; 
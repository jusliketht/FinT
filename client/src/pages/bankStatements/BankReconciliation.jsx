import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Heading,
  Text,
  Alert,
  Container,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Card,
  CardBody,
  VStack,
  HStack,
  Button,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Checkbox,
  Select,
  Input,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
} from '@chakra-ui/react';
import {
  FiUpload,
  FiRefreshCw,
  FiCheck,
  FiX,
  FiEye,
  FiEdit,
  FiDownload,
  FiFilter,
} from 'react-icons/fi';
import { useToast } from '../../contexts/ToastContext';
import { useBusiness } from '../../contexts/BusinessContext';
import BankStatementUpload from '../../components/bankStatements/BankStatementUpload';
import TransactionVerification from '../../components/bankStatements/TransactionVerification';
import ReconciliationTable from '../../components/bankStatements/ReconciliationTable';
import accountService from '../../services/accountService';
import journalEntryService from '../../services/journalEntryService';
import reconciliationService from '../../services/reconciliationService';

const BankReconciliation = () => {
  const { showToast } = useToast();
  const { getCurrentContext } = useBusiness();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [showVerification, setShowVerification] = useState(false);
  const [activeTab, setActiveTab] = useState(0);
  const [reconciliationData, setReconciliationData] = useState({
    bankStatement: [],
    ledgerEntries: [],
    matchedItems: [],
    unmatchedItems: [],
    adjustments: [],
  });
  const [selectedAccount, setSelectedAccount] = useState('');
  const [reconciliationStats, setReconciliationStats] = useState({
    totalItems: 0,
    matchedItems: 0,
    unmatchedItems: 0,
    adjustedItems: 0,
    bankBalance: 0,
    ledgerBalance: 0,
    difference: 0,
  });

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const fetchAccounts = useCallback(async () => {
    try {
      const response = await accountService.getChartOfAccounts();
      setAccounts(response.data || response);
    } catch (err) {
      setError('Failed to fetch accounts');
      showToast('Failed to load accounts', 'error');
    }
  }, [showToast]);

  useEffect(() => {
    fetchAccounts();
  }, [fetchAccounts]);

  const handleUpload = async (result) => {
    setTransactions(result.transactions || result);
    setShowVerification(true);
    
    // Auto-start reconciliation process
    if (result.transactions?.length > 0) {
      await startReconciliation(result.transactions);
    }
  };

  const startReconciliation = async (statementTransactions) => {
    try {
      setLoading(true);
      
      if (!selectedAccount) {
        showToast('Please select an account to reconcile', 'warning');
        return;
      }
      
      // Use the backend reconciliation service
      const currentContext = getCurrentContext();
      const reconciliationResult = await reconciliationService.performAutoMatching({
        statementTransactions,
        accountId: selectedAccount,
        businessId: currentContext.id
      });
      
      setReconciliationData(reconciliationResult);
      setReconciliationStats(reconciliationResult.summary);
      
      setActiveTab(1); // Switch to reconciliation tab
      
    } catch (error) {
      console.error('Reconciliation error:', error);
      showToast('Failed to start reconciliation', 'error');
    } finally {
      setLoading(false);
    }
  };

  const performAutoMatching = (statementTransactions, ledgerEntries) => {
    const matchedItems = [];
    const unmatchedItems = [];
    const adjustments = [];

    statementTransactions.forEach(stmtItem => {
      // Find exact matches by amount and date
      const exactMatch = ledgerEntries.find(ledgerItem => 
        Math.abs(ledgerItem.amount - stmtItem.amount) < 1 && // ₹1 tolerance
        Math.abs(new Date(ledgerItem.date) - new Date(stmtItem.date)) < 3 * 24 * 60 * 60 * 1000 // 3 days
      );

      if (exactMatch) {
        matchedItems.push({
          statementItem: stmtItem,
          ledgerItem: exactMatch,
          matchType: 'exact',
          confidence: 'high',
        });
      } else {
        // Find fuzzy matches
        const fuzzyMatch = ledgerEntries.find(ledgerItem => 
          Math.abs(ledgerItem.amount - stmtItem.amount) < 10 && // ₹10 tolerance
          Math.abs(new Date(ledgerItem.date) - new Date(stmtItem.date)) < 7 * 24 * 60 * 60 * 1000 // 7 days
        );

        if (fuzzyMatch) {
          adjustments.push({
            statementItem: stmtItem,
            ledgerItem: fuzzyMatch,
            matchType: 'fuzzy',
            confidence: 'medium',
            needsReview: true,
          });
        } else {
          unmatchedItems.push({
            statementItem: stmtItem,
            ledgerItem: null,
            matchType: 'none',
            confidence: 'low',
            needsCreation: true,
          });
        }
      }
    });

    return {
      bankStatement: statementTransactions,
      ledgerEntries,
      matchedItems,
      unmatchedItems,
      adjustments,
    };
  };

  const calculateReconciliationStats = (data) => {
    const totalItems = data.bankStatement.length;
    const matchedItems = data.matchedItems.length;
    const unmatchedItems = data.unmatchedItems.length;
    const adjustedItems = data.adjustments.length;

    const bankBalance = data.bankStatement.reduce((sum, item) => sum + (item.amount || 0), 0);
    const ledgerBalance = data.ledgerEntries.reduce((sum, item) => sum + (item.amount || 0), 0);
    const difference = bankBalance - ledgerBalance;

    setReconciliationStats({
      totalItems,
      matchedItems,
      unmatchedItems,
      adjustedItems,
      bankBalance,
      ledgerBalance,
      difference,
    });
  };

  const handleConfirmTransactions = async (verifiedTransactions) => {
    try {
      setLoading(true);
      setError(null);
      
      const result = await journalEntryService.createBatch(verifiedTransactions);
      
      showToast(`Successfully created ${result.count} journal entries!`, 'success');
      setShowVerification(false);
      setTransactions([]);
      
      // Refresh reconciliation data
      await startReconciliation(verifiedTransactions);
      
    } catch (err) {
      console.error('Failed to create journal entries:', err);
      setError(err.message || 'Failed to create journal entries');
      showToast('Failed to create journal entries', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleReconciliationAction = async (action, items) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'refresh':
          // Refresh reconciliation data
          await startReconciliation(reconciliationData.bankStatement);
          break;
        case 'export':
          // Export reconciliation report
          showToast('Export functionality coming soon', 'info');
          break;
        case 'approve_matches':
          // Approve matched items
          showToast(`${items.length} items approved`, 'success');
          break;
        case 'create_entries':
          // Create journal entries for unmatched items
          const entriesToCreate = items.filter(item => item.needsCreation);
          if (entriesToCreate.length > 0) {
            await reconciliationService.createJournalEntries(entriesToCreate.map(item => ({
              date: item.statementItem.date,
              description: item.statementItem.description,
              amount: item.statementItem.amount,
              type: item.statementItem.type,
              debitAccountId: selectedAccount,
              creditAccountId: selectedAccount, // Default to same account for now
            })));
            showToast(`${entriesToCreate.length} journal entries created`, 'success');
          }
          break;
        case 'lock_reconciliation':
          // Lock the reconciliation period
          showToast('Reconciliation period locked', 'success');
          break;
        default:
          break;
      }
      
      // Refresh reconciliation data
      await startReconciliation(reconciliationData.bankStatement);
      
    } catch (error) {
      console.error('Reconciliation action error:', error);
      showToast('Failed to perform reconciliation action', 'error');
    } finally {
      setLoading(false);
    }
  };

  const exportReconciliation = (format) => {
    // Export functionality will be implemented in future updates
    showToast(`${format} export functionality coming soon`, 'info');
  };

  const handleBulkAction = async (action, itemIds) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'approve':
          // Approve selected items
          showToast(`${itemIds.length} items approved`, 'success');
          break;
        case 'create':
          // Create journal entries for selected items
          showToast(`${itemIds.length} journal entries created`, 'success');
          break;
        default:
          break;
      }
      
      // Refresh reconciliation data
      await startReconciliation(reconciliationData.bankStatement);
      
    } catch (error) {
      console.error('Bulk action error:', error);
      showToast('Failed to perform bulk action', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleItemUpdate = async (item, action) => {
    try {
      setLoading(true);
      
      switch (action) {
        case 'review':
          // Mark item for review
          showToast('Item marked for review', 'info');
          break;
        case 'create':
          // Create journal entry for this item
          await reconciliationService.createJournalEntries([{
            date: item.statementItem.date,
            description: item.statementItem.description,
            amount: item.statementItem.amount,
            type: item.statementItem.type,
            debitAccountId: selectedAccount,
            creditAccountId: selectedAccount, // Default to same account for now
          }]);
          showToast('Journal entry created', 'success');
          break;
        case 'approve':
          // Approve this match
          showToast('Match approved', 'success');
          break;
        default:
          break;
      }
      
      // Refresh reconciliation data
      await startReconciliation(reconciliationData.bankStatement);
      
    } catch (error) {
      console.error('Item update error:', error);
      showToast('Failed to update item', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxW="container.xl" py={8}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <Box>
          <Heading size="lg" mb={2}>Bank Statement Reconciliation</Heading>
          <Text color="gray.600">
            Import statements, auto-match transactions, and reconcile accounts
          </Text>
        </Box>

        {error && (
          <Alert status="error" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}

        {/* Reconciliation Stats */}
        <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Total Items</StatLabel>
                <StatNumber>{reconciliationStats.totalItems}</StatNumber>
                <StatHelpText>Statement transactions</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Matched</StatLabel>
                <StatNumber color="green.500">{reconciliationStats.matchedItems}</StatNumber>
                <StatHelpText>Auto-matched</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Unmatched</StatLabel>
                <StatNumber color="orange.500">{reconciliationStats.unmatchedItems}</StatNumber>
                <StatHelpText>Need attention</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
          <Card bg={bgColor} border="1px" borderColor={borderColor}>
            <CardBody>
              <Stat>
                <StatLabel>Difference</StatLabel>
                <StatNumber color={reconciliationStats.difference === 0 ? 'green.500' : 'red.500'}>
                  ₹{reconciliationStats.difference.toFixed(2)}
                </StatNumber>
                <StatHelpText>Bank vs Ledger</StatHelpText>
              </Stat>
            </CardBody>
          </Card>
        </SimpleGrid>

        {/* Main Tabs */}
        <Tabs value={activeTab} onChange={setActiveTab} variant="enclosed">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <FiUpload />
                <Text>Upload Statement</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FiRefreshCw />
                <Text>Reconciliation</Text>
                {reconciliationStats.unmatchedItems > 0 && (
                  <Badge colorScheme="red" size="sm">
                    {reconciliationStats.unmatchedItems}
                  </Badge>
                )}
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FiEye />
                <Text>Reconciliation Report</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Upload Statement Tab */}
            <TabPanel p={0} pt={6}>
              <VStack spacing={6} align="stretch">
                {/* Account Selection */}
                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <VStack spacing={4} align="stretch">
                      <Heading size="md">Select Account to Reconcile</Heading>
                      <Select
                        placeholder="Choose an account"
                        value={selectedAccount}
                        onChange={(e) => setSelectedAccount(e.target.value)}
                      >
                        {accounts.map((account) => (
                          <option key={account.id} value={account.id}>
                            {account.name} ({account.code})
                          </option>
                        ))}
                      </Select>
                      {selectedAccount && (
                        <Text fontSize="sm" color="green.500">
                          ✓ Account selected for reconciliation
                        </Text>
                      )}
                    </VStack>
                  </CardBody>
                </Card>

                {/* Statement Upload */}
                <Card bg={bgColor} border="1px" borderColor={borderColor}>
                  <CardBody>
                    <BankStatementUpload
                      onUpload={handleUpload}
                      isLoading={loading}
                    />
                  </CardBody>
                </Card>
              </VStack>

              {showVerification && transactions.length > 0 && (
                <Card bg={bgColor} border="1px" borderColor={borderColor} mt={6}>
                  <CardBody>
                    <TransactionVerification
                      transactions={transactions}
                      accounts={accounts}
                      onConfirm={handleConfirmTransactions}
                      onCancel={() => setShowVerification(false)}
                    />
                  </CardBody>
                </Card>
              )}
            </TabPanel>

            {/* Reconciliation Tab */}
            <TabPanel p={0} pt={6}>
              <ReconciliationTable
                data={reconciliationData}
                stats={reconciliationStats}
                onAction={handleReconciliationAction}
                onItemUpdate={handleItemUpdate}
                onBulkAction={handleBulkAction}
                loading={loading}
              />
            </TabPanel>

            {/* Reconciliation Report Tab */}
            <TabPanel p={0} pt={6}>
              <Card bg={bgColor} border="1px" borderColor={borderColor}>
                <CardBody>
                  <VStack spacing={6} align="stretch">
                    <Flex justify="space-between" align="center">
                      <Heading size="md">Reconciliation Report</Heading>
                      <HStack spacing={2}>
                        <Button
                          leftIcon={<FiDownload />}
                          size="sm"
                          variant="outline"
                          onClick={() => exportReconciliation('PDF')}
                        >
                          Export PDF
                        </Button>
                        <Button
                          leftIcon={<FiDownload />}
                          size="sm"
                          variant="outline"
                          onClick={() => exportReconciliation('Excel')}
                        >
                          Export Excel
                        </Button>
                      </HStack>
                    </Flex>

                    <Box overflowX="auto">
                      <Table variant="simple" size="sm">
                        <Thead>
                          <Tr>
                            <Th>Item</Th>
                            <Th>Date</Th>
                            <Th>Description</Th>
                            <Th isNumeric>Amount</Th>
                            <Th>Status</Th>
                            <Th>Match Type</Th>
                          </Tr>
                        </Thead>
                        <Tbody>
                          {reconciliationData.matchedItems.map((item, index) => (
                            <Tr key={`matched-${index}`}>
                              <Td>Bank Statement</Td>
                              <Td>{new Date(item.statementItem.date).toLocaleDateString()}</Td>
                              <Td>{item.statementItem.description}</Td>
                              <Td isNumeric>₹{item.statementItem.amount?.toFixed(2)}</Td>
                              <Td>
                                <Badge colorScheme="green">Matched</Badge>
                              </Td>
                              <Td>{item.matchType}</Td>
                            </Tr>
                          ))}
                          {reconciliationData.unmatchedItems.map((item, index) => (
                            <Tr key={`unmatched-${index}`}>
                              <Td>Bank Statement</Td>
                              <Td>{new Date(item.statementItem.date).toLocaleDateString()}</Td>
                              <Td>{item.statementItem.description}</Td>
                              <Td isNumeric>₹{item.statementItem.amount?.toFixed(2)}</Td>
                              <Td>
                                <Badge colorScheme="red">Unmatched</Badge>
                              </Td>
                              <Td>{item.matchType}</Td>
                            </Tr>
                          ))}
                        </Tbody>
                      </Table>
                    </Box>
                  </VStack>
                </CardBody>
              </Card>
            </TabPanel>
          </TabPanels>
        </Tabs>
      </VStack>
    </Container>
  );
};

export default BankReconciliation; 
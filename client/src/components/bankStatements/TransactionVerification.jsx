import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Checkbox,
  Input,
  Select,
  Alert,
  AlertIcon,
  Card,
  CardBody,
  Heading,
  Stat,
  StatLabel,
  StatNumber,
  StatGroup,
  Collapse,
  IconButton,
} from '@chakra-ui/react';
import { CheckIcon, CloseIcon, EditIcon, ChevronDownIcon, ChevronUpIcon } from '@chakra-ui/icons';

const TransactionVerification = ({ transactions, accounts, onConfirm, onEdit, onCancel }) => {
  const [selectedTransactions, setSelectedTransactions] = useState(
    transactions.map((_, index) => index)
  );
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [editForm, setEditForm] = useState({});
  const [accountSelections, setAccountSelections] = useState(
    transactions.map(() => ({ debitAccountId: '', creditAccountId: '' }))
  );
  const [gstSelections, setGstSelections] = useState(
    transactions.map(() => ({
      gstRate: '',
      gstAmount: '',
      gstin: '',
      hsnCode: '',
      placeOfSupply: '',
      isInterState: false
    }))
  );
  const [tdsSelections, setTdsSelections] = useState(
    transactions.map(() => ({
      tdsSection: '',
      tdsRate: '',
      tdsAmount: '',
      panNumber: ''
    }))
  );
  const [error, setError] = useState('');
  const [expandedRows, setExpandedRows] = useState(new Set());

  useEffect(() => {
    setAccountSelections(transactions.map(() => ({ debitAccountId: '', creditAccountId: '' })));
    setGstSelections(transactions.map(() => ({
      gstRate: '',
      gstAmount: '',
      gstin: '',
      hsnCode: '',
      placeOfSupply: '',
      isInterState: false
    })));
    setTdsSelections(transactions.map(() => ({
      tdsSection: '',
      tdsRate: '',
      tdsAmount: '',
      panNumber: ''
    })));
    setSelectedTransactions(transactions.map((_, index) => index));
  }, [transactions]);

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedTransactions(transactions.map((_, index) => index));
    } else {
      setSelectedTransactions([]);
    }
  };

  const handleSelectTransaction = (index, checked) => {
    if (checked) {
      setSelectedTransactions([...selectedTransactions, index]);
    } else {
      setSelectedTransactions(selectedTransactions.filter(i => i !== index));
    }
  };

  const handleEditTransaction = (index) => {
    setEditingTransaction(index);
    setEditForm({
      description: transactions[index].description,
      amount: transactions[index].amount,
      type: transactions[index].type,
    });
  };

  const handleSaveEdit = () => {
    if (onEdit && editingTransaction !== null) {
      onEdit(editingTransaction, editForm);
    }
    setEditingTransaction(null);
    setEditForm({});
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setEditForm({});
  };

  const handleAccountChange = (index, field, value) => {
    setAccountSelections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleGSTChange = (index, field, value) => {
    setGstSelections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-calculate GST amount if rate is provided
      if (field === 'gstRate' && value && transactions[index]) {
        const gstAmount = (transactions[index].amount * parseFloat(value)) / 100;
        updated[index].gstAmount = gstAmount.toFixed(2);
      }
      
      return updated;
    });
  };

  const handleTDSChange = (index, field, value) => {
    setTdsSelections(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      
      // Auto-calculate TDS amount if rate is provided
      if (field === 'tdsRate' && value && transactions[index]) {
        const tdsAmount = (transactions[index].amount * parseFloat(value)) / 100;
        updated[index].tdsAmount = tdsAmount.toFixed(2);
      }
      
      return updated;
    });
  };

  const toggleRowExpansion = (index) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedRows(newExpanded);
  };

  const handleConfirm = () => {
    // Check that all selected transactions have both accounts selected
    const missing = selectedTransactions.some(idx => {
      const sel = accountSelections[idx];
      return !sel.debitAccountId || !sel.creditAccountId;
    });
    if (missing) {
      setError('Please select both Debit and Credit accounts for all selected transactions.');
      return;
    }
    setError('');
    
    // Pass back the transactions with selected accounts and tax details
    const confirmed = selectedTransactions.map(idx => ({
      ...transactions[idx],
      debitAccountId: accountSelections[idx].debitAccountId,
      creditAccountId: accountSelections[idx].creditAccountId,
      // GST fields
      gstRate: gstSelections[idx].gstRate ? parseFloat(gstSelections[idx].gstRate) : undefined,
      gstAmount: gstSelections[idx].gstAmount ? parseFloat(gstSelections[idx].gstAmount) : undefined,
      gstin: gstSelections[idx].gstin || undefined,
      hsnCode: gstSelections[idx].hsnCode || undefined,
      placeOfSupply: gstSelections[idx].placeOfSupply || undefined,
      isInterState: gstSelections[idx].isInterState,
      // TDS fields
      tdsSection: tdsSelections[idx].tdsSection || undefined,
      tdsRate: tdsSelections[idx].tdsRate ? parseFloat(tdsSelections[idx].tdsRate) : undefined,
      tdsAmount: tdsSelections[idx].tdsAmount ? parseFloat(tdsSelections[idx].tdsAmount) : undefined,
      panNumber: tdsSelections[idx].panNumber || undefined,
    }));
    onConfirm(confirmed);
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getTransactionTypeColor = (type) => {
    return type === 'credit' ? 'green' : 'red';
  };

  const getTransactionTypeLabel = (type) => {
    return type === 'credit' ? 'Credit' : 'Debit';
  };

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0);
  const creditAmount = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);
  const debitAmount = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  // Flatten accounts if hierarchical
  const flattenAccounts = (accounts) => {
    if (!Array.isArray(accounts)) return [];
    const flat = [];
    const traverse = (accs) => {
      accs.forEach(acc => {
        flat.push(acc);
        if (acc.children && acc.children.length > 0) {
          traverse(acc.children);
        }
      });
    };
    traverse(accounts);
    return flat;
  };
  const flatAccounts = flattenAccounts(accounts);

  // GST rates for India
  const gstRates = [
    { value: '', label: 'Select GST Rate' },
    { value: '0', label: '0% - Nil Rated' },
    { value: '5', label: '5% - Reduced Rate' },
    { value: '12', label: '12% - Standard Rate' },
    { value: '18', label: '18% - Standard Rate' },
    { value: '28', label: '28% - Luxury Rate' }
  ];

  // TDS sections for India
  const tdsSections = [
    { value: '', label: 'Select TDS Section' },
    { value: '194A', label: '194A - Interest (Other than Securities)' },
    { value: '194C', label: '194C - Contractors' },
    { value: '194D', label: '194D - Insurance Commission' },
    { value: '194G', label: '194G - Commission on Lottery' },
    { value: '194H', label: '194H - Commission/Brokerage' },
    { value: '194I', label: '194I - Rent' },
    { value: '194J', label: '194J - Professional/Technical Services' },
    { value: '194LA', label: '194LA - Compensation on Immovable Property' },
    { value: '194M', label: '194M - Payment to Contractors' },
    { value: '194N', label: '194N - Cash Withdrawal' },
    { value: '194O', label: '194O - E-commerce' },
    { value: '194Q', label: '194Q - Purchase of Goods' },
    { value: '194R', label: '194R - Benefits/Perquisites' },
    { value: '194S', label: '194S - Virtual Digital Assets' }
  ];

  // Indian states for place of supply
  const indianStates = [
    { value: '', label: 'Select State' },
    { value: 'Andhra Pradesh', label: 'Andhra Pradesh' },
    { value: 'Arunachal Pradesh', label: 'Arunachal Pradesh' },
    { value: 'Assam', label: 'Assam' },
    { value: 'Bihar', label: 'Bihar' },
    { value: 'Chhattisgarh', label: 'Chhattisgarh' },
    { value: 'Goa', label: 'Goa' },
    { value: 'Gujarat', label: 'Gujarat' },
    { value: 'Haryana', label: 'Haryana' },
    { value: 'Himachal Pradesh', label: 'Himachal Pradesh' },
    { value: 'Jharkhand', label: 'Jharkhand' },
    { value: 'Karnataka', label: 'Karnataka' },
    { value: 'Kerala', label: 'Kerala' },
    { value: 'Madhya Pradesh', label: 'Madhya Pradesh' },
    { value: 'Maharashtra', label: 'Maharashtra' },
    { value: 'Manipur', label: 'Manipur' },
    { value: 'Meghalaya', label: 'Meghalaya' },
    { value: 'Mizoram', label: 'Mizoram' },
    { value: 'Nagaland', label: 'Nagaland' },
    { value: 'Odisha', label: 'Odisha' },
    { value: 'Punjab', label: 'Punjab' },
    { value: 'Rajasthan', label: 'Rajasthan' },
    { value: 'Sikkim', label: 'Sikkim' },
    { value: 'Tamil Nadu', label: 'Tamil Nadu' },
    { value: 'Telangana', label: 'Telangana' },
    { value: 'Tripura', label: 'Tripura' },
    { value: 'Uttar Pradesh', label: 'Uttar Pradesh' },
    { value: 'Uttarakhand', label: 'Uttarakhand' },
    { value: 'West Bengal', label: 'West Bengal' },
    { value: 'Delhi', label: 'Delhi' },
    { value: 'Jammu and Kashmir', label: 'Jammu and Kashmir' },
    { value: 'Ladakh', label: 'Ladakh' },
    { value: 'Chandigarh', label: 'Chandigarh' },
    { value: 'Dadra and Nagar Haveli', label: 'Dadra and Nagar Haveli' },
    { value: 'Daman and Diu', label: 'Daman and Diu' },
    { value: 'Lakshadweep', label: 'Lakshadweep' },
    { value: 'Puducherry', label: 'Puducherry' },
    { value: 'Andaman and Nicobar Islands', label: 'Andaman and Nicobar Islands' }
  ];

  return (
    <Box p={6}>
      <Card>
        <CardBody>
          <VStack spacing={6} align="stretch">
            <Box>
              <Heading size="md" mb={4}>Verify Extracted Transactions</Heading>
              <Text color="gray.600">
                Review the transactions extracted from your bank statement. 
                Select Debit and Credit accounts for each transaction before confirming.
                Add GST and TDS details for India-specific compliance.
              </Text>
            </Box>

            {/* Summary Statistics */}
            <StatGroup>
              <Stat>
                <StatLabel>Total Transactions</StatLabel>
                <StatNumber>{transactions.length}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Total Amount</StatLabel>
                <StatNumber>{formatCurrency(totalAmount)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Credits</StatLabel>
                <StatNumber color="green.500">{formatCurrency(creditAmount)}</StatNumber>
              </Stat>
              <Stat>
                <StatLabel>Debits</StatLabel>
                <StatNumber color="red.500">{formatCurrency(debitAmount)}</StatNumber>
              </Stat>
            </StatGroup>

            {/* Transactions Table */}
            <Box overflowX="auto">
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>
                      <Checkbox
                        isChecked={selectedTransactions.length === transactions.length}
                        isIndeterminate={
                          selectedTransactions.length > 0 && 
                          selectedTransactions.length < transactions.length
                        }
                        onChange={(e) => handleSelectAll(e.target.checked)}
                      />
                    </Th>
                    <Th>Date</Th>
                    <Th>Description</Th>
                    <Th>Type</Th>
                    <Th isNumeric>Amount</Th>
                    <Th>Debit Account</Th>
                    <Th>Credit Account</Th>
                    <Th>Tax Details</Th>
                    <Th>Actions</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {transactions.map((transaction, index) => (
                    <React.Fragment key={index}>
                      <Tr>
                        <Td>
                          <Checkbox
                            isChecked={selectedTransactions.includes(index)}
                            onChange={(e) => handleSelectTransaction(index, e.target.checked)}
                          />
                        </Td>
                        <Td>{formatDate(transaction.date)}</Td>
                        <Td>
                          {editingTransaction === index ? (
                            <Input
                              value={editForm.description}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                description: e.target.value
                              })}
                              size="sm"
                            />
                          ) : (
                            transaction.description
                          )}
                        </Td>
                        <Td>
                          {editingTransaction === index ? (
                            <Select
                              value={editForm.type}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                type: e.target.value
                              })}
                              size="sm"
                            >
                              <option value="credit">Credit</option>
                              <option value="debit">Debit</option>
                            </Select>
                          ) : (
                            <Badge colorScheme={getTransactionTypeColor(transaction.type)}>
                              {getTransactionTypeLabel(transaction.type)}
                            </Badge>
                          )}
                        </Td>
                        <Td isNumeric>
                          {editingTransaction === index ? (
                            <Input
                              value={editForm.amount}
                              onChange={(e) => setEditForm({
                                ...editForm,
                                amount: parseFloat(e.target.value) || 0
                              })}
                              type="number"
                              size="sm"
                            />
                          ) : (
                            <Text
                              color={getTransactionTypeColor(transaction.type) + '.500'}
                              fontWeight="medium"
                            >
                              {formatCurrency(transaction.amount)}
                            </Text>
                          )}
                        </Td>
                        {/* Debit Account Dropdown */}
                        <Td>
                          <Select
                            placeholder="Select Debit Account"
                            value={accountSelections[index]?.debitAccountId || ''}
                            onChange={e => handleAccountChange(index, 'debitAccountId', e.target.value)}
                            size="sm"
                          >
                            {flatAccounts.map(acc => (
                              <option key={acc.id} value={acc.id}>
                                {acc.code ? `${acc.code} - ` : ''}{acc.name}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        {/* Credit Account Dropdown */}
                        <Td>
                          <Select
                            placeholder="Select Credit Account"
                            value={accountSelections[index]?.creditAccountId || ''}
                            onChange={e => handleAccountChange(index, 'creditAccountId', e.target.value)}
                            size="sm"
                          >
                            {flatAccounts.map(acc => (
                              <option key={acc.id} value={acc.id}>
                                {acc.code ? `${acc.code} - ` : ''}{acc.name}
                              </option>
                            ))}
                          </Select>
                        </Td>
                        {/* Tax Details Toggle */}
                        <Td>
                          <IconButton
                            size="xs"
                            icon={expandedRows.has(index) ? <ChevronUpIcon /> : <ChevronDownIcon />}
                            onClick={() => toggleRowExpansion(index)}
                            aria-label="Toggle tax details"
                          />
                        </Td>
                        <Td>
                          {editingTransaction === index ? (
                            <HStack spacing={1}>
                              <Button
                                size="xs"
                                colorScheme="green"
                                onClick={handleSaveEdit}
                              >
                                <CheckIcon />
                              </Button>
                              <Button
                                size="xs"
                                colorScheme="gray"
                                onClick={handleCancelEdit}
                              >
                                <CloseIcon />
                              </Button>
                            </HStack>
                          ) : (
                            <Button
                              size="xs"
                              colorScheme="blue"
                              onClick={() => handleEditTransaction(index)}
                            >
                              <EditIcon />
                            </Button>
                          )}
                        </Td>
                      </Tr>
                      {/* Expanded Tax Details Row */}
                      <Tr>
                        <Td colSpan={9}>
                          <Collapse in={expandedRows.has(index)}>
                            <Box p={4} bg="gray.50" borderRadius="md">
                              <VStack spacing={4} align="stretch">
                                <Heading size="sm">Tax Details</Heading>
                                
                                {/* GST Section */}
                                <Box>
                                  <Text fontWeight="medium" mb={2}>GST Details</Text>
                                  <HStack spacing={4} wrap="wrap">
                                    <Select
                                      placeholder="GST Rate"
                                      value={gstSelections[index]?.gstRate || ''}
                                      onChange={e => handleGSTChange(index, 'gstRate', e.target.value)}
                                      size="sm"
                                      maxW="150px"
                                    >
                                      {gstRates.map(rate => (
                                        <option key={rate.value} value={rate.value}>
                                          {rate.label}
                                        </option>
                                      ))}
                                    </Select>
                                    
                                    <Input
                                      placeholder="GST Amount"
                                      value={gstSelections[index]?.gstAmount || ''}
                                      onChange={e => handleGSTChange(index, 'gstAmount', e.target.value)}
                                      size="sm"
                                      maxW="150px"
                                      type="number"
                                    />
                                    
                                    <Input
                                      placeholder="GSTIN (15 digits)"
                                      value={gstSelections[index]?.gstin || ''}
                                      onChange={e => handleGSTChange(index, 'gstin', e.target.value)}
                                      size="sm"
                                      maxW="200px"
                                      maxLength={15}
                                    />
                                    
                                    <Input
                                      placeholder="HSN/SAC Code"
                                      value={gstSelections[index]?.hsnCode || ''}
                                      onChange={e => handleGSTChange(index, 'hsnCode', e.target.value)}
                                      size="sm"
                                      maxW="150px"
                                    />
                                    
                                    <Select
                                      placeholder="Place of Supply"
                                      value={gstSelections[index]?.placeOfSupply || ''}
                                      onChange={e => handleGSTChange(index, 'placeOfSupply', e.target.value)}
                                      size="sm"
                                      maxW="200px"
                                    >
                                      {indianStates.map(state => (
                                        <option key={state.value} value={state.value}>
                                          {state.label}
                                        </option>
                                      ))}
                                    </Select>
                                    
                                    <Checkbox
                                      isChecked={gstSelections[index]?.isInterState || false}
                                      onChange={e => handleGSTChange(index, 'isInterState', e.target.checked)}
                                      size="sm"
                                    >
                                      Inter-State
                                    </Checkbox>
                                  </HStack>
                                </Box>
                                
                                {/* TDS Section */}
                                <Box>
                                  <Text fontWeight="medium" mb={2}>TDS Details</Text>
                                  <HStack spacing={4} wrap="wrap">
                                    <Select
                                      placeholder="TDS Section"
                                      value={tdsSelections[index]?.tdsSection || ''}
                                      onChange={e => handleTDSChange(index, 'tdsSection', e.target.value)}
                                      size="sm"
                                      maxW="200px"
                                    >
                                      {tdsSections.map(section => (
                                        <option key={section.value} value={section.value}>
                                          {section.label}
                                        </option>
                                      ))}
                                    </Select>
                                    
                                    <Input
                                      placeholder="TDS Rate (%)"
                                      value={tdsSelections[index]?.tdsRate || ''}
                                      onChange={e => handleTDSChange(index, 'tdsRate', e.target.value)}
                                      size="sm"
                                      maxW="120px"
                                      type="number"
                                    />
                                    
                                    <Input
                                      placeholder="TDS Amount"
                                      value={tdsSelections[index]?.tdsAmount || ''}
                                      onChange={e => handleTDSChange(index, 'tdsAmount', e.target.value)}
                                      size="sm"
                                      maxW="150px"
                                      type="number"
                                    />
                                    
                                    <Input
                                      placeholder="PAN Number"
                                      value={tdsSelections[index]?.panNumber || ''}
                                      onChange={e => handleTDSChange(index, 'panNumber', e.target.value)}
                                      size="sm"
                                      maxW="150px"
                                      maxLength={10}
                                    />
                                  </HStack>
                                </Box>
                              </VStack>
                            </Box>
                          </Collapse>
                        </Td>
                      </Tr>
                    </React.Fragment>
                  ))}
                </Tbody>
              </Table>
            </Box>

            {/* Error message */}
            {error && (
              <Alert status="error">
                <AlertIcon />
                {error}
              </Alert>
            )}

            {/* Action Buttons */}
            <HStack spacing={4} justify="flex-end">
              <Button variant="ghost" onClick={onCancel}>
                Cancel
              </Button>
              <Button
                colorScheme="blue"
                onClick={handleConfirm}
                isDisabled={selectedTransactions.length === 0}
              >
                Confirm {selectedTransactions.length} Transaction{selectedTransactions.length !== 1 ? 's' : ''}
              </Button>
            </HStack>

            {/* Instructions */}
            <Alert status="info">
              <AlertIcon />
              <Box>
                <Text fontWeight="medium">Instructions:</Text>
                <Text fontSize="sm">
                  • Select the transactions you want to import<br/>
                  • Edit any transaction details by clicking the edit button<br/>
                  • Select Debit and Credit accounts for each transaction<br/>
                  • Click the tax details icon to add GST and TDS information<br/>
                  • Click "Confirm" to import the selected transactions as journal entries
                </Text>
              </Box>
            </Alert>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default TransactionVerification; 
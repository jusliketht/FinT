import React, { useState } from 'react';
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
  Select,
  Input,
  Card,
  CardBody,
  Heading,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue,
  Alert,
  AlertIcon,
  Collapse,
  Divider,
} from '@chakra-ui/react';
import {
  FiCheck,
  FiX,
  FiEye,
  FiEdit,
  FiDownload,
  FiFilter,
  FiRefreshCw,
  FiLock,
  FiUnlock,
} from 'react-icons/fi';

const ReconciliationTable = ({ 
  data, 
  stats, 
  onAction, 
  loading,
  onItemUpdate,
  onBulkAction 
}) => {
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [filterType, setFilterType] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedItems, setExpandedItems] = useState(new Set());

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const hoverBg = useColorModeValue('gray.50', 'gray.700');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getMatchTypeColor = (matchType) => {
    switch (matchType) {
      case 'exact':
        return 'green';
      case 'fuzzy':
        return 'yellow';
      case 'none':
        return 'red';
      default:
        return 'gray';
    }
  };

  const getMatchTypeLabel = (matchType) => {
    switch (matchType) {
      case 'exact':
        return 'Exact Match';
      case 'fuzzy':
        return 'Fuzzy Match';
      case 'none':
        return 'No Match';
      default:
        return 'Unknown';
    }
  };

  const getConfidenceColor = (confidence) => {
    switch (confidence) {
      case 'high':
        return 'green';
      case 'medium':
        return 'yellow';
      case 'low':
        return 'red';
      default:
        return 'gray';
    }
  };

  const handleItemSelect = (itemId) => {
    const newSelected = new Set(selectedItems);
    if (newSelected.has(itemId)) {
      newSelected.delete(itemId);
    } else {
      newSelected.add(itemId);
    }
    setSelectedItems(newSelected);
  };

  const handleBulkSelect = (itemIds) => {
    const newSelected = new Set(selectedItems);
    itemIds.forEach(id => newSelected.add(id));
    setSelectedItems(newSelected);
  };

  const handleBulkDeselect = (itemIds) => {
    const newSelected = new Set(selectedItems);
    itemIds.forEach(id => newSelected.delete(id));
    setSelectedItems(newSelected);
  };

  const toggleItemExpansion = (itemId) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(itemId)) {
      newExpanded.delete(itemId);
    } else {
      newExpanded.add(itemId);
    }
    setExpandedItems(newExpanded);
  };

  const filteredItems = () => {
    let items = [];
    
    // Combine all items
    items = [
      ...data.matchedItems.map(item => ({ ...item, category: 'matched' })),
      ...data.unmatchedItems.map(item => ({ ...item, category: 'unmatched' })),
      ...data.adjustments.map(item => ({ ...item, category: 'adjustment' }))
    ];

    // Apply filter
    if (filterType !== 'all') {
      items = items.filter(item => item.category === filterType);
    }

    // Apply search
    if (searchTerm) {
      items = items.filter(item => 
        item.statementItem.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.ledgerItem?.description?.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    return items;
  };

  const renderItemRow = (item, index) => {
    const isSelected = selectedItems.has(item.statementItem.id || index);
    const isExpanded = expandedItems.has(item.statementItem.id || index);

    return (
      <React.Fragment key={item.statementItem.id || index}>
        <Tr 
          bg={isSelected ? 'blue.50' : 'transparent'}
          _hover={{ bg: hoverBg }}
          cursor="pointer"
          onClick={() => toggleItemExpansion(item.statementItem.id || index)}
        >
          <Td>
            <Checkbox
              isChecked={isSelected}
              onChange={(e) => {
                e.stopPropagation();
                handleItemSelect(item.statementItem.id || index);
              }}
            />
          </Td>
          <Td>
            <VStack align="start" spacing={1}>
              <Text fontWeight="medium">
                {formatDate(item.statementItem.date)}
              </Text>
              <Text fontSize="sm" color="gray.500">
                {item.statementItem.reference || 'N/A'}
              </Text>
            </VStack>
          </Td>
          <Td>
            <Text noOfLines={2}>
              {item.statementItem.description}
            </Text>
          </Td>
          <Td isNumeric>
            <Text fontWeight="medium">
              {formatCurrency(item.statementItem.amount)}
            </Text>
          </Td>
          <Td>
            <VStack align="start" spacing={1}>
              {item.ledgerItem ? (
                <>
                  <Text fontWeight="medium">
                    {formatDate(item.ledgerItem.date)}
                  </Text>
                  <Text fontSize="sm" color="gray.500">
                    {item.ledgerItem.referenceNumber || 'N/A'}
                  </Text>
                </>
              ) : (
                <Text color="gray.400">No ledger entry</Text>
              )}
            </VStack>
          </Td>
          <Td>
            {item.ledgerItem ? (
              <Text noOfLines={2}>
                {item.ledgerItem.description}
              </Text>
            ) : (
              <Text color="gray.400">No ledger entry</Text>
            )}
          </Td>
          <Td isNumeric>
            {item.ledgerItem ? (
              <Text fontWeight="medium">
                {formatCurrency(item.ledgerItem.amount)}
              </Text>
            ) : (
              <Text color="gray.400">-</Text>
            )}
          </Td>
          <Td>
            <VStack spacing={1}>
              <Badge colorScheme={getMatchTypeColor(item.matchType)}>
                {getMatchTypeLabel(item.matchType)}
              </Badge>
              <Badge colorScheme={getConfidenceColor(item.confidence)} size="sm">
                {item.confidence}
              </Badge>
            </VStack>
          </Td>
          <Td>
            <HStack spacing={1}>
              {item.needsReview && (
                <Tooltip label="Needs Review">
                  <IconButton
                    size="sm"
                    icon={<FiEye />}
                    colorScheme="yellow"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemUpdate && onItemUpdate(item, 'review');
                    }}
                  />
                </Tooltip>
              )}
              {item.needsCreation && (
                <Tooltip label="Create Entry">
                  <IconButton
                    size="sm"
                    icon={<FiEdit />}
                    colorScheme="blue"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemUpdate && onItemUpdate(item, 'create');
                    }}
                  />
                </Tooltip>
              )}
              {item.matchType === 'exact' && (
                <Tooltip label="Approve Match">
                  <IconButton
                    size="sm"
                    icon={<FiCheck />}
                    colorScheme="green"
                    variant="ghost"
                    onClick={(e) => {
                      e.stopPropagation();
                      onItemUpdate && onItemUpdate(item, 'approve');
                    }}
                  />
                </Tooltip>
              )}
            </HStack>
          </Td>
        </Tr>
        
        {/* Expanded Details */}
        <Tr>
          <Td colSpan={9} p={0}>
            <Collapse in={isExpanded}>
              <Box p={4} bg="gray.50" borderLeft="4px solid" borderColor={getMatchTypeColor(item.matchType)}>
                <VStack align="stretch" spacing={3}>
                  <Heading size="sm">Transaction Details</Heading>
                  
                  <HStack justify="space-between">
                    <Box>
                      <Text fontWeight="medium" mb={1}>Bank Statement</Text>
                      <Text fontSize="sm">Date: {formatDate(item.statementItem.date)}</Text>
                      <Text fontSize="sm">Description: {item.statementItem.description}</Text>
                      <Text fontSize="sm">Amount: {formatCurrency(item.statementItem.amount)}</Text>
                      <Text fontSize="sm">Type: {item.statementItem.type}</Text>
                    </Box>
                    
                    {item.ledgerItem && (
                      <Box>
                        <Text fontWeight="medium" mb={1}>Ledger Entry</Text>
                        <Text fontSize="sm">Date: {formatDate(item.ledgerItem.date)}</Text>
                        <Text fontSize="sm">Description: {item.ledgerItem.description}</Text>
                        <Text fontSize="sm">Amount: {formatCurrency(item.ledgerItem.amount)}</Text>
                        <Text fontSize="sm">Account: {item.ledgerItem.account?.name}</Text>
                      </Box>
                    )}
                  </HStack>
                  
                  <Divider />
                  
                  <HStack justify="space-between">
                    <Text fontSize="sm">
                      <strong>Difference:</strong> {formatCurrency(
                        (item.statementItem.amount || 0) - (item.ledgerItem?.amount || 0)
                      )}
                    </Text>
                    <Text fontSize="sm">
                      <strong>Days Difference:</strong> {item.ledgerItem ? 
                        Math.abs(new Date(item.statementItem.date) - new Date(item.ledgerItem.date)) / (1000 * 60 * 60 * 24)
                      : 'N/A'}
                    </Text>
                  </HStack>
                </VStack>
              </Box>
            </Collapse>
          </Td>
        </Tr>
      </React.Fragment>
    );
  };

  return (
    <VStack spacing={6} align="stretch">
      {/* Filters and Actions */}
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={4} align="stretch">
            <HStack justify="space-between">
              <Heading size="md">Reconciliation Table</Heading>
              <HStack spacing={2}>
                <Button
                  size="sm"
                  leftIcon={<FiRefreshCw />}
                  onClick={() => onAction && onAction('refresh')}
                  isLoading={loading}
                >
                  Refresh
                </Button>
                <Button
                  size="sm"
                  leftIcon={<FiDownload />}
                  onClick={() => onAction && onAction('export')}
                >
                  Export
                </Button>
              </HStack>
            </HStack>

            <HStack spacing={4}>
              <Select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                maxW="200px"
              >
                <option value="all">All Items</option>
                <option value="matched">Matched</option>
                <option value="unmatched">Unmatched</option>
                <option value="adjustment">Adjustments</option>
              </Select>
              
              <Input
                placeholder="Search transactions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                maxW="300px"
              />
              
              <HStack spacing={2}>
                <Button
                  size="sm"
                  onClick={() => handleBulkSelect(filteredItems().map(item => item.statementItem.id || item.statementItem.reference))}
                >
                  Select All
                </Button>
                <Button
                  size="sm"
                  onClick={() => setSelectedItems(new Set())}
                >
                  Clear Selection
                </Button>
              </HStack>
            </HStack>

            {selectedItems.size > 0 && (
              <Alert status="info">
                <AlertIcon />
                {selectedItems.size} items selected
                <HStack ml={4} spacing={2}>
                  <Button
                    size="sm"
                    colorScheme="green"
                    onClick={() => onBulkAction && onBulkAction('approve', Array.from(selectedItems))}
                  >
                    Approve Selected
                  </Button>
                  <Button
                    size="sm"
                    colorScheme="blue"
                    onClick={() => onBulkAction && onBulkAction('create', Array.from(selectedItems))}
                  >
                    Create Entries
                  </Button>
                </HStack>
              </Alert>
            )}
          </VStack>
        </CardBody>
      </Card>

      {/* Reconciliation Table */}
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardBody>
          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>
                    <Checkbox
                      isChecked={selectedItems.size === filteredItems().length && filteredItems().length > 0}
                      isIndeterminate={selectedItems.size > 0 && selectedItems.size < filteredItems().length}
                      onChange={(e) => {
                        if (e.target.checked) {
                          handleBulkSelect(filteredItems().map(item => item.statementItem.id || item.statementItem.reference));
                        } else {
                          setSelectedItems(new Set());
                        }
                      }}
                    />
                  </Th>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Ledger Date</Th>
                  <Th>Ledger Description</Th>
                  <Th isNumeric>Ledger Amount</Th>
                  <Th>Match Status</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredItems().map((item, index) => renderItemRow(item, index))}
              </Tbody>
            </Table>
          </Box>
        </CardBody>
      </Card>

      {/* Summary Stats */}
      <Card bg={bgColor} border="1px" borderColor={borderColor}>
        <CardBody>
          <VStack spacing={3} align="stretch">
            <Heading size="sm">Reconciliation Summary</Heading>
            <HStack justify="space-between" wrap="wrap">
              <Text>Total Items: <strong>{stats.totalItems}</strong></Text>
              <Text color="green.500">Matched: <strong>{stats.matchedItems}</strong></Text>
              <Text color="orange.500">Unmatched: <strong>{stats.unmatchedItems}</strong></Text>
              <Text color="yellow.500">Adjustments: <strong>{stats.adjustedItems}</strong></Text>
              <Text color={stats.difference === 0 ? 'green.500' : 'red.500'}>
                Difference: <strong>{formatCurrency(stats.difference)}</strong>
              </Text>
            </HStack>
          </VStack>
        </CardBody>
      </Card>
    </VStack>
  );
};

export default ReconciliationTable;

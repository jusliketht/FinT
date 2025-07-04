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
  Card,
  CardBody,
  Heading,
  Flex,
  IconButton,
  Tooltip,
  useColorModeValue,
  Alert,
  AlertIcon,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  SimpleGrid,
  Divider,
} from '@chakra-ui/react';
import {
  FiDownload,
  FiEye,
  FiPrinter,
  FiFileText,
  FiCalendar,
  FiDollarSign,
} from 'react-icons/fi';

const ReconciliationReport = ({ 
  data, 
  stats, 
  onExport,
  loading 
}) => {
  const [exportFormat, setExportFormat] = useState('pdf');
  
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount || 0);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-IN');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'matched':
        return 'green';
      case 'unmatched':
        return 'red';
      case 'adjustment':
        return 'yellow';
      default:
        return 'gray';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'matched':
        return 'Matched';
      case 'unmatched':
        return 'Unmatched';
      case 'adjustment':
        return 'Needs Review';
      default:
        return 'Unknown';
    }
  };

  const handleExport = (format) => {
    onExport && onExport(format);
  };

  const renderReconciliationSummary = () => (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Heading size="md">Reconciliation Summary</Heading>
          
          <SimpleGrid columns={{ base: 2, md: 4 }} spacing={4}>
            <Stat>
              <StatLabel>Total Transactions</StatLabel>
              <StatNumber>{stats.totalItems}</StatNumber>
              <StatHelpText>From bank statement</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Matched Items</StatLabel>
              <StatNumber color="green.500">{stats.matchedItems}</StatNumber>
              <StatHelpText>Auto-matched</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Unmatched Items</StatLabel>
              <StatNumber color="red.500">{stats.unmatchedItems}</StatNumber>
              <StatHelpText>Need attention</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Adjustments</StatLabel>
              <StatNumber color="yellow.500">{stats.adjustedItems}</StatNumber>
              <StatHelpText>Needs review</StatHelpText>
            </Stat>
          </SimpleGrid>

          <Divider />

          <SimpleGrid columns={{ base: 2, md: 3 }} spacing={4}>
            <Stat>
              <StatLabel>Bank Statement Balance</StatLabel>
              <StatNumber>{formatCurrency(stats.bankBalance)}</StatNumber>
              <StatHelpText>Total from statement</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Ledger Balance</StatLabel>
              <StatNumber>{formatCurrency(stats.ledgerBalance)}</StatNumber>
              <StatHelpText>Total from ledger</StatHelpText>
            </Stat>
            
            <Stat>
              <StatLabel>Difference</StatLabel>
              <StatNumber color={stats.difference === 0 ? 'green.500' : 'red.500'}>
                {formatCurrency(stats.difference)}
              </StatNumber>
              <StatHelpText>
                {stats.difference === 0 ? '✓ Reconciled' : '⚠ Needs attention'}
              </StatHelpText>
            </Stat>
          </SimpleGrid>
        </VStack>
      </CardBody>
    </Card>
  );

  const renderDetailedReport = () => (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={6} align="stretch">
          <Flex justify="space-between" align="center">
            <Heading size="md">Detailed Transaction Report</Heading>
            <HStack spacing={2}>
              <Button
                size="sm"
                leftIcon={<FiDownload />}
                onClick={() => handleExport('pdf')}
                isLoading={loading}
              >
                Export PDF
              </Button>
              <Button
                size="sm"
                leftIcon={<FiDownload />}
                onClick={() => handleExport('excel')}
                isLoading={loading}
              >
                Export Excel
              </Button>
            </HStack>
          </Flex>

          <Box overflowX="auto">
            <Table variant="simple" size="sm">
              <Thead>
                <Tr>
                  <Th>Date</Th>
                  <Th>Description</Th>
                  <Th isNumeric>Amount</Th>
                  <Th>Type</Th>
                  <Th>Status</Th>
                  <Th>Match Details</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Matched Items */}
                {data.matchedItems.map((item, index) => (
                  <Tr key={`matched-${index}`}>
                    <Td>{formatDate(item.statementItem.date)}</Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">
                          {item.statementItem.description}
                        </Text>
                        {item.ledgerItem && (
                          <Text fontSize="sm" color="gray.500">
                            Ledger: {item.ledgerItem.description}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td isNumeric>
                      <VStack align="end" spacing={1}>
                        <Text fontWeight="medium">
                          {formatCurrency(item.statementItem.amount)}
                        </Text>
                        {item.ledgerItem && (
                          <Text fontSize="sm" color="gray.500">
                            {formatCurrency(item.ledgerItem.amount)}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Text textTransform="capitalize">
                        {item.statementItem.type}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="green">
                        {getStatusLabel('matched')}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          <strong>Match Type:</strong> {item.matchType}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Confidence:</strong> {item.confidence}
                        </Text>
                        {item.ledgerItem && (
                          <Text fontSize="sm">
                            <strong>Account:</strong> {item.ledgerItem.account?.name}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                  </Tr>
                ))}

                {/* Unmatched Items */}
                {data.unmatchedItems.map((item, index) => (
                  <Tr key={`unmatched-${index}`}>
                    <Td>{formatDate(item.statementItem.date)}</Td>
                    <Td>
                      <Text fontWeight="medium">
                        {item.statementItem.description}
                      </Text>
                    </Td>
                    <Td isNumeric>
                      <Text fontWeight="medium">
                        {formatCurrency(item.statementItem.amount)}
                      </Text>
                    </Td>
                    <Td>
                      <Text textTransform="capitalize">
                        {item.statementItem.type}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="red">
                        {getStatusLabel('unmatched')}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          <strong>Match Type:</strong> {item.matchType}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Confidence:</strong> {item.confidence}
                        </Text>
                        <Text fontSize="sm" color="red.500">
                          <strong>Action Required:</strong> Create journal entry
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                ))}

                {/* Adjustment Items */}
                {data.adjustments.map((item, index) => (
                  <Tr key={`adjustment-${index}`}>
                    <Td>{formatDate(item.statementItem.date)}</Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontWeight="medium">
                          {item.statementItem.description}
                        </Text>
                        {item.ledgerItem && (
                          <Text fontSize="sm" color="gray.500">
                            Ledger: {item.ledgerItem.description}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td isNumeric>
                      <VStack align="end" spacing={1}>
                        <Text fontWeight="medium">
                          {formatCurrency(item.statementItem.amount)}
                        </Text>
                        {item.ledgerItem && (
                          <Text fontSize="sm" color="gray.500">
                            {formatCurrency(item.ledgerItem.amount)}
                          </Text>
                        )}
                      </VStack>
                    </Td>
                    <Td>
                      <Text textTransform="capitalize">
                        {item.statementItem.type}
                      </Text>
                    </Td>
                    <Td>
                      <Badge colorScheme="yellow">
                        {getStatusLabel('adjustment')}
                      </Badge>
                    </Td>
                    <Td>
                      <VStack align="start" spacing={1}>
                        <Text fontSize="sm">
                          <strong>Match Type:</strong> {item.matchType}
                        </Text>
                        <Text fontSize="sm">
                          <strong>Confidence:</strong> {item.confidence}
                        </Text>
                        <Text fontSize="sm" color="orange.500">
                          <strong>Action Required:</strong> Review match
                        </Text>
                      </VStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </VStack>
      </CardBody>
    </Card>
  );

  const renderAuditTrail = () => (
    <Card bg={bgColor} border="1px" borderColor={borderColor}>
      <CardBody>
        <VStack spacing={4} align="stretch">
          <Heading size="md">Reconciliation Audit Trail</Heading>
          
          <VStack spacing={3} align="stretch">
            <HStack justify="space-between">
              <Text fontWeight="medium">Reconciliation Date</Text>
              <Text>{formatDate(new Date())}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontWeight="medium">Total Items Processed</Text>
              <Text>{stats.totalItems}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontWeight="medium">Auto-Matched Items</Text>
              <Text color="green.500">{stats.matchedItems}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontWeight="medium">Items Requiring Review</Text>
              <Text color="orange.500">{stats.unmatchedItems + stats.adjustedItems}</Text>
            </HStack>
            
            <HStack justify="space-between">
              <Text fontWeight="medium">Reconciliation Status</Text>
              <Badge colorScheme={stats.difference === 0 ? 'green' : 'red'}>
                {stats.difference === 0 ? 'Reconciled' : 'Unreconciled'}
              </Badge>
            </HStack>
          </VStack>
        </VStack>
      </CardBody>
    </Card>
  );

  return (
    <VStack spacing={6} align="stretch">
      {renderReconciliationSummary()}
      {renderDetailedReport()}
      {renderAuditTrail()}
    </VStack>
  );
};

export default ReconciliationReport; 
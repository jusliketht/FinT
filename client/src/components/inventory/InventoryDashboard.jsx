import React, { useState, useEffect } from 'react';
import {
  Box, Heading, Flex, HStack, Button, SimpleGrid, Stat, StatLabel, StatNumber, StatHelpText, Alert, AlertIcon, AlertTitle, AlertDescription, Card, CardHeader, CardBody, Table, Thead, Tbody, Tr, Th, Td, Badge, Menu, MenuButton, MenuList, MenuItem, IconButton, useToast
} from '@chakra-ui/react';
import { AddIcon, DownloadIcon, ChevronDownIcon } from '@chakra-ui/icons';
import { formatCurrency } from '../../utils/formatters';
import { useApi } from '../../hooks/useApi';

const InventoryDashboard = () => {
  const [inventoryItems, setInventoryItems] = useState([]);
  const [lowStockItems, setLowStockItems] = useState([]);
  const [inventoryValue, setInventoryValue] = useState(0);
  const [loading, setLoading] = useState(false);
  const toast = useToast();
  const api = useApi();

  useEffect(() => {
    fetchInventoryData();
  }, []);

  const fetchInventoryData = async () => {
    try {
      setLoading(true);
      const [itemsResponse, lowStockResponse, valuationResponse] = await Promise.all([
        api.get('/inventory/items'),
        api.get('/inventory/low-stock'),
        api.get('/inventory/valuation')
      ]);
      setInventoryItems(itemsResponse.data);
      setLowStockItems(lowStockResponse.data);
      setInventoryValue(valuationResponse.data.reduce((sum, item) => sum + item.totalValue, 0));
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to fetch inventory data', status: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const exportInventoryReport = () => {
    // Placeholder for export logic
    toast({ title: 'Export', description: 'Export not implemented', status: 'info' });
  };

  const viewItemDetails = (item) => {};
  const editItem = (item) => {};
  const adjustInventory = (item) => {};
  const viewMovements = (item) => {};

  return (
    <Box>
      <Flex justify="space-between" align="center" mb={6}>
        <Heading>Inventory Management</Heading>
        <HStack>
          <Button leftIcon={<AddIcon />} colorScheme="blue">
            Add Item
          </Button>
          <Button leftIcon={<DownloadIcon />} onClick={exportInventoryReport}>
            Export Report
          </Button>
        </HStack>
      </Flex>
      <SimpleGrid columns={{ base: 1, md: 4 }} spacing={6} mb={8}>
        <Stat>
          <StatLabel>Total Items</StatLabel>
          <StatNumber>{inventoryItems.length}</StatNumber>
          <StatHelpText>Active inventory items</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Total Value</StatLabel>
          <StatNumber>{formatCurrency(inventoryValue)}</StatNumber>
          <StatHelpText>Current inventory value</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Low Stock Items</StatLabel>
          <StatNumber color="red.500">{lowStockItems.length}</StatNumber>
          <StatHelpText>Items below reorder level</StatHelpText>
        </Stat>
        <Stat>
          <StatLabel>Locations</StatLabel>
          <StatNumber>3</StatNumber>
          <StatHelpText>Active locations</StatHelpText>
        </Stat>
      </SimpleGrid>
      {lowStockItems.length > 0 && (
        <Alert status="warning" mb={6}>
          <AlertIcon />
          <Box>
            <AlertTitle>Low Stock Alert!</AlertTitle>
            <AlertDescription>
              {lowStockItems.length} items are below their reorder level.
              <Button size="sm" ml={2}>
                View Details
              </Button>
            </AlertDescription>
          </Box>
        </Alert>
      )}
      <Card>
        <CardHeader>
          <Heading size="md">Inventory Items</Heading>
        </CardHeader>
        <CardBody>
          <Table>
            <Thead>
              <Tr>
                <Th>SKU</Th>
                <Th>Name</Th>
                <Th>Category</Th>
                <Th>Qty on Hand</Th>
                <Th>Avg Cost</Th>
                <Th>Total Value</Th>
                <Th>Reorder Level</Th>
                <Th>Status</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {inventoryItems.map(item => (
                <Tr key={item.id}>
                  <Td fontFamily="mono">{item.sku}</Td>
                  <Td>{item.name}</Td>
                  <Td>
                    <Badge colorScheme="blue">{item.category}</Badge>
                  </Td>
                  <Td>{item.quantityOnHand}</Td>
                  <Td>{formatCurrency(item.averageCost)}</Td>
                  <Td>{formatCurrency(item.totalValue)}</Td>
                  <Td>{item.reorderLevel}</Td>
                  <Td>
                    <Badge colorScheme={item.quantityOnHand <= item.reorderLevel ? 'red' : 'green'}>
                      {item.quantityOnHand <= item.reorderLevel ? 'Low Stock' : 'In Stock'}
                    </Badge>
                  </Td>
                  <Td>
                    <Menu>
                      <MenuButton as={IconButton} icon={<ChevronDownIcon />} size="sm" />
                      <MenuList>
                        <MenuItem onClick={() => viewItemDetails(item)}>View Details</MenuItem>
                        <MenuItem onClick={() => editItem(item)}>Edit Item</MenuItem>
                        <MenuItem onClick={() => adjustInventory(item)}>Adjust Quantity</MenuItem>
                        <MenuItem onClick={() => viewMovements(item)}>View Movements</MenuItem>
                      </MenuList>
                    </Menu>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </CardBody>
      </Card>
    </Box>
  );
};

export default InventoryDashboard; 
import React from 'react';
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  Button,
  VStack,
  HStack,
  Text,
  Badge,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Box,
  Divider,
  Grid,
  GridItem,
  Select,
} from '@chakra-ui/react';

const BillDetailsModal = ({ isOpen, onClose, bill, onStatusUpdate, onMarkAsPaid }) => {
  if (!bill) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'RECEIVED': return 'blue';
      case 'PAID': return 'green';
      case 'OVERDUE': return 'red';
      case 'VOID': return 'blackAlpha';
      default: return 'gray';
    }
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(bill.id, newStatus);
  };

  const handleMarkAsPaid = () => {
    onMarkAsPaid(bill.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Bill Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Bill Header */}
            <Box>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontWeight="bold" fontSize="lg">{bill.billNumber}</Text>
                  <Text color="gray.600">Bill Number</Text>
                </GridItem>
                <GridItem textAlign="right">
                  <Badge colorScheme={getStatusColor(bill.status)} fontSize="md" p={2}>
                    {bill.status}
                  </Badge>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Vendor Information */}
            <Box>
              <Text fontWeight="bold" mb={3}>Vendor Information</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontWeight="semibold">{bill.vendorName}</Text>
                  <Text color="gray.600">Vendor Name</Text>
                </GridItem>
                {bill.vendorEmail && (
                  <GridItem>
                    <Text>{bill.vendorEmail}</Text>
                    <Text color="gray.600">Email</Text>
                  </GridItem>
                )}
                {bill.vendorPhone && (
                  <GridItem>
                    <Text>{bill.vendorPhone}</Text>
                    <Text color="gray.600">Phone</Text>
                  </GridItem>
                )}
                {bill.vendorAddress && (
                  <GridItem colSpan={2}>
                    <Text>{bill.vendorAddress}</Text>
                    <Text color="gray.600">Address</Text>
                  </GridItem>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Bill Details */}
            <Box>
              <Text fontWeight="bold" mb={3}>Bill Details</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text>{new Date(bill.issueDate).toLocaleDateString()}</Text>
                  <Text color="gray.600">Issue Date</Text>
                </GridItem>
                <GridItem>
                  <Text>{new Date(bill.dueDate).toLocaleDateString()}</Text>
                  <Text color="gray.600">Due Date</Text>
                </GridItem>
                {bill.notes && (
                  <GridItem colSpan={2}>
                    <Text>{bill.notes}</Text>
                    <Text color="gray.600">Notes</Text>
                  </GridItem>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Bill Items */}
            <Box>
              <Text fontWeight="bold" mb={3}>Bill Items</Text>
              <Table variant="simple" size="sm">
                <Thead>
                  <Tr>
                    <Th>Description</Th>
                    <Th isNumeric>Qty</Th>
                    <Th isNumeric>Unit Price</Th>
                    <Th isNumeric>Tax %</Th>
                    <Th isNumeric>Total</Th>
                  </Tr>
                </Thead>
                <Tbody>
                  {bill.BillItems?.map((item, index) => (
                    <Tr key={index}>
                      <Td>{item.description}</Td>
                      <Td isNumeric>{item.quantity}</Td>
                      <Td isNumeric>₹{item.unitPrice.toLocaleString()}</Td>
                      <Td isNumeric>{item.taxRate}%</Td>
                      <Td isNumeric>₹{item.totalPrice.toLocaleString()}</Td>
                    </Tr>
                  ))}
                </Tbody>
              </Table>
            </Box>

            <Divider />

            {/* Totals */}
            <Box>
              <VStack spacing={2} align="stretch">
                <HStack justify="space-between">
                  <Text>Subtotal:</Text>
                  <Text fontWeight="bold">₹{bill.subtotal.toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Tax Amount:</Text>
                  <Text fontWeight="bold">₹{bill.taxAmount.toLocaleString()}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">Total:</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    ₹{bill.totalAmount.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Status Management */}
            {bill.status !== 'PAID' && bill.status !== 'VOID' && (
              <>
                <Divider />
                <Box>
                  <Text fontWeight="bold" mb={3}>Status Management</Text>
                  <HStack spacing={4}>
                    <Select
                      value={bill.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      maxW="200px"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="RECEIVED">Received</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="VOID">Void</option>
                    </Select>
                    {bill.status === 'RECEIVED' && (
                      <Button colorScheme="green" onClick={handleMarkAsPaid}>
                        Mark as Paid
                      </Button>
                    )}
                  </HStack>
                </Box>
              </>
            )}
          </VStack>
        </ModalBody>

        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default BillDetailsModal; 
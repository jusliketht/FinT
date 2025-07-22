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

const InvoiceDetailsModal = ({ isOpen, onClose, invoice, onStatusUpdate, onMarkAsPaid }) => {
  if (!invoice) return null;

  const getStatusColor = (status) => {
    switch (status) {
      case 'DRAFT': return 'gray';
      case 'SENT': return 'blue';
      case 'PAID': return 'green';
      case 'OVERDUE': return 'red';
      case 'VOID': return 'blackAlpha';
      default: return 'gray';
    }
  };

  const handleStatusChange = (newStatus) => {
    onStatusUpdate(invoice.id, newStatus);
  };

  const handleMarkAsPaid = () => {
    onMarkAsPaid(invoice.id);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl" scrollBehavior="inside">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Invoice Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <VStack spacing={6} align="stretch">
            {/* Invoice Header */}
            <Box>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontWeight="bold" fontSize="lg">{invoice.invoiceNumber}</Text>
                  <Text color="gray.600">Invoice Number</Text>
                </GridItem>
                <GridItem textAlign="right">
                  <Badge colorScheme={getStatusColor(invoice.status)} fontSize="md" p={2}>
                    {invoice.status}
                  </Badge>
                </GridItem>
              </Grid>
            </Box>

            <Divider />

            {/* Customer Information */}
            <Box>
              <Text fontWeight="bold" mb={3}>Customer Information</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text fontWeight="semibold">{invoice.customerName}</Text>
                  <Text color="gray.600">Customer Name</Text>
                </GridItem>
                {invoice.customerEmail && (
                  <GridItem>
                    <Text>{invoice.customerEmail}</Text>
                    <Text color="gray.600">Email</Text>
                  </GridItem>
                )}
                {invoice.customerPhone && (
                  <GridItem>
                    <Text>{invoice.customerPhone}</Text>
                    <Text color="gray.600">Phone</Text>
                  </GridItem>
                )}
                {invoice.customerAddress && (
                  <GridItem colSpan={2}>
                    <Text>{invoice.customerAddress}</Text>
                    <Text color="gray.600">Address</Text>
                  </GridItem>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Invoice Details */}
            <Box>
              <Text fontWeight="bold" mb={3}>Invoice Details</Text>
              <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                <GridItem>
                  <Text>{new Date(invoice.issueDate).toLocaleDateString()}</Text>
                  <Text color="gray.600">Issue Date</Text>
                </GridItem>
                <GridItem>
                  <Text>{new Date(invoice.dueDate).toLocaleDateString()}</Text>
                  <Text color="gray.600">Due Date</Text>
                </GridItem>
                {invoice.notes && (
                  <GridItem colSpan={2}>
                    <Text>{invoice.notes}</Text>
                    <Text color="gray.600">Notes</Text>
                  </GridItem>
                )}
              </Grid>
            </Box>

            <Divider />

            {/* Invoice Items */}
            <Box>
              <Text fontWeight="bold" mb={3}>Invoice Items</Text>
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
                  {invoice.InvoiceItems?.map((item, index) => (
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
                  <Text fontWeight="bold">₹{invoice.subtotal.toLocaleString()}</Text>
                </HStack>
                <HStack justify="space-between">
                  <Text>Tax Amount:</Text>
                  <Text fontWeight="bold">₹{invoice.taxAmount.toLocaleString()}</Text>
                </HStack>
                <Divider />
                <HStack justify="space-between">
                  <Text fontSize="lg" fontWeight="bold">Total:</Text>
                  <Text fontSize="lg" fontWeight="bold" color="blue.600">
                    ₹{invoice.totalAmount.toLocaleString()}
                  </Text>
                </HStack>
              </VStack>
            </Box>

            {/* Status Management */}
            {invoice.status !== 'PAID' && invoice.status !== 'VOID' && (
              <>
                <Divider />
                <Box>
                  <Text fontWeight="bold" mb={3}>Status Management</Text>
                  <HStack spacing={4}>
                    <Select
                      value={invoice.status}
                      onChange={(e) => handleStatusChange(e.target.value)}
                      maxW="200px"
                    >
                      <option value="DRAFT">Draft</option>
                      <option value="SENT">Sent</option>
                      <option value="OVERDUE">Overdue</option>
                      <option value="VOID">Void</option>
                    </Select>
                    {invoice.status === 'SENT' && (
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

export default InvoiceDetailsModal; 
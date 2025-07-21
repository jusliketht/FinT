import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Text,
  Input,
  Select,
  IconButton,
  Alert,
  AlertIcon,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Grid,
  GridItem,
  VStack,
  HStack,
  useDisclosure
} from '@chakra-ui/react';
import { AddIcon, CloseIcon } from '@chakra-ui/icons';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const initialLine = { accountId: '', type: 'debit', amount: '' };
const accountTypes = [
  { value: 'Asset', label: 'Asset' },
  { value: 'Liability', label: 'Liability' },
  { value: 'Equity', label: 'Equity' },
  { value: 'Revenue', label: 'Revenue' },
  { value: 'Expense', label: 'Expense' },
];

const AddJournalEntry = () => {
  const [date, setDate] = useState('');
  const [description, setDescription] = useState('');
  const [lines, setLines] = useState([{ ...initialLine }]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [newAccount, setNewAccount] = useState({ name: '', type: '', code: '' });
  const [accountError, setAccountError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = () => {
    axios.get('/api/v1/accounts')
      .then(res => setAccounts(res.data.data || []))
      .catch(() => setAccounts([]));
  };

  const handleLineChange = (idx, field, value) => {
    const updated = lines.map((line, i) =>
      i === idx ? { ...line, [field]: value } : line
    );
    setLines(updated);
  };

  const addLine = () => setLines([...lines, { ...initialLine }]);
  const removeLine = (idx) => setLines(lines.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);
    try {
      const debitLine = lines.find(l => l.type === 'debit');
      const creditLine = lines.find(l => l.type === 'credit');
      if (!debitLine || !creditLine) {
        setError('Please provide both a debit and a credit line.');
        setLoading(false);
        return;
      }
      const payload = {
        date,
        description,
        debitAccountId: debitLine.accountId,
        creditAccountId: creditLine.accountId,
        amount: parseFloat(debitLine.amount || creditLine.amount),
      };
      await axios.post('/api/journal-entries', payload);
      setSuccess('Journal entry submitted!');
      setDate('');
      setDescription('');
      setLines([{ ...initialLine }]);
    } catch (err) {
      setError(err.response?.data?.message || 'Error submitting entry');
    }
    setLoading(false);
  };

  // Account Head Dialog Handlers
  const handleOpenDialog = () => {
    setNewAccount({ name: '', type: '', code: '' });
    setAccountError('');
    onOpen();
  };
  const handleCloseDialog = () => onClose();
  const handleAccountChange = (field, value) => setNewAccount(acc => ({ ...acc, [field]: value }));
  const handleAddAccount = async () => {
    setAccountError('');
    if (!newAccount.name || !newAccount.type || !newAccount.code) {
      setAccountError('All fields are required.');
      return;
    }
    try {
      await axios.post('/api/v1/accounts', newAccount);
      fetchAccounts();
      onClose();
    } catch (err) {
      setAccountError(err.response?.data?.message || 'Error adding account head');
    }
  };

  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box maxW="700px" mx="auto" mt={4} p={4}>
      <Button variant="outline" mb={2} onClick={() => navigate('/accounting/journal')}>
        Back to Journal
      </Button>
      <Text fontSize="xl" fontWeight="bold" mb={4}>
        Add Journal Entry
      </Text>
      {error && <Alert status="error" mb={2}><AlertIcon />{error}</Alert>}
      {success && <Alert status="success" mb={2}><AlertIcon />{success}</Alert>}
      <form onSubmit={handleSubmit}>
        <VStack spacing={4} align="stretch">
          <Input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            placeholder="Date"
            required
          />
          <Input
            value={description}
            onChange={e => setDescription(e.target.value)}
            placeholder="Description"
            required
          />
          <Text fontWeight="semibold">Lines</Text>
          {lines.map((line, idx) => (
            <Grid templateColumns="repeat(12, 1fr)" gap={2} key={idx} alignItems="center">
              <GridItem colSpan={5}>
                <HStack>
                  <Select
                    value={line.accountId}
                    onChange={e => handleLineChange(idx, 'accountId', e.target.value)}
                    placeholder="Select Account"
                    required
                  >
                    {accounts.map(acc => (
                      <option key={acc.id} value={acc.id}>{acc.name}</option>
                    ))}
                  </Select>
                  <IconButton
                    size="sm"
                    colorScheme="blue"
                    onClick={onOpen}
                    icon={<AddIcon />}
                    aria-label="Add account"
                  />
                </HStack>
              </GridItem>
              <GridItem colSpan={3}>
                <Select
                  value={line.type}
                  onChange={e => handleLineChange(idx, 'type', e.target.value)}
                  required
                >
                  <option value="debit">Debit</option>
                  <option value="credit">Credit</option>
                </Select>
              </GridItem>
              <GridItem colSpan={3}>
                <Input
                  type="number"
                  value={line.amount}
                  onChange={e => handleLineChange(idx, 'amount', e.target.value)}
                  placeholder="Amount"
                  required
                />
              </GridItem>
              <GridItem colSpan={1}>
                <IconButton
                  onClick={() => removeLine(idx)}
                  isDisabled={lines.length === 1}
                  icon={<CloseIcon />}
                  aria-label="Remove line"
                />
              </GridItem>
            </Grid>
          ))}
          <Button leftIcon={<AddIcon />} onClick={addLine} variant="outline">
            Add Line
          </Button>
          <Button type="submit" colorScheme="blue" isLoading={loading}>
            Submit Entry
          </Button>
        </VStack>
      </form>

      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Account Head</ModalHeader>
          <ModalBody>
            <VStack spacing={4}>
              <Input
                value={newAccount.name}
                onChange={e => handleAccountChange('name', e.target.value)}
                placeholder="Account Name"
                required
              />
              <Input
                value={newAccount.code}
                onChange={e => handleAccountChange('code', e.target.value)}
                placeholder="Account Code"
                required
              />
              <Select
                value={newAccount.type}
                onChange={e => handleAccountChange('type', e.target.value)}
                placeholder="Select Type"
                required
              >
                {accountTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </Select>
              {accountError && <Alert status="error"><AlertIcon />{accountError}</Alert>}
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddAccount}>
              Add
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default AddJournalEntry; 
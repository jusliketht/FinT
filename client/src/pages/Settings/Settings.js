import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  Text,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  useToast,
  Card,
  CardHeader,
  CardBody,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  IconButton,
  Tooltip,
  useColorModeValue,
  Code,
  Tag,
  HStack,
  Divider,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, TagIcon } from '@chakra-ui/icons';
import api from '../../services/api';

const Settings = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const toast = useToast();
  
  const [formData, setFormData] = useState({ pattern: '', category: '' });
  const [rules, setRules] = useState([]);
  const [loading, setLoading] = useState(false);
  const [formLoading, setFormLoading] = useState(false);
  const [editing, setEditing] = useState(null);
  const [error, setError] = useState(null);
  
  // Fetch rules on component mount
  useEffect(() => {
    fetchRules();
  }, []);
  
  const fetchRules = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/rules');
      setRules(response.data);
    } catch (error) {
      setError('Failed to fetch rules. Please try again.');
      console.error('Error fetching rules:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      setError(null);
      
      if (editing) {
        // Update rule
        await api.put(`/rules/${editing._id}`, formData);
        toast({
          title: 'Success',
          description: 'Rule updated successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      } else {
        // Create new rule
        await api.post('/rules', formData);
        toast({
          title: 'Success',
          description: 'Rule created successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
      }
      
      // Reset form and refresh rules
      setFormData({ pattern: '', category: '' });
      setEditing(null);
      fetchRules();
    } catch (error) {
      setError(error.response?.data?.message || 'Error saving rule');
      console.error('Error saving rule:', error);
    } finally {
      setFormLoading(false);
    }
  };
  
  const handleDelete = async (ruleId) => {
    if (window.confirm('Are you sure you want to delete this rule?')) {
      try {
        setLoading(true);
        setError(null);
        await api.delete(`/rules/${ruleId}`);
        toast({
          title: 'Success',
          description: 'Rule deleted successfully',
          status: 'success',
          duration: 3000,
          isClosable: true,
        });
        fetchRules();
      } catch (error) {
        setError('Failed to delete rule. Please try again.');
        console.error('Error deleting rule:', error);
      } finally {
        setLoading(false);
      }
    }
  };
  
  const handleEdit = (rule) => {
    setEditing(rule);
    setFormData({
      pattern: rule.pattern,
      category: rule.category
    });
  };
  
  const handleCancel = () => {
    setEditing(null);
    setFormData({ pattern: '', category: '' });
  };

  const cardBg = useColorModeValue('white', 'gray.700');
  const borderColor = useColorModeValue('gray.200', 'gray.600');
  
  return (
    <Box>
      <Heading size="lg" mb={6}>Settings</Heading>
      
      {error && (
        <Alert status="error" mb={6}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription display="block">
              {error}
            </AlertDescription>
          </Box>
        </Alert>
      )}
      
      <Card bg={cardBg} borderWidth="1px" borderColor={borderColor}>
        <CardHeader>
          <Heading size="md">Transaction Categorization Rules</Heading>
          <Text mt={2} color="gray.600">
            Create rules to automatically categorize transactions based on their descriptions.
            Use regular expressions to match transaction descriptions.
          </Text>
        </CardHeader>
        
        <CardBody>
          <VStack spacing={6} align="stretch">
            <form onSubmit={handleSubmit}>
              <Stack spacing={4} maxW="600px">
                <FormControl isRequired>
                  <FormLabel>Pattern (Regex)</FormLabel>
                  <Input
                    value={formData.pattern}
                    onChange={(e) => setFormData(prev => ({ ...prev, pattern: e.target.value }))}
                    placeholder="e.g. zomato|swiggy"
                    leftElement={<Box pl={2}><TagIcon /></Box>}
                  />
                </FormControl>
                
                <FormControl isRequired>
                  <FormLabel>Category</FormLabel>
                  <Input
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    placeholder="e.g. Food & Dining"
                  />
                </FormControl>
                
                <HStack>
                  <Button
                    type="submit"
                    colorScheme="blue"
                    isLoading={formLoading}
                    leftIcon={editing ? <EditIcon /> : <AddIcon />}
                  >
                    {editing ? 'Update Rule' : 'Add Rule'}
                  </Button>
                  
                  {editing && (
                    <Button onClick={handleCancel}>
                      Cancel
                    </Button>
                  )}
                </HStack>
              </Stack>
            </form>
            
            <Divider />
            
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>Pattern</Th>
                  <Th>Category</Th>
                  <Th>Created At</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {rules.map((rule) => (
                  <Tr key={rule._id}>
                    <Td><Code>{rule.pattern}</Code></Td>
                    <Td><Tag colorScheme="blue">{rule.category}</Tag></Td>
                    <Td>{new Date(rule.createdAt).toLocaleString()}</Td>
                    <Td>
                      <HStack spacing={2}>
                        <Tooltip label="Edit rule">
                          <IconButton
                            icon={<EditIcon />}
                            size="sm"
                            variant="ghost"
                            onClick={() => handleEdit(rule)}
                          />
                        </Tooltip>
                        <Tooltip label="Delete rule">
                          <IconButton
                            icon={<DeleteIcon />}
                            size="sm"
                            variant="ghost"
                            colorScheme="red"
                            onClick={() => handleDelete(rule._id)}
                          />
                        </Tooltip>
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </VStack>
        </CardBody>
      </Card>
    </Box>
  );
};

export default Settings; 
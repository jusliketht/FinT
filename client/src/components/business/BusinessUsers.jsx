import React, { useState, useEffect } from 'react';
import {
  Box,
  Button,
  Heading,
  Text,
  VStack,
  HStack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  Avatar,
  IconButton,
  useDisclosure,
  useToast,
  Spinner,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Select,
  Input
} from '@chakra-ui/react';
import { ArrowBackIcon, AddIcon, DeleteIcon } from '@chakra-ui/icons';
import businessService from '../../services/businessService';

const BusinessUsers = ({ business, onBack }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newUser, setNewUser] = useState({ userId: '', role: '' });
  const [availableUsers, setAvailableUsers] = useState([]);
  
  const { isOpen, onOpen, onClose } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    fetchUsers();
  }, [business]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await businessService.getUsers(business.id);
      setUsers(data);
    } catch (err) {
      setError('Failed to fetch users');
      toast({
        title: 'Error',
        description: 'Failed to load users',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.userId || !newUser.role) {
      toast({
        title: 'Error',
        description: 'Please select both user and role',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
      return;
    }

    try {
      await businessService.addUser(business.id, newUser);
      toast({
        title: 'Success',
        description: 'User added successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      setNewUser({ userId: '', role: '' });
      onClose();
      fetchUsers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to add user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const handleRemoveUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the business?')) {
      return;
    }

    try {
      await businessService.removeUser(business.id, userId);
      toast({
        title: 'Success',
        description: 'User removed successfully',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
      fetchUsers();
    } catch (err) {
      toast({
        title: 'Error',
        description: err.response?.data?.message || 'Failed to remove user',
        status: 'error',
        duration: 5000,
        isClosable: true,
      });
    }
  };

  const getRoleColor = (role) => {
    const colors = {
      ADMIN: 'red',
      BUSINESS_OWNER: 'purple',
      ACCOUNTANT: 'blue',
      VIEWER: 'gray'
    };
    return colors[role] || 'gray';
  };

  const getRoleLabel = (role) => {
    const labels = {
      ADMIN: 'Administrator',
      BUSINESS_OWNER: 'Business Owner',
      ACCOUNTANT: 'Accountant',
      VIEWER: 'Viewer'
    };
    return labels[role] || role;
  };

  if (loading) {
    return (
      <Box textAlign="center" py={8}>
        <Spinner size="xl" />
        <Text mt={4}>Loading users...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Alert status="error">
        <AlertIcon />
        <AlertTitle>Error!</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <Box>
      <HStack mb={6}>
        <IconButton
          icon={<ArrowBackIcon />}
          aria-label="Go back"
          variant="ghost"
          onClick={onBack}
        />
        <Heading size="lg">Team Members - {business.name}</Heading>
      </HStack>

      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Text fontSize="lg" fontWeight="medium">
            {users.length} team member{users.length !== 1 ? 's' : ''}
          </Text>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={onOpen}
          >
            Add Member
          </Button>
        </HStack>

        {users.length === 0 ? (
          <Box textAlign="center" py={8}>
            <Text color="gray.500" mb={4}>
              No team members yet
            </Text>
            <Button colorScheme="blue" onClick={onOpen}>
              Add First Member
            </Button>
          </Box>
        ) : (
          <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Role</Th>
                  <Th>Email</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {users.map((userBusiness) => (
                  <Tr key={userBusiness.User.id}>
                    <Td>
                      <HStack>
                        <Avatar
                          size="sm"
                          name={userBusiness.User.name}
                          src={userBusiness.User.avatar}
                        />
                        <Text fontWeight="medium">
                          {userBusiness.User.name}
                        </Text>
                      </HStack>
                    </Td>
                    <Td>
                      <Badge colorScheme={getRoleColor(userBusiness.role)}>
                        {getRoleLabel(userBusiness.role)}
                      </Badge>
                    </Td>
                    <Td>{userBusiness.User.email}</Td>
                    <Td>
                      <IconButton
                        icon={<DeleteIcon />}
                        aria-label="Remove user"
                        size="sm"
                        variant="ghost"
                        colorScheme="red"
                        onClick={() => handleRemoveUser(userBusiness.User.id)}
                        isDisabled={userBusiness.role === 'ADMIN'}
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}
      </VStack>

      {/* Add User Modal */}
      <Modal isOpen={isOpen} onClose={onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Add Team Member</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <VStack spacing={4}>
              <FormControl>
                <FormLabel>User Email</FormLabel>
                <Input
                  placeholder="Enter user email"
                  value={newUser.userId}
                  onChange={(e) => setNewUser(prev => ({ ...prev, userId: e.target.value }))}
                />
              </FormControl>

              <FormControl>
                <FormLabel>Role</FormLabel>
                <Select
                  placeholder="Select role"
                  value={newUser.role}
                  onChange={(e) => setNewUser(prev => ({ ...prev, role: e.target.value }))}
                >
                  <option value="VIEWER">Viewer</option>
                  <option value="ACCOUNTANT">Accountant</option>
                  <option value="ADMIN">Administrator</option>
                </Select>
              </FormControl>
            </VStack>
          </ModalBody>
          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Cancel
            </Button>
            <Button colorScheme="blue" onClick={handleAddUser}>
              Add User
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  );
};

export default BusinessUsers; 
import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Heading,
  Button,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Badge,
  IconButton,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  Spinner,
  Alert,
  AlertIcon,
  useToast,
  Input,
  InputGroup,
  InputLeftElement,
  Select,
  Avatar,
  AvatarGroup,
  Switch,
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, SearchIcon } from '@chakra-ui/icons';
import { useBusiness } from '../../contexts/BusinessContext';
import { useToast as useToastContext } from '../../contexts/ToastContext';
import businessService from '../../services/businessService';

const BusinessUsers = () => {
  const { selectedBusiness } = useBusiness();
  const { showToast } = useToastContext();
  const toast = useToast();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [isOpen, onOpen, onClose] = useDisclosure();

  const fetchUsers = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!selectedBusiness?.id) {
        setUsers([]);
        return;
      }

      const response = await businessService.getUsers(selectedBusiness.id);
      setUsers(response.data || response);
    } catch (err) {
      setError('Failed to fetch users');
      showToast('error', 'Failed to fetch users');
    } finally {
      setLoading(false);
    }
  }, [selectedBusiness?.id, showToast]);

  useEffect(() => {
    if (selectedBusiness) {
      fetchUsers();
    }
  }, [selectedBusiness, fetchUsers]);

  const handleAddUser = async (userData) => {
    try {
      const newUser = await businessService.addUser(selectedBusiness.id, userData);
      setUsers([...users, newUser]);
      setShowForm(false);
      setEditingUser(null);
      showToast('success', 'User added successfully');
    } catch (err) {
      showToast('error', 'Failed to add user');
    }
  };

  const handleUpdateUser = async (userId, userData) => {
    try {
      const updatedUser = await businessService.updateUser(selectedBusiness.id, userId, userData);
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      setShowForm(false);
      setEditingUser(null);
      showToast('success', 'User updated successfully');
    } catch (err) {
      showToast('error', 'Failed to update user');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the business?')) {
      return;
    }

    try {
      await businessService.removeUser(selectedBusiness.id, userId);
      setUsers(users.filter(user => user.id !== userId));
      showToast('success', 'User removed successfully');
    } catch (err) {
      showToast('error', 'Failed to remove user');
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updatedUser = await businessService.updateUserRole(selectedBusiness.id, userId, { role: newRole });
      setUsers(users.map(user => 
        user.id === userId ? updatedUser : user
      ));
      showToast('success', 'User role updated successfully');
    } catch (err) {
      showToast('error', 'Failed to update user role');
    }
  };

  const getRoleColor = (role) => {
    switch (role?.toLowerCase()) {
      case 'owner': return 'red';
      case 'admin': return 'orange';
      case 'manager': return 'blue';
      case 'user': return 'green';
      default: return 'gray';
    }
  };

  const getStatusColor = (isActive) => {
    return isActive ? 'green' : 'red';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = !roleFilter || user.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (!selectedBusiness) {
    return (
      <Box p={6}>
        <Alert status="info">
          <AlertIcon />
          Please select a business to manage users.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        {/* Header */}
        <HStack justify="space-between">
          <Box>
            <Heading size="lg">Business Users</Heading>
            <Text color="gray.600">Manage users and permissions for {selectedBusiness.name}</Text>
          </Box>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              setEditingUser(null);
              setShowForm(true);
              onOpen();
            }}
          >
            Add User
          </Button>
        </HStack>

        {/* Filters */}
        <HStack spacing={4}>
          <InputGroup maxW="300px">
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.300" />
            </InputLeftElement>
            <Input
              placeholder="Search users..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </InputGroup>
          
          <Select
            placeholder="Filter by role"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            maxW="200px"
          >
            <option value="OWNER">Owner</option>
            <option value="ADMIN">Admin</option>
            <option value="MANAGER">Manager</option>
            <option value="USER">User</option>
          </Select>
        </HStack>

        {/* Users Table */}
        {loading ? (
          <Box textAlign="center" py={10}>
            <Spinner size="xl" />
            <Text mt={4}>Loading users...</Text>
          </Box>
        ) : error ? (
          <Alert status="error">
            <AlertIcon />
            {error}
          </Alert>
        ) : (
          <Box overflowX="auto">
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>User</Th>
                  <Th>Email</Th>
                  <Th>Role</Th>
                  <Th>Status</Th>
                  <Th>Joined</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {filteredUsers.map((user) => (
                  <Tr key={user.id}>
                    <Td>
                      <HStack spacing={3}>
                        <Avatar size="sm" name={user.name} src={user.avatar} />
                        <VStack align="start" spacing={0}>
                          <Text fontWeight="medium">{user.name}</Text>
                          <Text fontSize="sm" color="gray.600">{user.phone}</Text>
                        </VStack>
                      </HStack>
                    </Td>
                    <Td>{user.email}</Td>
                    <Td>
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        size="sm"
                        maxW="120px"
                      >
                        <option value="OWNER">Owner</option>
                        <option value="ADMIN">Admin</option>
                        <option value="MANAGER">Manager</option>
                        <option value="USER">User</option>
                      </Select>
                    </Td>
                    <Td>
                      <Badge colorScheme={getStatusColor(user.isActive)}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </Td>
                    <Td>
                      <Text fontSize="sm">
                        {new Date(user.joinedAt || user.createdAt).toLocaleDateString()}
                      </Text>
                    </Td>
                    <Td>
                      <HStack spacing={2}>
                        <IconButton
                          size="sm"
                          icon={<EditIcon />}
                          aria-label="Edit user"
                          variant="ghost"
                          onClick={() => {
                            setEditingUser(user);
                            setShowForm(true);
                            onOpen();
                          }}
                        />
                        <IconButton
                          size="sm"
                          icon={<DeleteIcon />}
                          aria-label="Remove user"
                          variant="ghost"
                          colorScheme="red"
                          onClick={() => handleDeleteUser(user.id)}
                          isDisabled={user.role === 'OWNER'}
                        />
                      </HStack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        )}

        {/* User Form Modal */}
        {showForm && (
          <UserForm
            isOpen={isOpen}
            onClose={() => {
              onClose();
              setShowForm(false);
              setEditingUser(null);
            }}
            user={editingUser}
            onSubmit={editingUser ? handleUpdateUser : handleAddUser}
          />
        )}
      </VStack>
    </Box>
  );
};

// User Form Component
const UserForm = ({ isOpen, onClose, user, onSubmit }) => {
  const [formData, setFormData] = useState({
    email: '',
    role: 'USER',
    permissions: []
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        email: user.email || '',
        role: user.role || 'USER',
        permissions: user.permissions || []
      });
    } else {
      setFormData({
        email: '',
        role: 'USER',
        permissions: []
      });
    }
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (user) {
        await onSubmit(user.id, formData);
      } else {
        await onSubmit(formData);
      }
      onClose();
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="lg">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>
          {user ? 'Edit User' : 'Add New User'}
        </ModalHeader>
        <ModalCloseButton />
        <ModalBody>
          <form onSubmit={handleSubmit}>
            <VStack spacing={4}>
              <Input
                placeholder="User Email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
              />
              
              <Select
                placeholder="Select Role"
                value={formData.role}
                onChange={(e) => setFormData({...formData, role: e.target.value})}
                required
              >
                <option value="USER">User</option>
                <option value="MANAGER">Manager</option>
                <option value="ADMIN">Admin</option>
              </Select>
              
              <HStack spacing={4} w="full">
                <Button
                  type="submit"
                  colorScheme="blue"
                  isLoading={loading}
                  loadingText="Saving..."
                  w="full"
                >
                  {user ? 'Update User' : 'Add User'}
                </Button>
                <Button onClick={onClose} w="full">
                  Cancel
                </Button>
              </HStack>
            </VStack>
          </form>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};

export default BusinessUsers; 
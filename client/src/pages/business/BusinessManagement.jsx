import React, { useState, useEffect } from 'react';
import {
  Box,
  Heading,
  Text,
  Button,
  Card,
  CardBody,
  VStack,
  HStack,
  Tag,
  Input,
  Textarea,
  Select,
  IconButton
} from '@chakra-ui/react';
import { AddIcon, EditIcon, DeleteIcon, ViewIcon } from '@chakra-ui/icons';
import businessService from '../../services/businessService';
import { useToast } from '../../contexts/ToastContext';

const BusinessManagement = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingBusiness, setEditingBusiness] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    description: '',
    address: '',
    phone: '',
    email: ''
  });
  const { showToast } = useToast();

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const fetchBusinesses = async () => {
    setLoading(true);
    try {
      const data = await businessService.getAll();
      setBusinesses(data);
    } catch (error) {
      showToast('Failed to fetch businesses', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      if (editingBusiness) {
        await businessService.update(editingBusiness.id, formData);
        showToast('Business updated successfully', 'success');
      } else {
        await businessService.create(formData);
        showToast('Business created successfully', 'success');
      }
      setModalOpen(false);
      setEditingBusiness(null);
      setFormData({ name: '', type: '', description: '', address: '', phone: '', email: '' });
      fetchBusinesses();
    } catch (error) {
      showToast('Failed to save business', 'error');
    }
  };

  const handleEdit = (business) => {
    setEditingBusiness(business);
    setFormData({
      name: business.name,
      type: business.type,
      description: business.description || '',
      address: business.address || '',
      phone: business.phone || '',
      email: business.email || ''
    });
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this business?')) {
      try {
        await businessService.delete(id);
        showToast('Business deleted successfully', 'success');
        fetchBusinesses();
      } catch (error) {
        showToast('Failed to delete business', 'error');
      }
    }
  };

  return (
    <Box p={6}>
      <VStack spacing={6} align="stretch">
        <HStack justify="space-between">
          <Heading size="lg">Business Management</Heading>
          <Button
            leftIcon={<AddIcon />}
            colorScheme="blue"
            onClick={() => {
              setEditingBusiness(null);
              setFormData({ name: '', type: '', description: '', address: '', phone: '', email: '' });
              setModalOpen(true);
            }}
          >
            Add Business
          </Button>
        </HStack>

        <VStack spacing={4} align="stretch">
          {businesses.map((business) => (
            <Card key={business.id}>
              <CardBody>
                <HStack justify="space-between">
                  <VStack align="start" spacing={2}>
                    <Heading size="md">{business.name}</Heading>
                    <Tag colorScheme="blue">{business.type}</Tag>
                    {business.description && (
                      <Text color="gray.600">{business.description}</Text>
                    )}
                    <VStack align="start" spacing={1}>
                      {business.address && <Text fontSize="sm">📍 {business.address}</Text>}
                      {business.phone && <Text fontSize="sm">�� {business.phone}</Text>}
                      {business.email && <Text fontSize="sm">✉️ {business.email}</Text>}
                    </VStack>
                  </VStack>
                  <HStack spacing={2}>
                    <IconButton
                      size="sm"
                      icon={<ViewIcon />}
                      aria-label="View business"
                      variant="ghost"
                    />
                    <IconButton
                      size="sm"
                      icon={<EditIcon />}
                      aria-label="Edit business"
                      variant="ghost"
                      onClick={() => handleEdit(business)}
                    />
                    <IconButton
                      size="sm"
                      icon={<DeleteIcon />}
                      aria-label="Delete business"
                      variant="ghost"
                      colorScheme="red"
                      onClick={() => handleDelete(business.id)}
                    />
                  </HStack>
                </HStack>
              </CardBody>
            </Card>
          ))}
        </VStack>
      </VStack>

      {modalOpen && (
        <Box position="fixed" top={0} left={0} w="100vw" h="100vh" bg="blackAlpha.600" display="flex" alignItems="center" justifyContent="center" zIndex={1000}>
          <Box bg="white" p={8} borderRadius="lg" minW="350px" boxShadow="lg">
            <Heading size="md" mb={4}>{editingBusiness ? 'Edit Business' : 'Add Business'}</Heading>
            <VStack spacing={4}>
              <Box>
                <Text fontWeight="medium" mb={2}>Business Name</Text>
                <Input
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Enter business name"
                />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Business Type</Text>
                <Select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  placeholder="Select business type"
                >
                  <option value="corporation">Corporation</option>
                  <option value="llc">LLC</option>
                  <option value="partnership">Partnership</option>
                  <option value="sole_proprietorship">Sole Proprietorship</option>
                </Select>
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Description</Text>
                <Textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Address</Text>
                <Input
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  placeholder="Enter address"
                />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Phone</Text>
                <Input
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="Enter phone number"
                />
              </Box>
              <Box>
                <Text fontWeight="medium" mb={2}>Email</Text>
                <Input
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="Enter email"
                />
              </Box>
            </VStack>
            <HStack mt={6} justify="flex-end">
              <Button variant="ghost" mr={3} onClick={() => setModalOpen(false)}>Cancel</Button>
              <Button colorScheme="blue" onClick={handleSubmit}>{editingBusiness ? 'Update' : 'Create'}</Button>
            </HStack>
          </Box>
        </Box>
      )}
    </Box>
  );
};

export default BusinessManagement;
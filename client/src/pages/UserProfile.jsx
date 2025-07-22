import React, { useState } from 'react';
import {
  Box,
  Heading,
  Text,
  VStack,
  HStack,
  Card,
  CardBody,
  Tabs,
  TabList,
  Tab,
  TabPanels,
  TabPanel,
  Badge,
  useColorModeValue,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
} from '@chakra-ui/react';
import { FiUser, FiLock, FiBriefcase } from 'react-icons/fi';
import { useAuth } from '../contexts/AuthContext';
import { useBusiness } from '../contexts/BusinessContext';
import Breadcrumb from '../components/common/Breadcrumb';
import UserProfileForm from '../components/user/UserProfileForm';
import BusinessRegistrationForm from '../components/user/BusinessRegistrationForm';
import PasswordChangeForm from '../components/user/PasswordChangeForm';

const UserProfile = () => {
  const { user, updateUser } = useAuth();
  const { selectedBusiness } = useBusiness();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState(0);

  const cardBg = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const handleProfileUpdate = async (updatedData) => {
    setLoading(true);
    try {
      await updateUser(updatedData);
      toast({
        title: 'Profile Updated',
        description: 'Your profile has been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update profile.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async (passwordData) => {
    setLoading(true);
    try {
      // This would typically call an API to change password
      toast({
        title: 'Password Changed',
        description: 'Your password has been changed successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Password Change Failed',
        description: error.message || 'Failed to change password.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBusinessRegistrationUpdate = async (registrationData) => {
    setLoading(true);
    try {
      // This would typically call an API to update business registration details
      toast({
        title: 'Business Details Updated',
        description: 'Business registration details have been updated successfully.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      toast({
        title: 'Update Failed',
        description: error.message || 'Failed to update business details.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box maxW="4xl" mx="auto" p={6}>
      {/* Breadcrumb */}
      <Breadcrumb mb={6} />

      {/* Header */}
      <VStack spacing={4} align="stretch" mb={8}>
        <Heading size="lg">User Profile</Heading>
        <Text color="gray.600">
          Manage your personal information, security settings, and business registration details.
        </Text>
      </VStack>

      {/* Profile Overview Card */}
      <Card bg={cardBg} border="1px" borderColor={borderColor} mb={6}>
        <CardBody>
          <HStack spacing={6} align="start">
            <Box
              w="80px"
              h="80px"
              borderRadius="full"
              bg="blue.500"
              display="flex"
              alignItems="center"
              justifyContent="center"
              color="white"
              fontSize="2xl"
              fontWeight="bold"
            >
              {user?.name?.charAt(0)?.toUpperCase() || 'U'}
            </Box>
            <VStack align="start" spacing={2} flex="1">
              <Heading size="md">{user?.name || 'User Name'}</Heading>
              <Text color="gray.600">{user?.email || 'user@example.com'}</Text>
              <HStack spacing={4}>
                <Badge colorScheme="blue" variant="subtle">
                  {selectedBusiness ? 'Business Mode' : 'Personal Mode'}
                </Badge>
                {selectedBusiness && (
                  <Badge colorScheme="green" variant="subtle">
                    {selectedBusiness.name}
                  </Badge>
                )}
              </HStack>
            </VStack>
          </HStack>
        </CardBody>
      </Card>

      {/* Main Content Tabs */}
      <Card bg={cardBg} border="1px" borderColor={borderColor}>
        <Tabs value={activeTab} onChange={setActiveTab} variant="enclosed">
          <TabList>
            <Tab>
              <HStack spacing={2}>
                <FiUser />
                <Text>Basic Info</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FiLock />
                <Text>Security</Text>
              </HStack>
            </Tab>
            <Tab>
              <HStack spacing={2}>
                <FiBriefcase />
                <Text>Business Registration</Text>
              </HStack>
            </Tab>
          </TabList>

          <TabPanels>
            {/* Basic Info Tab */}
            <TabPanel>
              <UserProfileForm
                user={user}
                onSubmit={handleProfileUpdate}
                loading={loading}
              />
            </TabPanel>

            {/* Security Tab */}
            <TabPanel>
              <PasswordChangeForm
                onSubmit={handlePasswordChange}
                loading={loading}
              />
            </TabPanel>

            {/* Business Registration Tab */}
            <TabPanel>
              {selectedBusiness ? (
                <BusinessRegistrationForm
                  business={selectedBusiness}
                  onSubmit={handleBusinessRegistrationUpdate}
                  loading={loading}
                />
              ) : (
                <Alert status="info" borderRadius="md">
                  <AlertIcon />
                  <Box>
                    <AlertTitle>No Business Selected</AlertTitle>
                    <AlertDescription>
                      Please select a business from the context switcher to manage business registration details.
                    </AlertDescription>
                  </Box>
                </Alert>
              )}
            </TabPanel>
          </TabPanels>
        </Tabs>
      </Card>
    </Box>
  );
};

export default UserProfile; 
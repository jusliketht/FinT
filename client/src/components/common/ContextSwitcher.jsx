import React from 'react';
import {
  Box,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  Text,
  Badge,
  HStack,
  VStack,
  Divider,
  useDisclosure,
  Icon,
  Avatar,
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FiUser, FiBriefcase, FiHome } from 'react-icons/fi';
import { useBusiness } from '../../contexts/BusinessContext';
import { useNavigate } from 'react-router-dom';

const ContextSwitcher = () => {
  const { 
    isPersonalMode, 
    selectedBusiness, 
    businesses, 
    switchToPersonalMode, 
    switchToBusinessMode,
    getCurrentContext 
  } = useBusiness();
  const navigate = useNavigate();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const currentContext = getCurrentContext();

  const handleSwitchToPersonal = () => {
    switchToPersonalMode();
    onClose();
    // Navigate to dashboard to refresh context
    navigate('/');
  };

  const handleSwitchToBusiness = (business) => {
    switchToBusinessMode(business);
    onClose();
    // Navigate to dashboard to refresh context
    navigate('/');
  };

  const getContextIcon = () => {
    if (isPersonalMode) {
      return FiUser;
    }
    return FiBriefcase;
  };

  const getContextColor = () => {
    if (isPersonalMode) {
      return 'blue';
    }
    return 'green';
  };

  return (
    <Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
      <MenuButton
        as={Button}
        rightIcon={<ChevronDownIcon />}
        leftIcon={<Icon as={getContextIcon()} />}
        variant="ghost"
        size="sm"
        colorScheme={getContextColor()}
        _hover={{ bg: `${getContextColor()}.100` }}
        _active={{ bg: `${getContextColor()}.200` }}
      >
        <VStack spacing={0} align="start">
          <Text fontSize="xs" color="gray.500">
            {isPersonalMode ? 'Personal' : 'Business'}
          </Text>
          <Text fontSize="sm" fontWeight="medium">
            {currentContext?.name || 'Select Context'}
          </Text>
        </VStack>
      </MenuButton>
      
      <MenuList>
        <Box px={3} py={2}>
          <Text fontSize="xs" fontWeight="bold" color="gray.500" textTransform="uppercase">
            Switch Context
          </Text>
        </Box>
        
        <Divider />
        
        {/* Personal Mode Option */}
        <MenuItem
          onClick={handleSwitchToPersonal}
          icon={<Icon as={FiUser} />}
          bg={isPersonalMode ? 'blue.50' : 'transparent'}
          color={isPersonalMode ? 'blue.700' : 'inherit'}
        >
          <VStack align="start" spacing={0}>
            <Text fontWeight="medium">Personal</Text>
            <Text fontSize="xs" color="gray.500">Personal finances</Text>
          </VStack>
        </MenuItem>
        
        {businesses.length > 0 && <Divider />}
        
        {/* Business Options */}
        {businesses.map((business) => (
          <MenuItem
            key={business.id}
            onClick={() => handleSwitchToBusiness(business)}
            icon={<Icon as={FiBriefcase} />}
            bg={selectedBusiness?.id === business.id ? 'green.50' : 'transparent'}
            color={selectedBusiness?.id === business.id ? 'green.700' : 'inherit'}
          >
            <VStack align="start" spacing={0}>
              <Text fontWeight="medium">{business.name}</Text>
              <Text fontSize="xs" color="gray.500">{business.type}</Text>
            </VStack>
            {business.isDefault && (
              <Badge size="sm" colorScheme="green" ml="auto">
                Default
              </Badge>
            )}
          </MenuItem>
        ))}
        
        {businesses.length === 0 && (
          <>
            <Divider />
            <MenuItem
              onClick={() => navigate('/businesses')}
              icon={<Icon as={FiBriefcase} />}
            >
              <VStack align="start" spacing={0}>
                <Text fontWeight="medium">Add Business</Text>
                <Text fontSize="xs" color="gray.500">Create or join a business</Text>
              </VStack>
            </MenuItem>
          </>
        )}
      </MenuList>
    </Menu>
  );
};

export default ContextSwitcher; 
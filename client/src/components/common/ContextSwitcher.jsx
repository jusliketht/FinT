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
  useDisclosure
} from '@chakra-ui/react';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { FiUser, FiBriefcase } from 'react-icons/fi';
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

  return (
    <Box>
      <Menu isOpen={isOpen} onOpen={onOpen} onClose={onClose}>
        <MenuButton
          as={Button}
          rightIcon={<ChevronDownIcon />}
          variant="outline"
          size="sm"
          minW="200px"
          justifyContent="space-between"
        >
          <HStack spacing={2}>
            {isPersonalMode ? (
              <FiUser color="blue.500" />
            ) : (
              <FiBriefcase color="green.500" />
            )}
            <VStack spacing={0} align="start">
              <Text fontSize="sm" fontWeight="medium">
                {currentContext.name}
              </Text>
              <Badge 
                size="sm" 
                colorScheme={isPersonalMode ? "blue" : "green"}
                variant="subtle"
              >
                {isPersonalMode ? "Personal" : "Business"}
              </Badge>
            </VStack>
          </HStack>
        </MenuButton>
        
        <MenuList>
          <Box px={3} py={2}>
            <Text fontSize="sm" fontWeight="medium" color="gray.600">
              Switch Context
            </Text>
          </Box>
          
          <Divider />
          
          <MenuItem 
            onClick={handleSwitchToPersonal}
            icon={<FiUser />}
            isDisabled={isPersonalMode}
          >
            <VStack align="start" spacing={0}>
              <Text>Personal</Text>
              <Text fontSize="xs" color="gray.500">
                Personal financial management
              </Text>
            </VStack>
          </MenuItem>
          
          {businesses.length > 0 && (
            <>
              <Divider />
              <Box px={3} py={1}>
                <Text fontSize="xs" color="gray.500" fontWeight="medium">
                  BUSINESSES
                </Text>
              </Box>
              
              {businesses.map((business) => (
                <MenuItem
                  key={business.id}
                  onClick={() => handleSwitchToBusiness(business)}
                  icon={<FiBriefcase />}
                  isDisabled={!isPersonalMode && selectedBusiness?.id === business.id}
                >
                  <VStack align="start" spacing={0}>
                    <Text>{business.name}</Text>
                    <Text fontSize="xs" color="gray.500">
                      {business.type}
                    </Text>
                  </VStack>
                </MenuItem>
              ))}
            </>
          )}
          
          <Divider />
          
          <MenuItem 
            onClick={() => navigate('/business')}
            fontSize="sm"
            color="blue.600"
          >
            Manage Businesses
          </MenuItem>
        </MenuList>
      </Menu>
    </Box>
  );
};

export default ContextSwitcher; 
import React from 'react';
import {
  Box,
  HStack,
  VStack,
  Text,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  IconButton,
  useColorModeValue,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  useToast,
} from '@chakra-ui/react';
import { 
  SearchIcon,
  ChevronDownIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import { FiUser, FiLogOut } from 'react-icons/fi';
import ContextSwitcher from '../common/ContextSwitcher';
import NotificationBell from '../common/NotificationBell';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const Topbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const bgColor = useColorModeValue('primary.900', 'gray.800');
  const textColor = useColorModeValue('white', 'gray.100');
  const hoverBg = useColorModeValue('primary.800', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputColor = useColorModeValue('gray.900', 'white');

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <Box
      as="header"
      h="64px"
      bg={bgColor}
      boxShadow="sm"
      position="sticky"
      top="0"
      zIndex="1000"
    >
      <Flex
        h="full"
        align="center"
        justify="space-between"
        px={6}
        maxW="7xl"
        mx="auto"
      >
        {/* Logo and App Name */}
        <Flex align="center">
          <Text
            fontSize="2xl"
            fontWeight="bold"
            color={textColor}
            fontFamily="heading"
          >
            FinT
          </Text>
        </Flex>

        {/* Search Bar - Center */}
        <Flex flex="1" justify="center" maxW="400px" mx={8}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search transactions, accounts..."
              bg={inputBg}
              color={inputColor}
              border="none"
              borderRadius="lg"
              _focus={{
                boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
              }}
            />
          </InputGroup>
        </Flex>

        {/* Context Switcher */}
        <Flex align="center" mr={4}>
          <ContextSwitcher />
        </Flex>

        {/* Right Side - Notifications and User Menu */}
        <HStack spacing={3} align="center">
          <NotificationBell />
          
          <Menu>
            <MenuButton
              as={IconButton}
              variant="ghost"
              color={textColor}
              _hover={{ bg: hoverBg }}
              _active={{ bg: hoverBg }}
              size="md"
            >
              <HStack spacing={2}>
                <Avatar size="sm" name={user?.name} bg="primary.600" />
                <VStack spacing={0} align="start" display={{ base: 'none', md: 'flex' }}>
                  <Text fontSize="sm" fontWeight="medium">
                    {user?.name || 'User'}
                  </Text>
                  <Text fontSize="xs" opacity={0.8}>
                    {user?.email}
                  </Text>
                </VStack>
                <ChevronDownIcon />
              </HStack>
            </MenuButton>
            <MenuList>
              <MenuItem icon={<FiUser />} onClick={() => navigate('/profile')}>
                Profile
              </MenuItem>
              <MenuItem icon={<SettingsIcon />} onClick={() => navigate('/settings')}>
                Settings
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                Sign Out
              </MenuItem>
            </MenuList>
          </Menu>
        </HStack>
      </Flex>
    </Box>
  );
};

export default Topbar; 
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
  Flex,
  InputGroup,
  InputLeftElement,
  Input,
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

        {/* Search Bar */}
        <Flex flex="1" maxW="400px" mx={8}>
          <InputGroup>
            <InputLeftElement pointerEvents="none">
              <SearchIcon color="gray.400" />
            </InputLeftElement>
            <Input
              placeholder="Search transactions, accounts..."
              bg={inputBg}
              color={inputColor}
              border="none"
              _placeholder={{ color: 'gray.400' }}
              _focus={{
                boxShadow: 'outline',
                bg: inputBg,
              }}
            />
          </InputGroup>
        </Flex>

        {/* Right Side Actions */}
        <Flex align="center" spacing={4}>
          <ContextSwitcher />
          <NotificationBell />
          
          {/* User Menu */}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<Avatar size="sm" name={user?.name || user?.email} />}
              variant="ghost"
              color={textColor}
              _hover={{ bg: hoverBg }}
              ml={2}
            />
            <MenuList>
              <MenuItem icon={<FiUser />} onClick={() => navigate('/profile')}>
                Profile
              </MenuItem>
              <MenuItem icon={<SettingsIcon />} onClick={() => navigate('/settings')}>
                Settings
              </MenuItem>
              <MenuDivider />
              <MenuItem icon={<FiLogOut />} onClick={handleLogout}>
                Logout
              </MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Topbar; 
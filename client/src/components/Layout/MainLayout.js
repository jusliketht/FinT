import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Flex,
  IconButton,
  VStack,
  HStack,
  Text,
  Button,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  ViewIcon,
  TimeIcon,
  SettingsIcon,
} from '@chakra-ui/icons';
import { logout } from '../../redux/slices/authSlice';

const drawerWidth = '240px';

const MainLayout = ({ children }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const menuItems = [
    { text: 'Dashboard', icon: ViewIcon, path: '/app/dashboard' },
    { text: 'Reports', icon: TimeIcon, path: '/app/reports' },
    { text: 'Settings', icon: SettingsIcon, path: '/app/settings' },
  ];

  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');

  const SidebarContent = () => (
    <VStack spacing={4} align="stretch" w="full">
      <Box p={4} borderBottomWidth="1px" borderColor={borderColor}>
        <Text fontSize="xl" fontWeight="bold" color="brand.500">
          FinT
        </Text>
      </Box>
      <VStack spacing={1} align="stretch" p={2}>
        {menuItems.map((item) => (
          <Button
            key={item.text}
            variant="ghost"
            justifyContent="flex-start"
            leftIcon={<item.icon />}
            onClick={() => navigate(item.path)}
            py={6}
            borderRadius="lg"
            w="full"
          >
            {item.text}
          </Button>
        ))}
      </VStack>
    </VStack>
  );

  return (
    <Box minH="100vh">
      {/* Desktop Sidebar */}
      <Box
        position="fixed"
        left={0}
        w={drawerWidth}
        h="full"
        bg={bgColor}
        borderRight="1px"
        borderColor={borderColor}
        display={{ base: 'none', md: 'block' }}
      >
        <SidebarContent />
      </Box>

      {/* Main Content */}
      <Box ml={{ base: 0, md: drawerWidth }}>
        {/* Header */}
        <Flex
          as="header"
          align="center"
          justify="space-between"
          w="full"
          px={4}
          py={4}
          bg={bgColor}
          borderBottom="1px"
          borderColor={borderColor}
          position="fixed"
          top={0}
          zIndex={2}
        >
          {/* Mobile Menu */}
          <Menu>
            <MenuButton
              as={IconButton}
              icon={<HamburgerIcon />}
              variant="ghost"
              aria-label="Open menu"
              display={{ base: 'flex', md: 'none' }}
            />
            <MenuList>
              {menuItems.map((item) => (
                <MenuItem
                  key={item.text}
                  icon={<item.icon />}
                  onClick={() => navigate(item.path)}
                >
                  {item.text}
                </MenuItem>
              ))}
            </MenuList>
          </Menu>

          <HStack spacing={4} display={{ base: 'none', md: 'flex' }}>
            <Text fontSize="lg" fontWeight="bold" color="brand.500">
              FinT
            </Text>
          </HStack>

          {user && (
            <HStack spacing={4}>
              <Text>Welcome, {user.name}</Text>
              <Button variant="ghost" onClick={handleLogout}>
                Logout
              </Button>
            </HStack>
          )}
        </Flex>

        {/* Page Content */}
        <Box
          as="main"
          p={8}
          mt="72px"
          minH="calc(100vh - 72px)"
          bg={useColorModeValue('gray.50', 'gray.900')}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout; 
import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Box,
  VStack,
  Text,
  Flex,
  Icon,
  useColorModeValue,
  useDisclosure,
  IconButton,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Tooltip,
  Divider,
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  ViewIcon,
  SettingsIcon,
  InfoIcon,
  RepeatIcon,
  EditIcon,
  CheckCircleIcon,
  TimeIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
} from '@chakra-ui/icons';
import { 
  FiPackage, 
  FiBarChart2, 
  FiLink, 
  FiPercent, 
  FiDollarSign,
  FiFileText,
  FiUsers,
  FiHome,
  FiTrendingUp,
  FiShield,
} from 'react-icons/fi';

const navLinks = [
  // Main Navigation
  { 
    section: 'Main', 
    items: [
      { label: 'Dashboard', to: '/', icon: FiHome },
    ]
  },
  // Financial Management
  { 
    section: 'Financial Management', 
    items: [
      { label: 'Journal Entries', to: '/journal', icon: EditIcon },
      { label: 'Transactions', to: '/transactions', icon: RepeatIcon },
      { label: 'Bank Reconciliation', to: '/bank-statements', icon: CheckCircleIcon },
      { label: 'Chart of Accounts', to: '/accounts', icon: ViewIcon },
    ]
  },
  // Business Operations
  { 
    section: 'Business Operations', 
    items: [
      { label: 'Invoices', to: '/invoices', icon: FiFileText },
      { label: 'Business', to: '/business', icon: FiUsers },
    ]
  },
  // Analytics & Reports
  { 
    section: 'Analytics & Reports', 
    items: [
      { label: 'Reports', to: '/reports', icon: FiTrendingUp },
    ]
  },
  // System
  { 
    section: 'System', 
    items: [
      { label: 'Settings', to: '/settings', icon: SettingsIcon },
      { label: 'Profile', to: '/profile', icon: InfoIcon },
    ]
  },
];

const Sidebar = () => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const bgColor = 'primary.900'; // Dark navy blue
  const textColor = 'white';
  const activeBg = 'primary.800';
  const hoverBg = 'primary.700';

  const isActive = (to) => 
    to === '/' ? location.pathname === '/' : location.pathname.startsWith(to);

  const NavItem = ({ link }) => {
    const isLinkActive = isActive(link.to);
    
    return (
      <Link to={link.to}>
        <Flex
          align="center"
          px={4}
          py={3}
          borderRadius="md"
          cursor="pointer"
          transition="all 0.2s"
          bg={isLinkActive ? activeBg : 'transparent'}
          color={textColor}
          _hover={{
            bg: isLinkActive ? activeBg : hoverBg,
          }}
        >
          <Icon as={link.icon} boxSize={5} mr={isCollapsed ? 0 : 3} />
          {!isCollapsed && (
            <Text fontSize="sm" fontWeight="medium">
              {link.label}
            </Text>
          )}
        </Flex>
      </Link>
    );
  };

  const SidebarContent = () => (
    <VStack spacing={2} align="stretch" w="full">
      {navLinks.map((section, sectionIndex) => (
        <Box key={sectionIndex}>
          {!isCollapsed && section.section !== 'Main' && (
            <Text
              fontSize="xs"
              fontWeight="bold"
              color="gray.400"
              px={4}
              py={2}
              textTransform="uppercase"
              letterSpacing="wider"
            >
              {section.section}
            </Text>
          )}
          <VStack spacing={1} align="stretch">
            {section.items.map((link) => (
              <Tooltip
                key={link.to}
                label={isCollapsed ? link.label : ''}
                placement="right"
                isDisabled={!isCollapsed}
              >
                <Box>
                  <NavItem link={link} />
                </Box>
              </Tooltip>
            ))}
          </VStack>
          {!isCollapsed && sectionIndex < navLinks.length - 1 && (
            <Divider borderColor="gray.700" my={2} />
          )}
        </Box>
      ))}
    </VStack>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        as="aside"
        w={{ base: 0, lg: isCollapsed ? '60px' : '240px' }}
        h="full"
        bg={bgColor}
        boxShadow="lg"
        display={{ base: 'none', lg: 'block' }}
        transition="width 0.3s ease"
        position="relative"
      >
        <Box p={isCollapsed ? 3 : 6}>
          <Flex align="center" justify="space-between" mb={8}>
            {!isCollapsed && (
              <Text
                fontSize="xl"
                fontWeight="bold"
                color={textColor}
                fontFamily="heading"
              >
                FinT
              </Text>
            )}
            <IconButton
              aria-label="Toggle sidebar"
              icon={isCollapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
              size="sm"
              variant="ghost"
              color={textColor}
              onClick={() => setIsCollapsed(!isCollapsed)}
              _hover={{ bg: hoverBg }}
            />
          </Flex>
          <SidebarContent />
        </Box>
      </Box>

      {/* Mobile Menu Button */}
      <IconButton
        aria-label="Open menu"
        icon={<HamburgerIcon />}
        onClick={onOpen}
        display={{ base: 'flex', lg: 'none' }}
        position="fixed"
        top="72px"
        left={4}
        zIndex="1001"
        size="md"
      />

      {/* Mobile Drawer */}
      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader bg={bgColor} color={textColor}>
            FinT
          </DrawerHeader>
          <DrawerBody p={0} bg={bgColor}>
            <Box p={6}>
              <SidebarContent />
            </Box>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </>
  );
};

export default Sidebar; 
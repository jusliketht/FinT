import React from 'react';
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
} from '@chakra-ui/react';
import {
  HamburgerIcon,
  ViewIcon,
  SettingsIcon,
  InfoIcon,
  RepeatIcon,
  EditIcon,
  CopyIcon,
  StarIcon,
  DownloadIcon,
  ExternalLinkIcon,
  PhoneIcon,
  EmailIcon,
  ChatIcon,
  CalendarIcon,
} from '@chakra-ui/icons';

const navLinks = [
  { label: 'Dashboard', to: '/', icon: ViewIcon },
  { label: 'Journal Entries', to: '/journal', icon: EditIcon },
  { label: 'Transactions', to: '/transactions', icon: RepeatIcon },
  { label: 'Reports', to: '/reports', icon: ViewIcon },
  { label: 'Invoices', to: '/invoices', icon: EmailIcon },
  { label: 'Business', to: '/businesses', icon: InfoIcon },
];

const Sidebar = () => {
  const location = useLocation();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
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
          <Icon as={link.icon} boxSize={5} mr={3} />
          <Text fontSize="sm" fontWeight="medium">
            {link.label}
          </Text>
        </Flex>
      </Link>
    );
  };

  const SidebarContent = () => (
    <VStack spacing={2} align="stretch" w="full">
      {navLinks.map((link) => (
        <NavItem key={link.to} link={link} />
      ))}
    </VStack>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <Box
        as="aside"
        w={{ base: 0, lg: '240px' }}
        h="full"
        bg={bgColor}
        boxShadow="lg"
        display={{ base: 'none', lg: 'block' }}
      >
        <Box p={6}>
          <Text
            fontSize="xl"
            fontWeight="bold"
            color={textColor}
            mb={8}
            fontFamily="heading"
          >
            FinT
          </Text>
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
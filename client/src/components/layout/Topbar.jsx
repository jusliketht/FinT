import React from 'react';
import {
  Box,
  Flex,
  Text,
  Input,
  InputGroup,
  InputLeftElement,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  useColorModeValue,
} from '@chakra-ui/react';
import { 
  SearchIcon,
  ChevronDownIcon 
} from '@chakra-ui/icons';

const Topbar = () => {
  const bgColor = useColorModeValue('primary.900', 'gray.800');
  const textColor = useColorModeValue('white', 'gray.100');
  const hoverBg = useColorModeValue('primary.800', 'gray.700');
  const inputBg = useColorModeValue('white', 'gray.700');
  const inputColor = useColorModeValue('gray.900', 'white');

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

        {/* Right Side - User Menu */}
        <Flex align="center">
          <Menu>
            <MenuButton
              as={IconButton}
              variant="ghost"
              color={textColor}
              _hover={{ bg: hoverBg }}
              _active={{ bg: hoverBg }}
              icon={<ChevronDownIcon />}
              size="md"
            />
            <MenuList>
              <MenuItem>Profile</MenuItem>
              <MenuItem>Settings</MenuItem>
              <MenuItem>Sign Out</MenuItem>
            </MenuList>
          </Menu>
        </Flex>
      </Flex>
    </Box>
  );
};

export default Topbar; 
import React from 'react';
import { Box, Flex, useColorModeValue } from '@chakra-ui/react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';

const MainLayout = ({ children }) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900');
  
  return (
    <Flex direction="column" minH="100vh" bg={bgColor}>
      <Topbar />
      <Flex flex="1">
        <Sidebar />
        <Box
          as="main"
          flex="1"
          p={{ base: 4, md: 6 }}
          overflow="auto"
          bg={bgColor}
        >
          <Box maxW="7xl" mx="auto" h="full">
            {children}
          </Box>
        </Box>
      </Flex>
    </Flex>
  );
};

export default MainLayout; 
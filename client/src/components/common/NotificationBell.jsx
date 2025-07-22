import React, { useState } from 'react';
import {
  Box,
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
  HStack,
  Text,
  Badge,
  Divider,
  useColorModeValue,
  useDisclosure,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { FiCheckCircle, FiAlertCircle, FiInfo } from 'react-icons/fi';

const NotificationBell = () => {
  const [notifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'Transaction Posted',
      message: 'Journal entry #JE-001 has been successfully posted.',
      time: '2 minutes ago',
      read: false,
    },
    {
      id: 2,
      type: 'warning',
      title: 'Reconciliation Due',
      message: 'Bank reconciliation is due for SBI Account.',
      time: '1 hour ago',
      read: false,
    },
    {
      id: 3,
      type: 'info',
      title: 'System Update',
      message: 'New features have been added to the dashboard.',
      time: '2 hours ago',
      read: true,
    },
  ]);

  const { isOpen, onToggle, onClose } = useDisclosure();
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  const textColor = useColorModeValue('gray.600', 'gray.400');

  const unreadCount = notifications.filter(n => !n.read).length;

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success':
        return FiCheckCircle;
      case 'warning':
        return FiAlertCircle;
      case 'info':
        return FiInfo;
      default:
        return FiInfo;
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success':
        return 'green';
      case 'warning':
        return 'orange';
      case 'info':
        return 'blue';
      default:
        return 'gray';
    }
  };

  const NotificationItem = ({ notification }) => {
    const icon = getNotificationIcon(notification.type);
    const color = getNotificationColor(notification.type);

    return (
      <Box
        p={4}
        borderBottom="1px"
        borderColor={borderColor}
        bg={!notification.read ? `${color}.50` : 'transparent'}
        _hover={{ bg: useColorModeValue('gray.50', 'gray.700') }}
        cursor="pointer"
        transition="all 0.2s"
      >
        <HStack spacing={3} align="start">
          <Box
            p={2}
            borderRadius="full"
            bg={`${color}.100`}
            color={`${color}.600`}
            flexShrink={0}
          >
            <Box as={icon} boxSize={4} />
          </Box>
          
          <VStack align="start" spacing={1} flex="1">
            <Text fontSize="sm" fontWeight="medium">
              {notification.title}
            </Text>
            <Text fontSize="xs" color={textColor} lineHeight="1.4">
              {notification.message}
            </Text>
            <Text fontSize="xs" color={textColor}>
              {notification.time}
            </Text>
          </VStack>
          
          {!notification.read && (
            <Box
              w={2}
              h={2}
              borderRadius="full"
              bg={`${color}.500`}
              flexShrink={0}
            />
          )}
        </HStack>
      </Box>
    );
  };

  return (
    <Popover isOpen={isOpen} onClose={onClose} placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            aria-label="Notifications"
            icon={<BellIcon />}
            variant="ghost"
            size="md"
            onClick={onToggle}
            color={useColorModeValue('white', 'gray.100')}
            _hover={{ bg: useColorModeValue('primary.800', 'gray.700') }}
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              fontSize="xs"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      
      <PopoverContent
        bg={bgColor}
        borderColor={borderColor}
        boxShadow="xl"
        w="400px"
        maxH="500px"
        overflow="hidden"
      >
        <PopoverBody p={0}>
          <Box p={4} borderBottom="1px" borderColor={borderColor}>
            <HStack justify="space-between">
              <Text fontSize="lg" fontWeight="bold">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Badge colorScheme="red" variant="subtle">
                  {unreadCount} new
                </Badge>
              )}
            </HStack>
          </Box>
          
          <VStack spacing={0} align="stretch" maxH="400px" overflow="auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <NotificationItem key={notification.id} notification={notification} />
              ))
            ) : (
              <Box p={6} textAlign="center">
                <Text color={textColor} fontSize="sm">
                  No notifications
                </Text>
              </Box>
            )}
          </VStack>
          
          {notifications.length > 0 && (
            <Box p={3} borderTop="1px" borderColor={borderColor}>
              <Text
                fontSize="sm"
                color="blue.600"
                textAlign="center"
                cursor="pointer"
                _hover={{ color: 'blue.700' }}
              >
                Mark all as read
              </Text>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell; 
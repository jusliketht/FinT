import React, { useState, useEffect, useCallback } from 'react';
import {
  IconButton,
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  VStack,
  HStack,
  Text,
  Badge,
  Box,
  Divider,
  Button,
  useDisclosure,
  Spinner,
  Alert,
  AlertIcon,
} from '@chakra-ui/react';
import { BellIcon } from '@chakra-ui/icons';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../contexts/ToastContext';
import notificationService from '../../services/notificationService';

const NotificationBell = () => {
  const { user } = useAuth();
  const { showToast } = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();
  
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      if (!user?.id) {
        setNotifications([]);
        setUnreadCount(0);
        return;
      }

      const response = await notificationService.getNotifications();
      const notificationsData = response.data || response;
      
      setNotifications(notificationsData);
      setUnreadCount(notificationsData.filter(n => !n.isRead).length);
    } catch (err) {
      setError('Failed to fetch notifications');
      showToast('error', 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  }, [user?.id, showToast]);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user, fetchNotifications]);

  const handleMarkAsRead = async (notificationId) => {
    try {
      await notificationService.markAsRead(notificationId);
      
      setNotifications(notifications.map(notification => 
        notification.id === notificationId 
          ? { ...notification, isRead: true }
          : notification
      ));
      
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (err) {
      showToast('error', 'Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationService.markAllAsRead();
      
      setNotifications(notifications.map(notification => ({
        ...notification,
        isRead: true
      })));
      
      setUnreadCount(0);
      showToast('success', 'All notifications marked as read');
    } catch (err) {
      showToast('error', 'Failed to mark all notifications as read');
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    try {
      await notificationService.deleteNotification(notificationId);
      
      const notification = notifications.find(n => n.id === notificationId);
      setNotifications(notifications.filter(n => n.id !== notificationId));
      
      if (!notification?.isRead) {
        setUnreadCount(prev => Math.max(0, prev - 1));
      }
      
      showToast('success', 'Notification deleted');
    } catch (err) {
      showToast('error', 'Failed to delete notification');
    }
  };

  const getNotificationIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'success': return '✅';
      case 'warning': return '⚠️';
      case 'error': return '❌';
      case 'info': return 'ℹ️';
      default: return '📢';
    }
  };

  const getNotificationColor = (type) => {
    switch (type?.toLowerCase()) {
      case 'success': return 'green';
      case 'warning': return 'orange';
      case 'error': return 'red';
      case 'info': return 'blue';
      default: return 'gray';
    }
  };

  const formatNotificationTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
    return `${Math.floor(diffInMinutes / 1440)}d ago`;
  };

  return (
    <Popover isOpen={isOpen} onOpen={onOpen} onClose={onClose} placement="bottom-end">
      <PopoverTrigger>
        <Box position="relative">
          <IconButton
            icon={<BellIcon />}
            variant="ghost"
            aria-label="Notifications"
            size="md"
          />
          {unreadCount > 0 && (
            <Badge
              position="absolute"
              top="-1"
              right="-1"
              colorScheme="red"
              borderRadius="full"
              minW="20px"
              h="20px"
              display="flex"
              alignItems="center"
              justifyContent="center"
              fontSize="xs"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Box>
      </PopoverTrigger>
      
      <PopoverContent w="400px" maxH="500px" overflow="hidden">
        <PopoverBody p={0}>
          <Box p={4} borderBottom="1px" borderColor="gray.200">
            <HStack justify="space-between">
              <Text fontWeight="bold" fontSize="lg">
                Notifications
              </Text>
              {unreadCount > 0 && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleMarkAllAsRead}
                >
                  Mark all as read
                </Button>
              )}
            </HStack>
          </Box>
          
          <Box maxH="400px" overflowY="auto">
            {loading ? (
              <Box p={4} textAlign="center">
                <Spinner size="sm" />
                <Text mt={2} fontSize="sm">Loading notifications...</Text>
              </Box>
            ) : error ? (
              <Alert status="error" m={4}>
                <AlertIcon />
                {error}
              </Alert>
            ) : notifications.length === 0 ? (
              <Box p={4} textAlign="center">
                <Text color="gray.500">No notifications</Text>
              </Box>
            ) : (
              <VStack spacing={0} align="stretch">
                {notifications.map((notification, index) => (
                  <Box key={notification.id}>
                    <Box
                      p={4}
                      bg={notification.isRead ? 'transparent' : 'blue.50'}
                      _hover={{ bg: 'gray.50' }}
                      cursor="pointer"
                      onClick={() => handleMarkAsRead(notification.id)}
                    >
                      <HStack spacing={3} align="start">
                        <Text fontSize="lg">
                          {getNotificationIcon(notification.type)}
                        </Text>
                        <VStack align="start" spacing={1} flex={1}>
                          <Text fontWeight="medium" fontSize="sm">
                            {notification.title}
                          </Text>
                          <Text fontSize="xs" color="gray.600">
                            {notification.message}
                          </Text>
                          <HStack spacing={2}>
                            <Text fontSize="xs" color="gray.500">
                              {formatNotificationTime(notification.createdAt)}
                            </Text>
                            <Badge
                              size="sm"
                              colorScheme={getNotificationColor(notification.type)}
                            >
                              {notification.type}
                            </Badge>
                          </HStack>
                        </VStack>
                        <Button
                          size="xs"
                          variant="ghost"
                          colorScheme="red"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteNotification(notification.id);
                          }}
                        >
                          ×
                        </Button>
                      </HStack>
                    </Box>
                    {index < notifications.length - 1 && <Divider />}
                  </Box>
                ))}
              </VStack>
            )}
          </Box>
          
          {notifications.length > 0 && (
            <Box p={4} borderTop="1px" borderColor="gray.200">
              <Button
                size="sm"
                variant="ghost"
                w="full"
                onClick={() => {
                  // Navigate to notifications page
                  window.location.href = '/notifications';
                }}
              >
                View all notifications
              </Button>
            </Box>
          )}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationBell; 
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Text,
  Button,
  Icon,
  Card,
  HStack
} from '@chakra-ui/react';
import { InfoOutlineIcon, SearchIcon, AddIcon, WarningIcon } from '@chakra-ui/icons';

const NoData = ({
  title = 'No Data Available',
  description,
  icon = 'inbox',
  action,
  actionText,
  actionIcon,
  secondaryAction,
  secondaryActionText,
  secondaryActionIcon,
  variant = 'default',
  sx
}) => {
  const titleColor = 'gray.800';
  const cardBg = 'gray.50';

  const getIcon = () => {
    switch (icon) {
      case 'search':
        return <Icon as={SearchIcon} boxSize={12} color="gray.400" />;
      case 'filter':
        return <Icon as={WarningIcon} boxSize={12} color="gray.400" />;
      case 'add':
        return <Icon as={AddIcon} boxSize={12} color="gray.400" />;
      case 'inbox':
      default:
        return <Icon as={InfoOutlineIcon} boxSize={12} color="gray.400" />;
    }
  };

  const getDefaultDescription = () => {
    switch (icon) {
      case 'search':
        return 'Try adjusting your search or filter criteria to find what you are looking for.';
      case 'filter':
        return 'No items match your current filter criteria. Try adjusting your filters.';
      case 'add':
        return 'Get started by adding your first item.';
      case 'inbox':
      default:
        return 'There are no items to display at this time.';
    }
  };

  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      textAlign="center"
      p={6}
      {...sx}
    >
      <Box color="gray.400" mb={4}>
        {getIcon()}
      </Box>

      <Text fontSize="xl" fontWeight="bold" mb={2} color={titleColor}>
        {title}
      </Text>

      <Text fontSize="md" color="gray.500" mb={6} maxW="400px">
        {description || getDefaultDescription()}
      </Text>

      <HStack spacing={4}>
        {action && (
          <Button colorScheme="blue" onClick={action} leftIcon={actionIcon}>
            {actionText}
          </Button>
        )}
        {secondaryAction && (
          <Button variant="outline" onClick={secondaryAction} leftIcon={secondaryActionIcon}>
            {secondaryActionText}
          </Button>
        )}
      </HStack>
    </Box>
  );

  if (variant === 'paper') {
    return (
      <Card bg={cardBg} borderRadius="md">
        {content}
      </Card>
    );
  }

  return content;
};

NoData.propTypes = {
  title: PropTypes.string,
  description: PropTypes.string,
  icon: PropTypes.oneOf(['inbox', 'search', 'filter', 'add']),
  action: PropTypes.func,
  actionText: PropTypes.string,
  actionIcon: PropTypes.node,
  secondaryAction: PropTypes.func,
  secondaryActionText: PropTypes.string,
  secondaryActionIcon: PropTypes.node,
  variant: PropTypes.oneOf(['default', 'paper']),
  sx: PropTypes.object
};

export default NoData; 
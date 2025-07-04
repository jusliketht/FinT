import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Alert,
  AlertTitle,
  AlertDescription,
  Button,
  Code,
  Card,
  HStack
} from '@chakra-ui/react';
import { RepeatIcon, ArrowBackIcon } from '@chakra-ui/icons';
import { useNavigate } from 'react-router-dom';

const ErrorMessage = ({
  title = 'Something Went Wrong',
  message,
  error,
  action,
  actionText,
  actionIcon,
  secondaryAction,
  secondaryActionText,
  secondaryActionIcon,
  showRefresh = true,
  showHome = true,
  showBack = true,
  variant = 'default',
  severity = 'error',
  sx
}) => {
  const navigate = useNavigate();

  const getDefaultMessage = () => {
    if (error?.response?.status === 404) return 'The requested resource was not found.';
    if (error?.response?.status === 403) return 'You do not have permission to access this resource.';
    if (error?.response?.status === 401) return 'Please sign in to access this resource.';
    if (error?.response?.status >= 500) return 'An unexpected error occurred on the server. Please try again later.';
    return 'An unexpected error occurred. Please try again.';
  };

  const handleRefresh = () => window.location.reload();
  const handleHome = () => navigate('/');
  const handleBack = () => navigate(-1);

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
      <Alert
        status={severity}
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        borderRadius="lg"
        p={6}
        mb={6}
        maxW="600px"
      >
        <AlertTitle mt={4} mb={1} fontSize="lg">
          {title}
        </AlertTitle>
        <AlertDescription>
          {message || getDefaultMessage()}
        </AlertDescription>
        {error?.message && (
          <Code
            p={2}
            mt={4}
            w="100%"
            borderRadius="md"
            whiteSpace="pre-wrap"
            wordBreak="break-word"
          >
            {error.message}
          </Code>
        )}
      </Alert>

      <HStack spacing={4} wrap="wrap" justify="center">
        {action && (
          <Button colorScheme="blue" onClick={action} leftIcon={actionIcon}>
            {actionText}
          </Button>
        )}
        {showRefresh && (
          <Button variant="outline" onClick={handleRefresh} leftIcon={<RepeatIcon />}>
            Refresh Page
          </Button>
        )}
        {showHome && (
          <Button variant="outline" onClick={handleHome}>
            Go to Home
          </Button>
        )}
        {showBack && (
          <Button variant="outline" onClick={handleBack} leftIcon={<ArrowBackIcon />}>
            Go Back
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
      <Card bg="gray.50" borderRadius="md">
        {content}
      </Card>
    );
  }

  return content;
};

ErrorMessage.propTypes = {
  title: PropTypes.string,
  message: PropTypes.string,
  error: PropTypes.shape({
    message: PropTypes.string,
    response: PropTypes.shape({
      status: PropTypes.number
    })
  }),
  action: PropTypes.func,
  actionText: PropTypes.string,
  actionIcon: PropTypes.node,
  secondaryAction: PropTypes.func,
  secondaryActionText: PropTypes.string,
  secondaryActionIcon: PropTypes.node,
  showRefresh: PropTypes.bool,
  showHome: PropTypes.bool,
  showBack: PropTypes.bool,
  variant: PropTypes.oneOf(['default', 'paper']),
  severity: PropTypes.oneOf(['error', 'warning', 'info', 'success']),
  sx: PropTypes.object
};

export default ErrorMessage;
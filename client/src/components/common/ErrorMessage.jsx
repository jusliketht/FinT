import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Paper,
  Alert,
  AlertTitle
} from '@mui/material';
import {
  Error as ErrorIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';
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
    if (error?.response?.status === 404) {
      return 'The requested resource was not found.';
    }
    if (error?.response?.status === 403) {
      return 'You do not have permission to access this resource.';
    }
    if (error?.response?.status === 401) {
      return 'Please sign in to access this resource.';
    }
    if (error?.response?.status >= 500) {
      return 'An unexpected error occurred on the server. Please try again later.';
    }
    return 'An unexpected error occurred. Please try again.';
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleHome = () => {
    navigate('/');
  };

  const handleBack = () => {
    navigate(-1);
  };

  const content = (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        p: 3,
        ...sx
      }}
    >
      <Box
        sx={{
          color: `${severity}.main`,
          mb: 2
        }}
      >
        <ErrorIcon sx={{ fontSize: 60 }} />
      </Box>

      <Alert
        severity={severity}
        sx={{
          mb: 3,
          maxWidth: 600,
          '& .MuiAlert-message': {
            width: '100%'
          }
        }}
      >
        <AlertTitle>{title}</AlertTitle>
        <Typography variant="body2">
          {message || getDefaultMessage()}
        </Typography>
        {error?.message && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              fontFamily: 'monospace',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word'
            }}
          >
            {error.message}
          </Typography>
        )}
      </Alert>

      <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
        {action && (
          <Button
            variant="contained"
            onClick={action}
            startIcon={actionIcon}
          >
            {actionText}
          </Button>
        )}

        {showRefresh && (
          <Button
            variant="outlined"
            onClick={handleRefresh}
            startIcon={<RefreshIcon />}
          >
            Refresh Page
          </Button>
        )}

        {showHome && (
          <Button
            variant="outlined"
            onClick={handleHome}
            startIcon={<HomeIcon />}
          >
            Go to Home
          </Button>
        )}

        {showBack && (
          <Button
            variant="outlined"
            onClick={handleBack}
            startIcon={<ArrowBackIcon />}
          >
            Go Back
          </Button>
        )}

        {secondaryAction && (
          <Button
            variant="outlined"
            onClick={secondaryAction}
            startIcon={secondaryActionIcon}
          >
            {secondaryActionText}
          </Button>
        )}
      </Box>
    </Box>
  );

  if (variant === 'paper') {
    return (
      <Paper
        elevation={0}
        sx={{
          bgcolor: 'background.default',
          borderRadius: 1
        }}
      >
        {content}
      </Paper>
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
  severity: PropTypes.oneOf(['error', 'warning', 'info']),
  sx: PropTypes.object
};

export default ErrorMessage; 
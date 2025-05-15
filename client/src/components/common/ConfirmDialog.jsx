import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  IconButton,
  Typography,
  Box
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  Help as HelpIcon
} from '@mui/icons-material';

const ConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  maxWidth = 'sm',
  fullWidth = true,
  confirmButtonProps,
  cancelButtonProps,
  hideCancelButton = false,
  hideCloseButton = false,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  loading = false,
  sx
}) => {
  const handleClose = (event, reason) => {
    if (reason === 'backdropClick' && disableBackdropClick) {
      return;
    }
    onClose();
  };

  const getIcon = () => {
    switch (type) {
      case 'error':
        return <ErrorIcon color="error" sx={{ fontSize: 40 }} />;
      case 'info':
        return <InfoIcon color="info" sx={{ fontSize: 40 }} />;
      case 'success':
        return <InfoIcon color="success" sx={{ fontSize: 40 }} />;
      case 'help':
        return <HelpIcon color="primary" sx={{ fontSize: 40 }} />;
      default:
        return <WarningIcon color="warning" sx={{ fontSize: 40 }} />;
    }
  };

  const getConfirmButtonColor = () => {
    switch (type) {
      case 'error':
        return 'error';
      case 'info':
        return 'info';
      case 'success':
        return 'success';
      case 'help':
        return 'primary';
      default:
        return 'warning';
    }
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      disableEscapeKeyDown={disableEscapeKeyDown}
      PaperProps={{
        sx: {
          minWidth: 320,
          ...sx
        }
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          {getIcon()}
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            {title}
          </Typography>
          {!hideCloseButton && (
            <IconButton
              aria-label="close"
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500]
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
      </DialogTitle>

      <DialogContent>
        {typeof message === 'string' ? (
          <DialogContentText>{message}</DialogContentText>
        ) : (
          message
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        {!hideCancelButton && (
          <Button
            onClick={onClose}
            disabled={loading}
            {...cancelButtonProps}
          >
            {cancelText}
          </Button>
        )}
        <Button
          onClick={onConfirm}
          color={getConfirmButtonColor()}
          variant="contained"
          disabled={loading}
          {...confirmButtonProps}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  title: PropTypes.node.isRequired,
  message: PropTypes.node.isRequired,
  confirmText: PropTypes.string,
  cancelText: PropTypes.string,
  type: PropTypes.oneOf(['warning', 'error', 'info', 'success', 'help']),
  maxWidth: PropTypes.oneOf(['xs', 'sm', 'md', 'lg', 'xl']),
  fullWidth: PropTypes.bool,
  confirmButtonProps: PropTypes.object,
  cancelButtonProps: PropTypes.object,
  hideCancelButton: PropTypes.bool,
  hideCloseButton: PropTypes.bool,
  disableBackdropClick: PropTypes.bool,
  disableEscapeKeyDown: PropTypes.bool,
  loading: PropTypes.bool,
  sx: PropTypes.object
};

export default ConfirmDialog; 
import React from 'react';
import PropTypes from 'prop-types';
import { Chip, Box, Tooltip } from '@mui/material';
import {
  CheckCircle as CheckCircleIcon,
  Error as ErrorIcon,
  Warning as WarningIcon,
  Info as InfoIcon,
  Pending as PendingIcon,
  Block as BlockIcon,
  Schedule as ScheduleIcon,
  Cancel as CancelIcon,
  Done as DoneIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Archive as ArchiveIcon,
  Restore as RestoreIcon,
  Lock as LockIcon,
  LockOpen as LockOpenIcon
} from '@mui/icons-material';

const statusConfig = {
  // Success states
  success: {
    color: 'success',
    icon: CheckCircleIcon
  },
  completed: {
    color: 'success',
    icon: DoneIcon
  },
  active: {
    color: 'success',
    icon: CheckCircleIcon
  },
  approved: {
    color: 'success',
    icon: CheckCircleIcon
  },
  verified: {
    color: 'success',
    icon: CheckCircleIcon
  },

  // Error states
  error: {
    color: 'error',
    icon: ErrorIcon
  },
  failed: {
    color: 'error',
    icon: ErrorIcon
  },
  rejected: {
    color: 'error',
    icon: CancelIcon
  },
  invalid: {
    color: 'error',
    icon: BlockIcon
  },

  // Warning states
  warning: {
    color: 'warning',
    icon: WarningIcon
  },
  pending: {
    color: 'warning',
    icon: PendingIcon
  },
  processing: {
    color: 'warning',
    icon: ScheduleIcon
  },
  draft: {
    color: 'warning',
    icon: EditIcon
  },

  // Info states
  info: {
    color: 'info',
    icon: InfoIcon
  },
  new: {
    color: 'info',
    icon: InfoIcon
  },
  inProgress: {
    color: 'info',
    icon: ScheduleIcon
  },

  // Neutral states
  default: {
    color: 'default',
    icon: InfoIcon
  },
  deleted: {
    color: 'default',
    icon: DeleteIcon
  },
  archived: {
    color: 'default',
    icon: ArchiveIcon
  },
  restored: {
    color: 'default',
    icon: RestoreIcon
  },
  locked: {
    color: 'default',
    icon: LockIcon
  },
  unlocked: {
    color: 'default',
    icon: LockOpenIcon
  }
};

const StatusChip = ({
  status,
  label,
  size = 'small',
  variant = 'filled',
  showIcon = true,
  tooltip,
  onClick,
  onDelete,
  sx
}) => {
  const config = statusConfig[status.toLowerCase()] || statusConfig.default;
  const Icon = config.icon;

  const chip = (
    <Chip
      label={label || status}
      color={config.color}
      size={size}
      variant={variant}
      icon={showIcon ? <Icon /> : undefined}
      onClick={onClick}
      onDelete={onDelete}
      sx={{
        textTransform: 'capitalize',
        '& .MuiChip-icon': {
          color: 'inherit'
        },
        ...sx
      }}
    />
  );

  if (tooltip) {
    return (
      <Tooltip title={tooltip}>
        <Box component="span" sx={{ display: 'inline-block' }}>
          {chip}
        </Box>
      </Tooltip>
    );
  }

  return chip;
};

StatusChip.propTypes = {
  status: PropTypes.string.isRequired,
  label: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium']),
  variant: PropTypes.oneOf(['filled', 'outlined']),
  showIcon: PropTypes.bool,
  tooltip: PropTypes.string,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  sx: PropTypes.object
};

export default StatusChip; 
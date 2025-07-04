import React from 'react';
import PropTypes from 'prop-types';
import { Tag, Tooltip, Box, Icon } from '@chakra-ui/react';
import {
  CheckIcon,
  InfoOutlineIcon,
  TimeIcon,
  WarningIcon,
  CloseIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  ViewOffIcon
} from '@chakra-ui/icons';

const statusConfig = {
  // Success states
  success: { colorScheme: 'green', icon: CheckIcon },
  completed: { colorScheme: 'green', icon: CheckIcon },
  active: { colorScheme: 'green', icon: CheckIcon },
  approved: { colorScheme: 'green', icon: CheckIcon },
  verified: { colorScheme: 'green', icon: CheckIcon },
  done: { colorScheme: 'green', icon: CheckIcon },

  // Error states
  error: { colorScheme: 'red', icon: WarningIcon },
  failed: { colorScheme: 'red', icon: WarningIcon },
  rejected: { colorScheme: 'red', icon: CloseIcon },
  invalid: { colorScheme: 'red', icon: InfoOutlineIcon },

  // Warning states
  warning: { colorScheme: 'orange', icon: WarningIcon },
  pending: { colorScheme: 'orange', icon: TimeIcon },
  processing: { colorScheme: 'orange', icon: TimeIcon },
  draft: { colorScheme: 'orange', icon: EditIcon },

  // Info states
  info: { colorScheme: 'blue', icon: InfoOutlineIcon },
  new: { colorScheme: 'blue', icon: InfoOutlineIcon },
  inProgress: { colorScheme: 'blue', icon: TimeIcon },

  // Neutral states
  default: { colorScheme: 'gray', icon: InfoOutlineIcon },
  deleted: { colorScheme: 'gray', icon: DeleteIcon },
  archived: { colorScheme: 'gray', icon: ViewOffIcon },
  restored: { colorScheme: 'gray', icon: ViewIcon },
};

const StatusChip = ({
  status,
  label,
  size = 'md',
  variant = 'solid',
  showIcon = true,
  tooltip,
  onClick,
  onDelete,
  sx,
}) => {
  const config = statusConfig[status?.toLowerCase()] || statusConfig.default;
  const TagIcon = config.icon;

  const tag = (
    <Tag
      size={size}
      colorScheme={config.colorScheme}
      variant={variant}
      onClick={onClick}
      cursor={onClick ? 'pointer' : 'default'}
      sx={sx}
      textTransform="capitalize"
    >
      {showIcon && <Icon as={TagIcon} mr={label || status ? 2 : 0} />}
      {label || status}
      {onDelete && (
        <CloseIcon
          ml={2}
          boxSize={3}
          cursor="pointer"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
        />
      )}
    </Tag>
  );

  if (tooltip) {
    return (
      <Tooltip label={tooltip} hasArrow>
        <Box as="span" display="inline-block">
          {tag}
        </Box>
      </Tooltip>
    );
  }

  return tag;
};

StatusChip.propTypes = {
  status: PropTypes.string.isRequired,
  label: PropTypes.string,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
  variant: PropTypes.oneOf(['solid', 'subtle', 'outline']),
  showIcon: PropTypes.bool,
  tooltip: PropTypes.string,
  onClick: PropTypes.func,
  onDelete: PropTypes.func,
  sx: PropTypes.object,
};

export default StatusChip;
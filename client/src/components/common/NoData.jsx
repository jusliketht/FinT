import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Button,
  Paper
} from '@mui/material';
import {
  Inbox as InboxIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Add as AddIcon
} from '@mui/icons-material';

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
  const getIcon = () => {
    switch (icon) {
      case 'search':
        return <SearchIcon sx={{ fontSize: 60 }} />;
      case 'filter':
        return <FilterListIcon sx={{ fontSize: 60 }} />;
      case 'add':
        return <AddIcon sx={{ fontSize: 60 }} />;
      case 'inbox':
      default:
        return <InboxIcon sx={{ fontSize: 60 }} />;
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
          color: 'text.secondary',
          mb: 2
        }}
      >
        {getIcon()}
      </Box>

      <Typography
        variant="h6"
        color="text.primary"
        gutterBottom
      >
        {title}
      </Typography>

      <Typography
        variant="body2"
        color="text.secondary"
        sx={{ mb: 3, maxWidth: 400 }}
      >
        {description || getDefaultDescription()}
      </Typography>

      <Box sx={{ display: 'flex', gap: 2 }}>
        {action && (
          <Button
            variant="contained"
            onClick={action}
            startIcon={actionIcon}
          >
            {actionText}
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
import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  Breadcrumbs,
  Link,
  Button,
  IconButton,
  Tooltip,
  useTheme,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  NavigateNext as NavigateNextIcon,
  ArrowBack as ArrowBackIcon,
  Refresh as RefreshIcon,
  Add as AddIcon,
  MoreVert as MoreVertIcon
} from '@mui/icons-material';
import { useNavigate, useLocation } from 'react-router-dom';

const PageHeader = ({
  title,
  subtitle,
  breadcrumbs = [],
  actions = [],
  onBack,
  onRefresh,
  showBackButton = false,
  showRefreshButton = false,
  showDivider = true,
  maxWidth,
  sx
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const navigate = useNavigate();
  const location = useLocation();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const renderAction = (action, index) => {
    const {
      label,
      icon,
      onClick,
      color = 'primary',
      variant = 'contained',
      tooltip,
      disabled,
      showOnMobile = true
    } = action;

    if (!showOnMobile && isMobile) {
      return null;
    }

    const button = (
      <Button
        key={index}
        variant={variant}
        color={color}
        onClick={onClick}
        disabled={disabled}
        startIcon={icon}
        size="small"
      >
        {label}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip key={index} title={tooltip}>
          <span>{button}</span>
        </Tooltip>
      );
    }

    return button;
  };

  const renderMobileActions = () => {
    if (actions.length === 0) return null;

    return (
      <IconButton
        size="small"
        onClick={(event) => {
          // Handle mobile menu
          event.stopPropagation();
        }}
      >
        <MoreVertIcon />
      </IconButton>
    );
  };

  return (
    <Box
      sx={{
        mb: 3,
        maxWidth,
        ...sx
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: 2,
          flexWrap: 'wrap'
        }}
      >
        <Box sx={{ flex: 1, minWidth: 0 }}>
          {breadcrumbs.length > 0 && (
            <Breadcrumbs
              separator={<NavigateNextIcon fontSize="small" />}
              sx={{ mb: 1 }}
            >
              {breadcrumbs.map((crumb, index) => {
                const isLast = index === breadcrumbs.length - 1;
                const isCurrentPage = crumb.href === location.pathname;

                if (isLast || isCurrentPage) {
                  return (
                    <Typography
                      key={index}
                      color="text.secondary"
                      variant="body2"
                      sx={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {crumb.label}
                    </Typography>
                  );
                }

                return (
                  <Link
                    key={index}
                    color="inherit"
                    href={crumb.href}
                    onClick={(e) => {
                      e.preventDefault();
                      navigate(crumb.href);
                    }}
                    variant="body2"
                    sx={{
                      textDecoration: 'none',
                      '&:hover': {
                        textDecoration: 'underline'
                      }
                    }}
                  >
                    {crumb.label}
                  </Link>
                );
              })}
            </Breadcrumbs>
          )}

          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              flexWrap: 'wrap'
            }}
          >
            {(showBackButton || onBack) && (
              <Tooltip title="Go back">
                <IconButton
                  size="small"
                  onClick={handleBack}
                  sx={{ mr: 1 }}
                >
                  <ArrowBackIcon />
                </IconButton>
              </Tooltip>
            )}

            <Typography
              variant="h4"
              component="h1"
              sx={{
                flex: 1,
                minWidth: 0,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {title}
            </Typography>

            {showRefreshButton && (
              <Tooltip title="Refresh">
                <IconButton
                  size="small"
                  onClick={onRefresh}
                  sx={{ ml: 1 }}
                >
                  <RefreshIcon />
                </IconButton>
              </Tooltip>
            )}
          </Box>

          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{
                mt: 0.5,
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap'
              }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {!isMobile && actions.length > 0 && (
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              flexWrap: 'wrap',
              justifyContent: 'flex-end'
            }}
          >
            {actions.map(renderAction)}
          </Box>
        )}

        {isMobile && renderMobileActions()}
      </Box>

      {showDivider && <Divider sx={{ mt: 2 }} />}
    </Box>
  );
};

PageHeader.propTypes = {
  title: PropTypes.node.isRequired,
  subtitle: PropTypes.node,
  breadcrumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      href: PropTypes.string.isRequired
    })
  ),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      icon: PropTypes.node,
      onClick: PropTypes.func.isRequired,
      color: PropTypes.oneOf(['primary', 'secondary', 'error', 'info', 'success', 'warning']),
      variant: PropTypes.oneOf(['text', 'outlined', 'contained']),
      tooltip: PropTypes.string,
      disabled: PropTypes.bool,
      showOnMobile: PropTypes.bool
    })
  ),
  onBack: PropTypes.func,
  onRefresh: PropTypes.func,
  showBackButton: PropTypes.bool,
  showRefreshButton: PropTypes.bool,
  showDivider: PropTypes.bool,
  maxWidth: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  sx: PropTypes.object
};

export default PageHeader; 
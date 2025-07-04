import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Heading,
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Button,
  IconButton,
  Tooltip,
  HStack,
  useBreakpointValue,
  VStack
} from '@chakra-ui/react';
import { ChevronRightIcon, ArrowBackIcon, RepeatIcon, HamburgerIcon } from '@chakra-ui/icons';
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
  const isMobile = useBreakpointValue({ base: true, md: false });
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
      colorScheme = 'blue',
      variant = 'solid',
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
        colorScheme={colorScheme}
        onClick={onClick}
        isDisabled={disabled}
        leftIcon={icon}
        size="sm"
      >
        {label}
      </Button>
    );

    if (tooltip) {
      return (
        <Tooltip key={index} label={tooltip}>
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
        size="sm"
        icon={<HamburgerIcon />}
        onClick={(event) => {
          // Handle mobile menu
          event.stopPropagation();
        }}
        aria-label="More actions"
      />
    );
  };

  return (
    <Box {...sx}>
      <VStack spacing={4} align="stretch">
        <HStack justify="space-between" align="flex-start">
          <VStack align="flex-start" spacing={2}>
            {breadcrumbs.length > 0 && (
              <Breadcrumb separator={<ChevronRightIcon fontSize="sm" />} mb={1}>
                {breadcrumbs.map((crumb, index) => {
                  const isLast = index === breadcrumbs.length - 1;
                  const isCurrentPage = crumb.href === location.pathname;

                  if (isLast || isCurrentPage) {
                    return (
                      <BreadcrumbItem isCurrentPage key={index}>
                        <BreadcrumbLink as="span" color="gray.500" fontSize="sm" noOfLines={1}>
                          {crumb.label}
                        </BreadcrumbLink>
                      </BreadcrumbItem>
                    );
                  }

                  return (
                    <BreadcrumbItem key={index}>
                      <BreadcrumbLink
                        href={crumb.href}
                        onClick={e => {
                          e.preventDefault();
                          navigate(crumb.href);
                        }}
                        fontSize="sm"
                        _hover={{ textDecoration: 'underline' }}
                      >
                        {crumb.label}
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                  );
                })}
              </Breadcrumb>
            )}

            <Box display="flex" alignItems="center" gap={2} flexWrap="wrap">
              {(showBackButton || onBack) && (
                <Tooltip label="Go back">
                  <IconButton
                    size="sm"
                    icon={<ArrowBackIcon />}
                    onClick={handleBack}
                    mr={2}
                    aria-label="Go back"
                  />
                </Tooltip>
              )}

              <Heading as="h1" size="lg" flex={1} minW={0} noOfLines={1}>
                {title}
              </Heading>

              {showRefreshButton && (
                <Tooltip label="Refresh">
                  <IconButton
                    size="sm"
                    icon={<RepeatIcon />}
                    onClick={onRefresh}
                    aria-label="Refresh"
                  />
                </Tooltip>
              )}
            </Box>

            {subtitle && (
              <Text fontSize="md" color="gray.500" mt={1} noOfLines={1}>
                {subtitle}
              </Text>
            )}
          </VStack>

          {!isMobile && actions.length > 0 && (
            <HStack spacing={2} flexWrap="wrap" justify="flex-end">
              {actions.map(renderAction)}
            </HStack>
          )}

          {isMobile && renderMobileActions()}
        </HStack>

        {showDivider && <Box borderBottom="1px" borderColor="gray.200" mt={2} />}
      </VStack>
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
      colorScheme: PropTypes.string,
      variant: PropTypes.oneOf(['solid', 'outline', 'ghost', 'link']),
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
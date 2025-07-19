import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  HStack,
  Icon,
} from '@chakra-ui/react';
import { ChevronRightIcon, HomeIcon } from '@chakra-ui/icons';

const BreadcrumbComponent = ({ items = [] }) => {
  const location = useLocation();

  // Default breadcrumb mapping based on current path
  const getDefaultBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Dashboard', href: '/', icon: HomeIcon },
    ];

    pathSegments.forEach((segment, index) => {
      const path = '/' + pathSegments.slice(0, index + 1).join('/');
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

      breadcrumbs.push({
        label,
        href: path,
        isCurrentPage: index === pathSegments.length - 1,
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = items.length > 0 ? items : getDefaultBreadcrumbs();

  return (
    <Breadcrumb
      spacing="8px"
      separator={<ChevronRightIcon color="gray.500" />}
      fontSize="sm"
    >
      {breadcrumbItems.map((item, index) => (
        <BreadcrumbItem key={index} isCurrentPage={item.isCurrentPage}>
          {item.isCurrentPage ? (
            <Text color="gray.600" fontWeight="medium">
              {item.icon && <Icon as={item.icon} mr={2} />}
              {item.label}
            </Text>
          ) : (
            <BreadcrumbLink
              as={Link}
              to={item.href}
              color="blue.500"
              _hover={{ color: 'blue.600', textDecoration: 'underline' }}
            >
              {item.icon && <Icon as={item.icon} mr={2} />}
              {item.label}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
  );
};

// Specific breadcrumb configurations for different pages
export const DashboardBreadcrumb = () => (
  <BreadcrumbComponent
    items={[
      { label: 'Dashboard', href: '/', icon: HomeIcon, isCurrentPage: true },
    ]}
  />
);

export const TransactionsBreadcrumb = () => (
  <BreadcrumbComponent
    items={[
      { label: 'Dashboard', href: '/', icon: HomeIcon },
      { label: 'Transactions', href: '/transactions', isCurrentPage: true },
    ]}
  />
);

export const ReportsBreadcrumb = () => (
  <BreadcrumbComponent
    items={[
      { label: 'Dashboard', href: '/', icon: HomeIcon },
      { label: 'Reports', href: '/reports', isCurrentPage: true },
    ]}
  />
);

export const InvoicesBreadcrumb = () => (
  <BreadcrumbComponent
    items={[
      { label: 'Dashboard', href: '/', icon: HomeIcon },
      { label: 'Invoices', href: '/invoices', isCurrentPage: true },
    ]}
  />
);

export const BusinessBreadcrumb = () => (
  <BreadcrumbComponent
    items={[
      { label: 'Dashboard', href: '/', icon: HomeIcon },
      { label: 'Business Management', href: '/business', isCurrentPage: true },
    ]}
  />
);

export const AccountsBreadcrumb = () => (
  <BreadcrumbComponent
    items={[
      { label: 'Dashboard', href: '/', icon: HomeIcon },
      { label: 'Chart of Accounts', href: '/accounts', isCurrentPage: true },
    ]}
  />
);

export const SettingsBreadcrumb = () => (
  <BreadcrumbComponent
    items={[
      { label: 'Dashboard', href: '/', icon: HomeIcon },
      { label: 'Settings', href: '/settings', isCurrentPage: true },
    ]}
  />
);

export default BreadcrumbComponent; 
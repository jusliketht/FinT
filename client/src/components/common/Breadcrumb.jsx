import React from 'react';
import { useLocation } from 'react-router-dom';
import {
  Breadcrumb as ChakraBreadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Text,
  useColorModeValue,
} from '@chakra-ui/react';
import { ChevronRightIcon } from '@chakra-ui/icons';

const Breadcrumb = ({ items = [], separator = <ChevronRightIcon color="gray.500" /> }) => {
  const location = useLocation();
  const textColor = useColorModeValue('gray.600', 'gray.400');
  const linkColor = useColorModeValue('blue.600', 'blue.400');
  const hoverColor = useColorModeValue('blue.700', 'blue.300');

  // Generate breadcrumb items from current path if not provided
  const generateBreadcrumbs = () => {
    if (items.length > 0) return items;

    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [
      { label: 'Dashboard', href: '/' }
    ];

    let currentPath = '';
    pathSegments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      const label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      
      breadcrumbs.push({
        label,
        href: currentPath,
        isCurrentPage: index === pathSegments.length - 1
      });
    });

    return breadcrumbs;
  };

  const breadcrumbItems = generateBreadcrumbs();

  return (
    <ChakraBreadcrumb 
      spacing="8px" 
      separator={separator}
      fontSize="sm"
    >
      {breadcrumbItems.map((item, index) => (
        <BreadcrumbItem key={index} isCurrentPage={item.isCurrentPage}>
          {item.isCurrentPage ? (
            <Text color={textColor} fontWeight="medium">
              {item.label}
            </Text>
          ) : (
            <BreadcrumbLink 
              href={item.href}
              color={linkColor}
              _hover={{ color: hoverColor }}
            >
              {item.label}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      ))}
    </ChakraBreadcrumb>
  );
};

export default Breadcrumb; 
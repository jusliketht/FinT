import React from 'react';
import {
  Box,
  Text,
  IconButton,
  Tooltip,
  VStack,
  HStack,
  useBreakpointValue,
  Collapse,
  Icon,
} from '@chakra-ui/react';
import {
  ChevronDownIcon,
  ChevronRightIcon,
  EditIcon,
  DeleteIcon,
  ViewIcon,
  DollarIcon,
  TriangleUpIcon,
  TriangleDownIcon
} from '@chakra-ui/icons';

const getAccountIcon = (type) => {
  switch (type) {
    case 'Asset':
      return <ViewIcon fontSize="sm" />;
    case 'Liability':
      return <DollarIcon fontSize="sm" />;
    case 'Equity':
      return <DollarIcon fontSize="sm" />;
    case 'Revenue':
      return <TriangleUpIcon fontSize="sm" color="green.500" />;
    case 'Expense':
      return <TriangleDownIcon fontSize="sm" color="red.500" />;
    default:
      return null;
  }
};

const AccountTree = ({
  accounts,
  onEdit,
  onDelete,
  expanded,
  onNodeToggle,
  selected,
  onNodeSelect,
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const buildTree = (items, parent = null) => {
    return items
      .filter(item => item.parentAccount === parent)
      .map(item => ({
        ...item,
        children: buildTree(items, item._id)
      }));
  };

  const tree = buildTree(accounts);

  const renderTreeItems = (nodes, level = 0) => (
    <VStack align="stretch" spacing={0}>
      {nodes.map((node) => {
        const isExpanded = expanded.includes(node._id);
        const hasChildren = node.children.length > 0;
        
        return (
          <Box key={node._id}>
            <Box
              display="flex"
              alignItems="center"
              justifyContent="space-between"
              py={2}
              px={3}
              pl={level * 4 + 3}
              cursor="pointer"
              _hover={{ bg: 'gray.100', borderRadius: 'md' }}
              onClick={() => onNodeSelect(node._id)}
              bg={selected === node._id ? 'blue.50' : 'transparent'}
              borderRadius="md"
            >
              <HStack spacing={2} flex={1}>
                {hasChildren && (
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={isExpanded ? <ChevronDownIcon /> : <ChevronRightIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onNodeToggle(node._id);
                    }}
                    aria-label={isExpanded ? 'Collapse' : 'Expand'}
                  />
                )}
                {!hasChildren && <Box w={6} />}
                
                <Icon as={getAccountIcon(node.type)} color="gray.500" />
                
                <Box flex={1} minW={0}>
                  <Text
                    fontSize="sm"
                    fontWeight={node.isSubledger ? 'normal' : 'bold'}
                    color={!node.isActive ? 'gray.400' : 'inherit'}
                    noOfLines={1}
                  >
                    {node.code} - {node.name}
                  </Text>
                  {node.description && (
                    <Text
                      fontSize="xs"
                      color="gray.500"
                      display={isMobile ? 'none' : 'block'}
                      noOfLines={1}
                      maxW="300px"
                    >
                      {node.description}
                    </Text>
                  )}
                </Box>
              </HStack>
              
              <HStack spacing={1}>
                <Tooltip label="Edit Account">
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={<EditIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(node);
                    }}
                    aria-label="Edit account"
                  />
                </Tooltip>
                <Tooltip label="Delete Account">
                  <IconButton
                    size="xs"
                    variant="ghost"
                    icon={<DeleteIcon />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onDelete(node._id);
                    }}
                    aria-label="Delete account"
                    colorScheme="red"
                  />
                </Tooltip>
              </HStack>
            </Box>
            
            {hasChildren && (
              <Collapse in={isExpanded} animateOpacity>
                <Box pl={4}>
                  {renderTreeItems(node.children, level + 1)}
                </Box>
              </Collapse>
            )}
          </Box>
        );
      })}
    </VStack>
  );

  return (
    <Box
      flexGrow={1}
      maxW="100%"
      overflow="auto"
      borderWidth="1px"
      borderRadius="md"
      p={2}
    >
      {renderTreeItems(tree)}
    </Box>
  );
};

export default AccountTree; 
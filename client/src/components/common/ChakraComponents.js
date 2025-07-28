import {
  Box,
  Button,
  Input,
  Textarea,
  Select,
  FormControl,
  FormLabel,
  FormErrorMessage,
  FormHelperText,
  VStack,
  HStack,
  Text,
  Heading,
  Badge,
  Card,
  CardHeader,
  CardBody,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  ModalFooter,
  useDisclosure,
  useToast,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Spinner,
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Progress,
  Divider,
  IconButton,
  Tooltip,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  Avatar,
  AvatarGroup,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Accordion,
  AccordionItem,
  AccordionButton,
  AccordionPanel,
  AccordionIcon,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  SimpleGrid,
  Grid,
  GridItem,
  Flex,
  useColorModeValue,
  Switch,
  Radio,
  RadioGroup,
  Stack,
} from '@chakra-ui/react';

// Standardized Button Component
export const FintButton = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading = false,
  leftIcon,
  rightIcon,
  ...props 
}) => {
  const buttonVariants = {
    primary: {
      bg: 'primary.500',
      color: 'white',
      _hover: { bg: 'primary.600' },
      _active: { bg: 'primary.700' },
    },
    secondary: {
      bg: 'white',
      color: 'primary.500',
      border: '1px solid',
      borderColor: 'primary.500',
      _hover: { bg: 'primary.50' },
    },
    ghost: {
      bg: 'transparent',
      color: 'primary.500',
      _hover: { bg: 'primary.50' },
    },
    danger: {
      bg: 'error.500',
      color: 'white',
      _hover: { bg: 'error.600' },
    },
  };

  return (
    <Button
      variant="unstyled"
      size={size}
      isLoading={isLoading}
      leftIcon={leftIcon}
      rightIcon={rightIcon}
      borderRadius="md"
      fontWeight="medium"
      transition="all 0.2s"
      {...buttonVariants[variant]}
      {...props}
    >
      {children}
    </Button>
  );
};

// Standardized Card Component
export const FintCard = ({ 
  children, 
  title, 
  subtitle,
  headerAction,
  padding = 6,
  ...props 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  
  return (
    <Card
      bg={bgColor}
      borderRadius="lg"
      boxShadow="md"
      _hover={{ boxShadow: 'lg' }}
      transition="all 0.2s"
      {...props}
    >
      {(title || headerAction) && (
        <CardHeader pb={2}>
          <Flex justify="space-between" align="center">
            <Box>
              {title && <Heading size="md">{title}</Heading>}
              {subtitle && <Text color="gray.600" fontSize="sm">{subtitle}</Text>}
            </Box>
            {headerAction && headerAction}
          </Flex>
        </CardHeader>
      )}
      <CardBody p={padding}>
        {children}
      </CardBody>
    </Card>
  );
};

// Standardized Table Component
export const FintTable = ({ 
  columns, 
  data, 
  loading = false,
  emptyMessage = "No data available",
  onRowClick,
  ...props 
}) => {
  const bgColor = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('gray.200', 'gray.700');
  
  if (loading) {
    return (
      <Flex justify="center" align="center" py={10}>
        <Spinner size="lg" />
      </Flex>
    );
  }

  return (
    <Box overflow="auto">
      <Table variant="simple" {...props}>
        <Thead>
          <Tr>
            {columns.map((column, index) => (
              <Th
                key={index}
                bg="gray.50"
                fontWeight="semibold"
                textTransform="none"
                letterSpacing="normal"
                borderBottom="1px solid"
                borderColor={borderColor}
                px={4}
                py={3}
              >
                {column.header}
              </Th>
            ))}
          </Tr>
        </Thead>
        <Tbody>
          {data.length === 0 ? (
            <Tr>
              <Td colSpan={columns.length} textAlign="center" py={10}>
                <Text color="gray.500">{emptyMessage}</Text>
              </Td>
            </Tr>
          ) : (
            data.map((row, rowIndex) => (
              <Tr
                key={rowIndex}
                _hover={{ bg: 'gray.50' }}
                cursor={onRowClick ? 'pointer' : 'default'}
                onClick={() => onRowClick && onRowClick(row)}
              >
                {columns.map((column, colIndex) => (
                  <Td
                    key={colIndex}
                    borderBottom="1px solid"
                    borderColor="gray.100"
                    px={4}
                    py={3}
                  >
                    {column.render ? column.render(row[column.key], row) : row[column.key]}
                  </Td>
                ))}
              </Tr>
            ))
          )}
        </Tbody>
      </Table>
    </Box>
  );
};

// Standardized Badge Component
export const FintBadge = ({ 
  children, 
  variant = 'default',
  ...props 
}) => {
  const badgeVariants = {
    default: {
      bg: 'gray.100',
      color: 'gray.800',
    },
    success: {
      bg: 'success.50',
      color: 'success.700',
    },
    warning: {
      bg: 'warning.50',
      color: 'warning.700',
    },
    error: {
      bg: 'error.50',
      color: 'error.700',
    },
    info: {
      bg: 'info.50',
      color: 'info.700',
    },
  };

  return (
    <Badge
      variant="subtle"
      borderRadius="full"
      px={3}
      py={1}
      fontSize="xs"
      fontWeight="medium"
      {...badgeVariants[variant]}
      {...props}
    >
      {children}
    </Badge>
  );
};

// Standardized Modal Component
export const FintModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
  ...props 
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} size={size} {...props}>
      <ModalOverlay />
      <ModalContent borderRadius="lg">
        {title && <ModalHeader>{title}</ModalHeader>}
        <ModalCloseButton />
        <ModalBody pb={6}>
          {children}
        </ModalBody>
        {footer && <ModalFooter>{footer}</ModalFooter>}
      </ModalContent>
    </Modal>
  );
};

// Standardized Form Components
export const FintFormControl = ({ 
  label, 
  error, 
  helperText,
  isRequired = false,
  children,
  ...props 
}) => {
  return (
    <FormControl isInvalid={!!error} isRequired={isRequired} {...props}>
      {label && <FormLabel>{label}</FormLabel>}
      {children}
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
      {error && <FormErrorMessage>{error}</FormErrorMessage>}
    </FormControl>
  );
};

export const FintInput = ({ 
  placeholder,
  type = 'text',
  ...props 
}) => {
  return (
    <Input
      borderRadius="md"
      border="1px solid"
      borderColor="gray.300"
      _focus={{
        borderColor: 'primary.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
      }}
      placeholder={placeholder}
      type={type}
      {...props}
    />
  );
};

export const FintSelect = ({ 
  placeholder,
  options = [],
  ...props 
}) => {
  return (
    <Select
      borderRadius="md"
      border="1px solid"
      borderColor="gray.300"
      _focus={{
        borderColor: 'primary.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
      }}
      placeholder={placeholder}
      {...props}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </Select>
  );
};

export const FintTextarea = ({ 
  placeholder,
  rows = 3,
  ...props 
}) => {
  return (
    <Textarea
      borderRadius="md"
      border="1px solid"
      borderColor="gray.300"
      _focus={{
        borderColor: 'primary.500',
        boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
      }}
      placeholder={placeholder}
      rows={rows}
      resize="vertical"
      {...props}
    />
  );
};

export const FintNumberInput = ({ 
  placeholder,
  min = 0,
  max,
  step = 1,
  ...props 
}) => {
  return (
    <NumberInput
      min={min}
      max={max}
      step={step}
      {...props}
    >
      <NumberInputField
        borderRadius="md"
        border="1px solid"
        borderColor="gray.300"
        _focus={{
          borderColor: 'primary.500',
          boxShadow: '0 0 0 1px var(--chakra-colors-primary-500)',
        }}
        placeholder={placeholder}
      />
      <NumberInputStepper>
        <NumberIncrementStepper />
        <NumberDecrementStepper />
      </NumberInputStepper>
    </NumberInput>
  );
};

// Standardized Alert Component
export const FintAlert = ({ 
  status = 'info',
  title,
  description,
  ...props 
}) => {
  return (
    <Alert
      status={status}
      borderRadius="md"
      {...props}
    >
      <AlertIcon />
      <Box>
        {title && <AlertTitle>{title}</AlertTitle>}
        {description && <AlertDescription>{description}</AlertDescription>}
      </Box>
    </Alert>
  );
};

// Loading Spinner Component
export const FintSpinner = ({ size = 'md', ...props }) => {
  return (
    <Flex justify="center" align="center" py={8}>
      <Spinner size={size} color="primary.500" {...props} />
    </Flex>
  );
};

// Empty State Component
export const FintEmptyState = ({ 
  title = "No data available",
  description = "There are no items to display at the moment.",
  icon,
  action,
  ...props 
}) => {
  return (
    <VStack spacing={4} py={12} {...props}>
      {icon && icon}
      <VStack spacing={2}>
        <Text fontWeight="medium" color="gray.700">
          {title}
        </Text>
        <Text fontSize="sm" color="gray.500" textAlign="center">
          {description}
        </Text>
      </VStack>
      {action && action}
    </VStack>
  );
};

// Status Indicator Component
export const FintStatusIndicator = ({ 
  status,
  size = 'sm',
  ...props 
}) => {
  const statusConfig = {
    active: { color: 'green', label: 'Active' },
    inactive: { color: 'gray', label: 'Inactive' },
    pending: { color: 'yellow', label: 'Pending' },
    completed: { color: 'green', label: 'Completed' },
    failed: { color: 'red', label: 'Failed' },
    draft: { color: 'gray', label: 'Draft' },
    published: { color: 'blue', label: 'Published' },
  };

  const config = statusConfig[status] || statusConfig.inactive;

  return (
    <FintBadge
      variant={config.color}
      size={size}
      {...props}
    >
      {config.label}
    </FintBadge>
  );
};

// Currency Display Component
export const FintCurrency = ({ 
  amount, 
  currency = 'INR',
  size = 'md',
  ...props 
}) => {
  const formattedAmount = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: currency,
  }).format(amount);

  return (
    <Text
      fontFamily="mono"
      fontWeight="medium"
      fontSize={size}
      {...props}
    >
      {formattedAmount}
    </Text>
  );
};

// Date Display Component
export const FintDate = ({ 
  date, 
  format = 'short',
  ...props 
}) => {
  const dateObj = new Date(date);
  const formattedDate = format === 'short' 
    ? dateObj.toLocaleDateString()
    : dateObj.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

  return (
    <Text {...props}>
      {formattedDate}
    </Text>
  );
};

const ChakraComponents = {
  FintButton,
  FintCard,
  FintTable,
  FintBadge,
  FintModal,
  FintFormControl,
  FintInput,
  FintSelect,
  FintTextarea,
  FintNumberInput,
  FintAlert,
  FintSpinner,
  FintEmptyState,
  FintStatusIndicator,
  FintCurrency,
  FintDate,
};

export default ChakraComponents; 
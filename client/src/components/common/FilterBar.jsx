import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Input,
  InputGroup,
  IconButton,
  Select,
  Tooltip,
  useBreakpointValue,
  HStack,
  Icon,
  Button
} from '@chakra-ui/react';
import { CloseIcon, TimeIcon } from '@chakra-ui/icons';

const FilterBar = ({
  searchQuery,
  onSearchChange,
  filters = [],
  onFilterChange,
  dateRange,
  onDateRangeChange,
  onClearFilters,
  searchPlaceholder = 'Search...',
  sx
}) => {
  const isMobile = useBreakpointValue({ base: true, md: false });

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleClearFilters = () => {
    onClearFilters?.();
  };

  const handleDateChange = (name, value) => {
    onFilterChange(name, value ? new Date(value) : null);
  };
  
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  const renderFilterField = (filter) => {
    const { name, label, type = 'select', options = [], ...props } = filter;

    switch (type) {
      case 'select':
        return (
          <Select
            size="sm"
            placeholder={label}
            value={filters[name] || ''}
            onChange={(e) => onFilterChange(name, e.target.value)}
            minW="150px"
            {...props}
          >
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        );

      case 'date':
        return (
          <Input
            type="date"
            placeholder={label}
            size="sm"
            value={formatDateForInput(filters[name])}
            onChange={(e) => handleDateChange(name, e.target.value)}
            minW="150px"
            {...props}
          />
        );

      default:
        return null;
    }
  };

  return (
    <HStack spacing={4} wrap="wrap" align="center" mb={3} {...sx}>
      <InputGroup size="sm" flexGrow={1} minW={isMobile ? '100%' : '200px'}>
        <Input
          placeholder={searchPlaceholder}
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          borderRadius="md"
        />
        {searchQuery && (
          <IconButton
            size="xs"
            aria-label="Clear search"
            icon={<CloseIcon />}
            onClick={handleClearSearch}
            variant="ghost"
          />
        )}
      </InputGroup>

      {filters.map((filter) => (
        <Box key={filter.name}>
          {renderFilterField(filter)}
        </Box>
      ))}

      {dateRange && (
        <HStack spacing={2} align="center">
          <Icon as={TimeIcon} color="gray.500" />
          <Input
            type="date"
            placeholder="From"
            size="sm"
            value={formatDateForInput(dateRange.from)}
            onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : null })}
            minW="150px"
          />
          <Input
            type="date"
            placeholder="To"
            size="sm"
            value={formatDateForInput(dateRange.to)}
            onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : null })}
            minW="150px"
          />
        </HStack>
      )}

      {(filters.length > 0 || dateRange) && (
        <Tooltip label="Clear all filters">
          <Button
            size="sm"
            onClick={handleClearFilters}
            ml="auto"
            variant="ghost"
          >
            Clear Filters
          </Button>
        </Tooltip>
      )}
    </HStack>
  );
};

FilterBar.propTypes = {
  searchQuery: PropTypes.string,
  onSearchChange: PropTypes.func.isRequired,
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['select', 'date']),
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          label: PropTypes.string.isRequired
        })
      )
    })
  ),
  onFilterChange: PropTypes.func.isRequired,
  dateRange: PropTypes.shape({
    from: PropTypes.instanceOf(Date),
    to: PropTypes.instanceOf(Date)
  }),
  onDateRangeChange: PropTypes.func,
  onClearFilters: PropTypes.func,
  searchPlaceholder: PropTypes.string,
  sx: PropTypes.object
};

export default FilterBar;
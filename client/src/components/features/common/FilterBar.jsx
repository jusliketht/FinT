import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Input,
  Select,
  Button,
  HStack,
  Grid,
  GridItem
} from '@chakra-ui/react';

const FilterBar = ({
  filters,
  onFilterChange,
  onReset,
  dateRange,
  onDateRangeChange
}) => {
  const formatDateForInput = (date) => {
    if (!date) return '';
    const d = date instanceof Date ? date : new Date(date);
    if (isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  };

  return (
    <Box mb={6}>
      <Grid templateColumns="repeat(auto-fit, minmax(200px, 1fr))" gap={4}>
        {filters.map((filter) => (
          <GridItem key={filter.id}>
            {filter.type === 'select' ? (
              <Select
                placeholder={filter.label}
                value={filter.value}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                size="sm"
              >
                {filter.options.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                placeholder={filter.label}
                value={filter.value}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                size="sm"
              />
            )}
          </GridItem>
        ))}
        
        {dateRange && (
          <>
            <GridItem>
              <Input
                type="date"
                placeholder="From Date"
                value={formatDateForInput(dateRange.from)}
                onChange={(e) => onDateRangeChange({ ...dateRange, from: e.target.value ? new Date(e.target.value) : null })}
                size="sm"
              />
            </GridItem>
            <GridItem>
              <Input
                type="date"
                placeholder="To Date"
                value={formatDateForInput(dateRange.to)}
                onChange={(e) => onDateRangeChange({ ...dateRange, to: e.target.value ? new Date(e.target.value) : null })}
                size="sm"
              />
            </GridItem>
          </>
        )}
      </Grid>
      
      <HStack spacing={4} mt={4}>
        <Button size="sm" onClick={onReset} variant="outline">
          Reset Filters
        </Button>
      </HStack>
    </Box>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'select']).isRequired,
      value: PropTypes.string,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.string.isRequired,
          label: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  dateRange: PropTypes.shape({
    from: PropTypes.instanceOf(Date),
    to: PropTypes.instanceOf(Date)
  }),
  onDateRangeChange: PropTypes.func
};

export default FilterBar;
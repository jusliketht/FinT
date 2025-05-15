import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  IconButton,
  InputAdornment,
  MenuItem,
  Tooltip,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  FilterList as FilterListIcon,
  Clear as ClearIcon,
  DateRange as DateRangeIcon
} from '@mui/icons-material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';

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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const handleClearSearch = () => {
    onSearchChange('');
  };

  const handleClearFilters = () => {
    onClearFilters?.();
  };

  const renderFilterField = (filter) => {
    const { name, label, type = 'select', options = [], ...props } = filter;

    switch (type) {
      case 'select':
        return (
          <TextField
            select
            size="small"
            label={label}
            value={filters[name] || ''}
            onChange={(e) => onFilterChange(name, e.target.value)}
            sx={{ minWidth: 150 }}
            {...props}
          >
            <MenuItem value="">
              <em>All</em>
            </MenuItem>
            {options.map((option) => (
              <MenuItem key={option.value} value={option.value}>
                {option.label}
              </MenuItem>
            ))}
          </TextField>
        );

      case 'date':
        return (
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label={label}
              value={filters[name] || null}
              onChange={(date) => onFilterChange(name, date)}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { minWidth: 150 }
                }
              }}
              {...props}
            />
          </LocalizationProvider>
        );

      default:
        return null;
    }
  };

  return (
    <Box
      sx={{
        display: 'flex',
        gap: 2,
        flexWrap: 'wrap',
        alignItems: 'center',
        mb: 3,
        ...sx
      }}
    >
      <TextField
        size="small"
        placeholder={searchPlaceholder}
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{ flexGrow: 1, minWidth: isMobile ? '100%' : 200 }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClearSearch}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
      />

      {filters.map((filter) => (
        <Box key={filter.name}>
          {renderFilterField(filter)}
        </Box>
      ))}

      {dateRange && (
        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
          <DateRangeIcon color="action" />
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              label="From"
              value={dateRange.from || null}
              onChange={(date) => onDateRangeChange({ ...dateRange, from: date })}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { minWidth: 150 }
                }
              }}
            />
            <DatePicker
              label="To"
              value={dateRange.to || null}
              onChange={(date) => onDateRangeChange({ ...dateRange, to: date })}
              slotProps={{
                textField: {
                  size: 'small',
                  sx: { minWidth: 150 }
                }
              }}
            />
          </LocalizationProvider>
        </Box>
      )}

      {(filters.length > 0 || dateRange) && (
        <Tooltip title="Clear all filters">
          <IconButton
            size="small"
            onClick={handleClearFilters}
            sx={{ ml: 'auto' }}
          >
            <FilterListIcon />
          </IconButton>
        </Tooltip>
      )}
    </Box>
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
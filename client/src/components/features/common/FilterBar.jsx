import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  TextField,
  MenuItem,
  Button,
  Grid
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';

const FilterBar = ({
  filters,
  onFilterChange,
  onReset,
  dateRange,
  onDateRangeChange
}) => {
  return (
    <Box sx={{ mb: 3 }}>
      <Grid container spacing={2} alignItems="center">
        {filters.map((filter) => (
          <Grid item xs={12} sm={6} md={3} key={filter.id}>
            {filter.type === 'select' ? (
              <TextField
                select
                fullWidth
                label={filter.label}
                value={filter.value}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                size="small"
              >
                {filter.options.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            ) : (
              <TextField
                fullWidth
                label={filter.label}
                value={filter.value}
                onChange={(e) => onFilterChange(filter.id, e.target.value)}
                size="small"
              />
            )}
          </Grid>
        ))}
        
        {dateRange && (
          <>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="Start Date"
                value={dateRange.startDate}
                onChange={(date) => onDateRangeChange('startDate', date)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <DatePicker
                label="End Date"
                value={dateRange.endDate}
                onChange={(date) => onDateRangeChange('endDate', date)}
                slotProps={{ textField: { fullWidth: true, size: 'small' } }}
              />
            </Grid>
          </>
        )}

        <Grid item xs={12} sm={6} md={3}>
          <Button
            variant="outlined"
            onClick={onReset}
            fullWidth
            size="small"
          >
            Reset Filters
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

FilterBar.propTypes = {
  filters: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      type: PropTypes.oneOf(['text', 'select']).isRequired,
      value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
      options: PropTypes.arrayOf(
        PropTypes.shape({
          value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
          label: PropTypes.string.isRequired
        })
      )
    })
  ).isRequired,
  onFilterChange: PropTypes.func.isRequired,
  onReset: PropTypes.func.isRequired,
  dateRange: PropTypes.shape({
    startDate: PropTypes.instanceOf(Date),
    endDate: PropTypes.instanceOf(Date)
  }),
  onDateRangeChange: PropTypes.func
};

export default FilterBar; 
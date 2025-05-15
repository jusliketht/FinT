import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  TextField,
  InputAdornment,
  IconButton,
  CircularProgress,
  Box,
  Popper,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Typography,
  useTheme,
  useMediaQuery
} from '@mui/material';
import {
  Search as SearchIcon,
  Clear as ClearIcon,
  History as HistoryIcon,
  TrendingUp as TrendingUpIcon
} from '@mui/icons-material';
import useDebounce from '../../hooks/useDebounce';

const SearchInput = ({
  value,
  onChange,
  onSearch,
  placeholder = 'Search...',
  minLength = 2,
  debounceMs = 300,
  suggestions = [],
  recentSearches = [],
  trendingSearches = [],
  loading = false,
  error = null,
  size = 'medium',
  fullWidth = false,
  autoFocus = false,
  showClearButton = true,
  showSuggestions = true,
  maxSuggestions = 5,
  onSuggestionClick,
  onClear,
  sx
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [inputValue, setInputValue] = useState(value || '');
  const [showPopper, setShowPopper] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const inputRef = useRef(null);
  const debouncedValue = useDebounce(inputValue, debounceMs);

  useEffect(() => {
    if (debouncedValue.length >= minLength) {
      onSearch?.(debouncedValue);
    }
  }, [debouncedValue, minLength, onSearch]);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    setShowPopper(newValue.length > 0);
  };

  const handleClear = () => {
    setInputValue('');
    onChange?.('');
    onClear?.();
    setShowPopper(false);
    inputRef.current?.focus();
  };

  const handleFocus = (event) => {
    setAnchorEl(event.currentTarget);
    if (inputValue.length > 0) {
      setShowPopper(true);
    }
  };

  const handleBlur = () => {
    // Delay hiding the popper to allow for clicking on suggestions
    setTimeout(() => {
      setShowPopper(false);
    }, 200);
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onChange?.(suggestion);
    onSuggestionClick?.(suggestion);
    setShowPopper(false);
  };

  const renderSuggestions = () => {
    if (!showSuggestions || !showPopper) return null;

    const hasSuggestions = suggestions.length > 0;
    const hasRecentSearches = recentSearches.length > 0;
    const hasTrendingSearches = trendingSearches.length > 0;

    if (!hasSuggestions && !hasRecentSearches && !hasTrendingSearches) {
      return null;
    }

    return (
      <Popper
        open={showPopper}
        anchorEl={anchorEl}
        placement="bottom-start"
        style={{ width: anchorEl?.offsetWidth, zIndex: theme.zIndex.modal }}
      >
        <Paper
          elevation={3}
          sx={{
            mt: 0.5,
            maxHeight: 400,
            overflow: 'auto'
          }}
        >
          {hasSuggestions && (
            <List dense>
              {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                <ListItem
                  key={`suggestion-${index}`}
                  button
                  onClick={() => handleSuggestionClick(suggestion)}
                >
                  <ListItemIcon>
                    <SearchIcon fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary={suggestion} />
                </ListItem>
              ))}
            </List>
          )}

          {hasRecentSearches && (
            <>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Recent Searches
                </Typography>
              </Box>
              <List dense>
                {recentSearches.slice(0, maxSuggestions).map((search, index) => (
                  <ListItem
                    key={`recent-${index}`}
                    button
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <ListItemIcon>
                      <HistoryIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={search} />
                  </ListItem>
                ))}
              </List>
            </>
          )}

          {hasTrendingSearches && (
            <>
              <Box sx={{ px: 2, py: 1 }}>
                <Typography variant="subtitle2" color="text.secondary">
                  Trending Searches
                </Typography>
              </Box>
              <List dense>
                {trendingSearches.slice(0, maxSuggestions).map((search, index) => (
                  <ListItem
                    key={`trending-${index}`}
                    button
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <ListItemIcon>
                      <TrendingUpIcon fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primary={search} />
                  </ListItem>
                ))}
              </List>
            </>
          )}
        </Paper>
      </Popper>
    );
  };

  return (
    <Box sx={{ position: 'relative', ...sx }}>
      <TextField
        inputRef={inputRef}
        value={inputValue}
        onChange={handleChange}
        onFocus={handleFocus}
        onBlur={handleBlur}
        placeholder={placeholder}
        size={size}
        fullWidth={fullWidth}
        autoFocus={autoFocus}
        error={!!error}
        helperText={error}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              {loading ? (
                <CircularProgress size={20} />
              ) : (
                <SearchIcon color="action" />
              )}
            </InputAdornment>
          ),
          endAdornment: showClearButton && inputValue && (
            <InputAdornment position="end">
              <IconButton
                size="small"
                onClick={handleClear}
                edge="end"
              >
                <ClearIcon />
              </IconButton>
            </InputAdornment>
          )
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'background.paper'
          }
        }}
      />
      {renderSuggestions()}
    </Box>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  onSearch: PropTypes.func,
  placeholder: PropTypes.string,
  minLength: PropTypes.number,
  debounceMs: PropTypes.number,
  suggestions: PropTypes.arrayOf(PropTypes.string),
  recentSearches: PropTypes.arrayOf(PropTypes.string),
  trendingSearches: PropTypes.arrayOf(PropTypes.string),
  loading: PropTypes.bool,
  error: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium']),
  fullWidth: PropTypes.bool,
  autoFocus: PropTypes.bool,
  showClearButton: PropTypes.bool,
  showSuggestions: PropTypes.bool,
  maxSuggestions: PropTypes.number,
  onSuggestionClick: PropTypes.func,
  onClear: PropTypes.func,
  sx: PropTypes.object
};

export default SearchInput; 
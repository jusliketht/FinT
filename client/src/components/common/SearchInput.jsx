import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  InputGroup,
  Box,
  VStack,
  HStack,
  Text,
  Icon,
  List,
  ListItem,
  InputRightElement,
  IconButton
} from '@chakra-ui/react';
import { SearchIcon, RepeatIcon, ArrowUpIcon } from '@chakra-ui/icons';
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
  size = 'md',
  fullWidth = false,
  autoFocus = false,
  showClearButton = true,
  showSuggestions = true,
  maxSuggestions = 5,
  onSuggestionClick,
  onClear,
  sx
}) => {
  const [inputValue, setInputValue] = useState(value || '');
  const [showSuggestionsState, setShowSuggestionsState] = useState(false);
  const inputRef = useRef(null);
  const debouncedValue = useDebounce(inputValue, debounceMs);
  const bgColor = 'white';
  const borderColor = 'gray.200';
  const hoverBg = 'gray.50';

  useEffect(() => {
    if (debouncedValue.length >= minLength) {
      onSearch?.(debouncedValue);
    }
  }, [debouncedValue, minLength, onSearch]);

  useEffect(() => {
    if (value !== inputValue) {
      setInputValue(value || '');
    }
  }, [value, inputValue]);

  const handleChange = (event) => {
    const newValue = event.target.value;
    setInputValue(newValue);
    onChange?.(newValue);
    setShowSuggestionsState(newValue.length > 0);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      onSearch?.(inputValue);
    }
  };

  const handleSuggestionClick = (suggestion) => {
    setInputValue(suggestion);
    onChange?.(suggestion);
    onSuggestionClick?.(suggestion);
    setShowSuggestionsState(false);
  };

  const renderSuggestions = () => {
    if (!showSuggestionsState || inputValue.length === 0) return null;

    const allSuggestions = [
      ...suggestions.slice(0, maxSuggestions),
      ...recentSearches.slice(0, 2),
      ...trendingSearches.slice(0, 2)
    ];

    if (allSuggestions.length === 0) return null;

    return (
      <Box
        position="absolute"
        top="100%"
        left={0}
        right={0}
        zIndex={10}
        bg={bgColor}
        border="1px"
        borderColor={borderColor}
        borderRadius="md"
        boxShadow="lg"
        maxH="300px"
        overflowY="auto"
      >
        <VStack spacing={0} align="stretch">
          {suggestions.length > 0 && (
            <Box>
              <Text px={3} py={2} fontSize="sm" fontWeight="bold" color="gray.500">
                Suggestions
              </Text>
              <List spacing={0}>
                {suggestions.slice(0, maxSuggestions).map((suggestion, index) => (
                  <ListItem
                    key={index}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <HStack>
                      <Icon as={SearchIcon} color="gray.400" />
                      <Text>{suggestion}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {recentSearches.length > 0 && (
            <Box>
              <Text px={3} py={2} fontSize="sm" fontWeight="bold" color="gray.500">
                Recent Searches
              </Text>
              <List spacing={0}>
                {recentSearches.slice(0, 2).map((search, index) => (
                  <ListItem
                    key={index}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <HStack>
                      <Icon as={RepeatIcon} color="gray.400" />
                      <Text>{search}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}

          {trendingSearches.length > 0 && (
            <Box>
              <Text px={3} py={2} fontSize="sm" fontWeight="bold" color="gray.500">
                Trending
              </Text>
              <List spacing={0}>
                {trendingSearches.slice(0, 2).map((search, index) => (
                  <ListItem
                    key={index}
                    px={3}
                    py={2}
                    cursor="pointer"
                    _hover={{ bg: hoverBg }}
                    onClick={() => handleSuggestionClick(search)}
                  >
                    <HStack>
                      <Icon as={ArrowUpIcon} color="gray.400" />
                      <Text>{search}</Text>
                    </HStack>
                  </ListItem>
                ))}
              </List>
            </Box>
          )}
        </VStack>
      </Box>
    );
  };

  return (
    <Box position="relative" w={fullWidth ? '100%' : 'auto'} {...sx}>
      <InputGroup size={size}>
        <Input
          ref={inputRef}
          value={inputValue}
          onChange={handleChange}
          placeholder={placeholder}
          autoFocus={autoFocus}
          borderRadius="md"
          onKeyDown={handleKeyPress}
        />
        {showClearButton && (
          <InputRightElement>
            <IconButton
              icon={<Icon as={SearchIcon} color="gray.400" />}
              aria-label="Clear"
              onClick={() => {
                setInputValue('');
                onChange?.('');
                onClear?.();
                setShowSuggestionsState(false);
                inputRef.current?.focus();
              }}
            />
          </InputRightElement>
        )}
      </InputGroup>
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
  error: PropTypes.object,
  size: PropTypes.oneOf(['sm', 'md', 'lg']),
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
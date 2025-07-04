import React from 'react';
import PropTypes from 'prop-types';
import {
  Input,
  InputGroup,
  IconButton
} from '@chakra-ui/react';
import { SearchIcon, CloseIcon } from '@chakra-ui/icons';

const SearchInput = ({
  value,
  onChange,
  onClear,
  placeholder = 'Search...',
  fullWidth = true,
  size = 'sm'
}) => {
  return (
    <InputGroup size={size}>
      <SearchIcon color="gray.400" />
      <Input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        w={fullWidth ? '100%' : 'auto'}
      />
      {value && (
        <IconButton
          size="sm"
          aria-label="Clear search"
          icon={<CloseIcon />}
          onClick={onClear}
          variant="ghost"
        />
      )}
    </InputGroup>
  );
};

SearchInput.propTypes = {
  value: PropTypes.string.isRequired,
  onChange: PropTypes.func.isRequired,
  onClear: PropTypes.func.isRequired,
  placeholder: PropTypes.string,
  fullWidth: PropTypes.bool,
  size: PropTypes.oneOf(['sm', 'md', 'lg'])
};

export default SearchInput;
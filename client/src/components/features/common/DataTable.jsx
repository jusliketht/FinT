import React from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  HStack,
  Button,
  Select,
  Text
} from '@chakra-ui/react';

const DataTable = ({
  columns,
  data,
  page,
  rowsPerPage,
  totalCount,
  onPageChange,
  onRowsPerPageChange
}) => {
  const startIndex = page * rowsPerPage;
  const endIndex = Math.min(startIndex + rowsPerPage, totalCount);

  return (
    <Box>
      <Box overflowX="auto">
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead style={{ backgroundColor: '#f7fafc' }}>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.id}
                  style={{
                    textAlign: column.align || 'left',
                    minWidth: column.minWidth,
                    padding: '12px',
                    fontWeight: 'bold'
                  }}
                >
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={row.id || index} style={{ borderBottom: '1px solid #e2e8f0' }}>
                {columns.map((column) => (
                  <td 
                    key={column.id} 
                    style={{ 
                      textAlign: column.align || 'left',
                      padding: '12px'
                    }}
                  >
                    {column.render ? column.render(row) : row[column.id]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </Box>
      
      <HStack justify="space-between" mt={4}>
        <HStack spacing={2}>
          <Text fontSize="sm">Rows per page:</Text>
          <Select
            value={rowsPerPage}
            onChange={(e) => onRowsPerPageChange(parseInt(e.target.value))}
            size="sm"
            w="70px"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
          </Select>
        </HStack>
        
        <Text fontSize="sm">
          {startIndex + 1}-{endIndex} of {totalCount}
        </Text>
        
        <HStack spacing={2}>
          <Button
            size="sm"
            onClick={() => onPageChange(page - 1)}
            isDisabled={page === 0}
          >
            Previous
          </Button>
          <Button
            size="sm"
            onClick={() => onPageChange(page + 1)}
            isDisabled={endIndex >= totalCount}
          >
            Next
          </Button>
        </HStack>
      </HStack>
    </Box>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      label: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      minWidth: PropTypes.number,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  page: PropTypes.number.isRequired,
  rowsPerPage: PropTypes.number.isRequired,
  totalCount: PropTypes.number.isRequired,
  onPageChange: PropTypes.func.isRequired,
  onRowsPerPageChange: PropTypes.func.isRequired
};

export default DataTable;
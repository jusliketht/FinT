import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TableSortLabel,
  Checkbox,
  Tooltip,
  IconButton,
  useTheme,
  useMediaQuery,
  Paper,
  Typography,
  LinearProgress
} from '@mui/material';
import {
  MoreVert as MoreVertIcon,
  ArrowUpward as ArrowUpwardIcon,
  ArrowDownward as ArrowDownwardIcon
} from '@mui/icons-material';

const DataTable = ({
  columns,
  data,
  loading = false,
  error = null,
  selectable = false,
  onSelectionChange,
  onRowClick,
  onSort,
  onPageChange,
  onRowsPerPageChange,
  page = 0,
  rowsPerPage = 10,
  totalCount = 0,
  sortBy,
  sortDirection = 'asc',
  actions,
  getRowId = (row) => row.id,
  emptyMessage = 'No data available',
  sx
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [selected, setSelected] = useState([]);

  const handleSelectAllClick = (event) => {
    if (event.target.checked) {
      const newSelected = data.map((row) => getRowId(row));
      setSelected(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      setSelected([]);
      onSelectionChange?.([]);
    }
  };

  const handleClick = (event, id) => {
    if (event.target.type === 'checkbox') {
      const selectedIndex = selected.indexOf(id);
      let newSelected = [];

      if (selectedIndex === -1) {
        newSelected = newSelected.concat(selected, id);
      } else if (selectedIndex === 0) {
        newSelected = newSelected.concat(selected.slice(1));
      } else if (selectedIndex === selected.length - 1) {
        newSelected = newSelected.concat(selected.slice(0, -1));
      } else if (selectedIndex > 0) {
        newSelected = newSelected.concat(
          selected.slice(0, selectedIndex),
          selected.slice(selectedIndex + 1)
        );
      }

      setSelected(newSelected);
      onSelectionChange?.(newSelected);
    } else {
      onRowClick?.(id);
    }
  };

  const handleChangePage = (event, newPage) => {
    onPageChange?.(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange?.(parseInt(event.target.value, 10));
  };

  const handleSort = (column) => {
    const isAsc = sortBy === column && sortDirection === 'asc';
    onSort?.(column, isAsc ? 'desc' : 'asc');
  };

  const isSelected = (id) => selected.indexOf(id) !== -1;

  const renderCell = (row, column) => {
    const { field, render, align = 'left' } = column;
    const value = row[field];

    if (render) {
      return render(value, row);
    }

    return (
      <Typography
        variant="body2"
        align={align}
        sx={{
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          maxWidth: column.maxWidth
        }}
      >
        {value}
      </Typography>
    );
  };

  if (error) {
    return (
      <Paper
        sx={{
          p: 3,
          textAlign: 'center',
          bgcolor: 'error.light',
          color: 'error.contrastText'
        }}
      >
        <Typography variant="body1">{error.message || 'An error occurred while loading the data.'}</Typography>
      </Paper>
    );
  }

  return (
    <Paper sx={{ width: '100%', overflow: 'hidden', ...sx }}>
      {loading && (
        <LinearProgress
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 1
          }}
        />
      )}

      <TableContainer sx={{ maxHeight: 'calc(100vh - 300px)' }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {selectable && (
                <TableCell padding="checkbox">
                  <Checkbox
                    indeterminate={selected.length > 0 && selected.length < data.length}
                    checked={data.length > 0 && selected.length === data.length}
                    onChange={handleSelectAllClick}
                  />
                </TableCell>
              )}

              {columns.map((column) => (
                <TableCell
                  key={column.field}
                  align={column.align || 'left'}
                  sortDirection={sortBy === column.field ? sortDirection : false}
                  sx={{
                    minWidth: column.minWidth,
                    maxWidth: column.maxWidth,
                    whiteSpace: 'nowrap'
                  }}
                >
                  {column.sortable ? (
                    <TableSortLabel
                      active={sortBy === column.field}
                      direction={sortBy === column.field ? sortDirection : 'asc'}
                      onClick={() => handleSort(column.field)}
                      IconComponent={
                        sortBy === column.field
                          ? sortDirection === 'asc'
                            ? ArrowUpwardIcon
                            : ArrowDownwardIcon
                          : undefined
                      }
                    >
                      {column.headerName}
                    </TableSortLabel>
                  ) : (
                    column.headerName
                  )}
                </TableCell>
              ))}

              {actions && <TableCell align="right">Actions</TableCell>}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length + (selectable ? 1 : 0) + (actions ? 1 : 0)}
                  align="center"
                  sx={{ py: 3 }}
                >
                  <Typography variant="body2" color="textSecondary">
                    {emptyMessage}
                  </Typography>
                </TableCell>
              </TableRow>
            ) : (
              data.map((row) => {
                const id = getRowId(row);
                const isItemSelected = isSelected(id);

                return (
                  <TableRow
                    hover
                    key={id}
                    onClick={(event) => handleClick(event, id)}
                    selected={isItemSelected}
                    sx={{ cursor: onRowClick ? 'pointer' : 'default' }}
                  >
                    {selectable && (
                      <TableCell padding="checkbox">
                        <Checkbox checked={isItemSelected} />
                      </TableCell>
                    )}

                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align={column.align || 'left'}
                        sx={{
                          minWidth: column.minWidth,
                          maxWidth: column.maxWidth
                        }}
                      >
                        {renderCell(row, column)}
                      </TableCell>
                    ))}

                    {actions && (
                      <TableCell align="right">
                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
                          {actions.map((action, index) => (
                            <Tooltip key={index} title={action.tooltip}>
                              <IconButton
                                size="small"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  action.onClick(row);
                                }}
                                disabled={action.disabled?.(row)}
                              >
                                {action.icon}
                              </IconButton>
                            </Tooltip>
                          ))}
                        </Box>
                      </TableCell>
                    )}
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </TableContainer>

      <TablePagination
        component="div"
        count={totalCount}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        rowsPerPageOptions={[5, 10, 25, 50]}
      />
    </Paper>
  );
};

DataTable.propTypes = {
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      field: PropTypes.string.isRequired,
      headerName: PropTypes.string.isRequired,
      align: PropTypes.oneOf(['left', 'center', 'right']),
      sortable: PropTypes.bool,
      minWidth: PropTypes.number,
      maxWidth: PropTypes.number,
      render: PropTypes.func
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  loading: PropTypes.bool,
  error: PropTypes.shape({
    message: PropTypes.string
  }),
  selectable: PropTypes.bool,
  onSelectionChange: PropTypes.func,
  onRowClick: PropTypes.func,
  onSort: PropTypes.func,
  onPageChange: PropTypes.func,
  onRowsPerPageChange: PropTypes.func,
  page: PropTypes.number,
  rowsPerPage: PropTypes.number,
  totalCount: PropTypes.number,
  sortBy: PropTypes.string,
  sortDirection: PropTypes.oneOf(['asc', 'desc']),
  actions: PropTypes.arrayOf(
    PropTypes.shape({
      icon: PropTypes.node.isRequired,
      tooltip: PropTypes.string.isRequired,
      onClick: PropTypes.func.isRequired,
      disabled: PropTypes.func
    })
  ),
  getRowId: PropTypes.func,
  emptyMessage: PropTypes.string,
  sx: PropTypes.object
};

export default DataTable; 
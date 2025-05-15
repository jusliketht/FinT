import { useState, useCallback, useMemo } from 'react';

/**
 * A custom hook for handling pagination state.
 * @param {Object} options - Configuration options
 * @param {number} options.initialPage - The initial page number (default: 0)
 * @param {number} options.initialRowsPerPage - The initial number of rows per page (default: 10)
 * @param {number} options.totalCount - The total number of items
 * @param {Array<number>} options.rowsPerPageOptions - The available rows per page options (default: [5, 10, 25, 50])
 * @param {Function} options.onPageChange - Callback function when page changes
 * @param {Function} options.onRowsPerPageChange - Callback function when rows per page changes
 * @returns {Object} - The pagination state and handlers
 */
const usePagination = ({
  initialPage = 0,
  initialRowsPerPage = 10,
  totalCount = 0,
  rowsPerPageOptions = [5, 10, 25, 50],
  onPageChange,
  onRowsPerPageChange
} = {}) => {
  const [page, setPage] = useState(initialPage);
  const [rowsPerPage, setRowsPerPage] = useState(initialRowsPerPage);

  const handlePageChange = useCallback((event, newPage) => {
    setPage(newPage);
    onPageChange?.(newPage);
  }, [onPageChange]);

  const handleRowsPerPageChange = useCallback((event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
    setPage(0); // Reset to first page when changing rows per page
    onRowsPerPageChange?.(newRowsPerPage);
  }, [onRowsPerPageChange]);

  const paginationInfo = useMemo(() => {
    const start = page * rowsPerPage;
    const end = Math.min(start + rowsPerPage, totalCount);
    const hasNextPage = end < totalCount;
    const hasPreviousPage = page > 0;
    const totalPages = Math.ceil(totalCount / rowsPerPage);

    return {
      start,
      end,
      hasNextPage,
      hasPreviousPage,
      totalPages,
      currentPage: page + 1,
      rowsPerPage,
      totalCount
    };
  }, [page, rowsPerPage, totalCount]);

  const getPaginationProps = useCallback(() => ({
    page,
    rowsPerPage,
    rowsPerPageOptions,
    count: totalCount,
    onPageChange: handlePageChange,
    onRowsPerPageChange: handleRowsPerPageChange
  }), [page, rowsPerPage, rowsPerPageOptions, totalCount, handlePageChange, handleRowsPerPageChange]);

  const resetPagination = useCallback(() => {
    setPage(initialPage);
    setRowsPerPage(initialRowsPerPage);
  }, [initialPage, initialRowsPerPage]);

  return {
    page,
    rowsPerPage,
    ...paginationInfo,
    handlePageChange,
    handleRowsPerPageChange,
    getPaginationProps,
    resetPagination,
    setPage,
    setRowsPerPage
  };
};

export default usePagination; 
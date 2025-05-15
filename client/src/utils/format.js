/**
 * Format a number as currency
 * @param {number} amount - The amount to format
 * @param {string} currency - The currency code (default: USD)
 * @returns {string} Formatted currency string
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency
  }).format(amount);
};

/**
 * Format a date string
 * @param {string|Date} date - The date to format
 * @param {string} format - The format to use (default: 'MM/DD/YYYY')
 * @returns {string} Formatted date string
 */
export const formatDate = (date, format = 'MM/DD/YYYY') => {
  const d = new Date(date);
  const options = {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  };
  return d.toLocaleDateString('en-US', options);
};

/**
 * Format a number with commas
 * @param {number} number - The number to format
 * @returns {string} Formatted number string
 */
export const formatNumber = (number) => {
  return new Intl.NumberFormat('en-US').format(number);
};

/**
 * Format a percentage
 * @param {number} value - The value to format
 * @param {number} decimals - Number of decimal places (default: 2)
 * @returns {string} Formatted percentage string
 */
export const formatPercent = (value, decimals = 2) => {
  return `${(value * 100).toFixed(decimals)}%`;
}; 
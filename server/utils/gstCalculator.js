/**
 * Calculates GST components for a given amount and rate
 * @param {Number} amount - The amount before GST
 * @param {Number} gstRate - GST rate (e.g., 5, 12, 18, 28)
 * @returns {Object} GST components including SGST, CGST, and total amount
 */
const calculateGST = (amount, gstRate) => {
  const gst = (amount * gstRate) / 100;
  return {
    sgst: gst / 2,            // State GST
    cgst: gst / 2,            // Central GST
    igst: gst,                // Integrated GST (for interstate)
    gstAmount: gst,           // Total GST amount
    total: amount + gst       // Total amount including GST
  };
};

/**
 * Calculates GST based on existing total amount (reverse calculation)
 * @param {Number} totalAmount - Amount including GST
 * @param {Number} gstRate - GST rate (e.g., 5, 12, 18, 28)
 * @returns {Object} Base amount and GST components
 */
const calculateBaseFromTotal = (totalAmount, gstRate) => {
  const baseAmount = totalAmount * (100 / (100 + gstRate));
  const gstAmount = totalAmount - baseAmount;
  
  return {
    baseAmount,               // Amount before GST
    sgst: gstAmount / 2,      // State GST
    cgst: gstAmount / 2,      // Central GST
    igst: gstAmount,          // Integrated GST
    gstAmount,                // Total GST amount
    totalAmount               // Original total amount
  };
};

module.exports = {
  calculateGST,
  calculateBaseFromTotal
}; 
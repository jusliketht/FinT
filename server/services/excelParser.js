const ExcelJS = require("exceljs");

/**
 * Parse an Excel file and extract transactions
 * @param {string} filePath - Path to the Excel file
 * @returns {Promise<Array>} Array of transaction objects
 */
const parseExcel = async (filePath) => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile(filePath);

    const transactions = [];
    const worksheet = workbook.worksheets[0]; // Use first worksheet

    // Determine bank type from content
    const bankType = determineBankType(worksheet);

    // Parse based on bank type
    switch (bankType) {
      case "HDFC":
        return parseHDFCExcel(worksheet);
      case "ICICI":
        return parseICICIExcel(worksheet);
      case "SBI":
        return parseSBIExcel(worksheet);
      default:
        // Generic parsing as fallback
        return parseGenericExcel(worksheet);
    }
  } catch (error) {
    console.error("Error parsing Excel file:", error);
    throw new Error(`Failed to parse Excel: ${error.message}`);
  }
};

/**
 * Determine the bank type from the Excel content
 * @param {Object} worksheet - The worksheet object
 * @returns {string} The detected bank type
 */
const determineBankType = (worksheet) => {
  // Check headers or content for bank identifiers
  let bankType = "UNKNOWN";

  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const rowText = row.values.join(" ");
    if (rowNumber <= 10) {
      // Check only first few rows
      if (rowText.includes("HDFC BANK") || rowText.includes("HDFC Bank")) {
        bankType = "HDFC";
      } else if (
        rowText.includes("ICICI BANK") ||
        rowText.includes("ICICI Bank")
      ) {
        bankType = "ICICI";
      } else if (
        rowText.includes("STATE BANK OF INDIA") ||
        rowText.includes("SBI")
      ) {
        bankType = "SBI";
      }
    }
  });

  return bankType;
};

/**
 * Parse HDFC Bank Excel statement
 * @param {Object} worksheet - The worksheet object
 * @returns {Array} Array of transaction objects
 */
const parseHDFCExcel = (worksheet) => {
  const transactions = [];
  let headerRow = 0;

  // Find header row
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    const rowValues = row.values;
    if (rowValues.some((value) => value && value.toString().includes("Date"))) {
      headerRow = rowNumber;
    }
  });

  if (headerRow === 0) {
    return parseGenericExcel(worksheet, "HDFC");
  }

  // Find column indices
  let dateCol = 0;
  let descCol = 0;
  let amountCol = 0;
  let typeCol = 0;

  const headerRowObj = worksheet.getRow(headerRow);
  headerRowObj.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const value = cell.value.toString().toLowerCase();
    if (value.includes("date")) {
      dateCol = colNumber;
    } else if (
      value.includes("narration") ||
      value.includes("description") ||
      value.includes("particulars")
    ) {
      descCol = colNumber;
    } else if (value.includes("amount")) {
      amountCol = colNumber;
    } else if (
      value.includes("type") ||
      value.includes("cr/dr") ||
      value.includes("debit/credit")
    ) {
      typeCol = colNumber;
    }
  });

  // Extract transactions
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > headerRow) {
      const dateValue = row.getCell(dateCol).value;
      const descValue = row.getCell(descCol).value;
      const amountValue = row.getCell(amountCol).value;

      // Skip rows without proper date or amount
      if (!dateValue || !amountValue) return;

      // Parse date
      let date;
      if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        try {
          // Handle string date formats
          date = new Date(dateValue);
        } catch (e) {
          date = new Date(); // Fallback
        }
      }

      // Parse amount
      let amount;
      if (typeof amountValue === "number") {
        amount = amountValue;
      } else {
        const amountStr = amountValue.toString().replace(/[^\d.-]/g, "");
        amount = parseFloat(amountStr);
      }

      // Determine transaction type
      let transactionType = "debit"; // Default
      if (typeCol > 0) {
        const typeValue = row.getCell(typeCol).value;
        if (typeValue) {
          const typeStr = typeValue.toString().toLowerCase();
          transactionType =
            typeStr.includes("cr") || typeStr.includes("credit")
              ? "credit"
              : "debit";
        }
      }

      // Add transaction if valid
      if (!isNaN(amount) && date) {
        transactions.push({
          date,
          description: descValue ? descValue.toString() : "Unknown Description",
          amount: Math.abs(amount), // Use absolute value
          transactionType,
          bank: "HDFC",
        });
      }
    }
  });

  return transactions;
};

/**
 * Parse ICICI Bank Excel statement - simplified implementation
 * @param {Object} worksheet - The worksheet object
 * @returns {Array} Array of transaction objects
 */
const parseICICIExcel = (worksheet) =>
  // Similar to HDFC parser but with ICICI format
  // This is a placeholder implementation
  parseGenericExcel(worksheet, "ICICI");
/**
 * Parse SBI Bank Excel statement - simplified implementation
 * @param {Object} worksheet - The worksheet object
 * @returns {Array} Array of transaction objects
 */
const parseSBIExcel = (worksheet) =>
  // Similar to HDFC parser but with SBI format
  // This is a placeholder implementation
  parseGenericExcel(worksheet, "SBI");
/**
 * Generic Excel statement parser
 * @param {Object} worksheet - The worksheet object
 * @param {string} bankName - Bank name to use in the transactions
 * @returns {Array} Array of transaction objects
 */
const parseGenericExcel = (worksheet, bankName = "UNKNOWN") => {
  const transactions = [];

  // Find potential date and amount columns
  let dateCol = 0;
  let amountCol = 0;
  let descCol = 0;

  // Check first row for headers
  const headerRow = worksheet.getRow(1);
  headerRow.eachCell({ includeEmpty: false }, (cell, colNumber) => {
    const value = cell.value ? cell.value.toString().toLowerCase() : "";
    if (value.includes("date")) {
      dateCol = colNumber;
    } else if (value.includes("amount") || value.includes("value")) {
      amountCol = colNumber;
    } else if (
      value.includes("description") ||
      value.includes("narration") ||
      value.includes("particulars")
    ) {
      descCol = colNumber;
    }
  });

  // If headers not found, make educated guesses
  if (dateCol === 0) {
    // Assume date is in first column
    dateCol = 1;
  }

  if (amountCol === 0) {
    // Look for a column with numeric values
    worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
      if (rowNumber > 1) {
        // Skip header
        row.eachCell({ includeEmpty: false }, (cell, colNumber) => {
          const value = cell.value;
          if (
            typeof value === "number" ||
            (typeof value === "string" && /[\d,]+\.\d{2}/.test(value))
          ) {
            amountCol = colNumber;
            return false; // Exit loop
          }
        });
      }
      if (amountCol > 0) return false; // Exit row loop if found
    });
  }

  if (descCol === 0 && dateCol !== 0 && amountCol !== 0) {
    // Assume description is between date and amount or after both
    if (dateCol < amountCol) {
      descCol = dateCol + 1;
    } else {
      descCol = amountCol + 1;
    }
  }

  // Extract transactions
  worksheet.eachRow({ includeEmpty: false }, (row, rowNumber) => {
    if (rowNumber > 1) {
      // Skip header
      const dateValue = row.getCell(dateCol).value;
      const amountValue = row.getCell(amountCol).value;

      // Skip rows without proper date or amount
      if (!dateValue || !amountValue) return;

      // Parse date
      let date;
      if (dateValue instanceof Date) {
        date = dateValue;
      } else {
        try {
          // Handle string date formats
          date = new Date(dateValue);
        } catch (e) {
          date = new Date(); // Fallback
        }
      }

      // Parse amount
      let amount;
      if (typeof amountValue === "number") {
        amount = amountValue;
      } else {
        const amountStr = amountValue.toString().replace(/[^\d.-]/g, "");
        amount = parseFloat(amountStr);
      }

      // Get description if column exists
      let description = "Unknown Description";
      if (descCol > 0) {
        const descValue = row.getCell(descCol).value;
        description = descValue ? descValue.toString() : description;
      }

      // Add transaction if valid
      if (!isNaN(amount) && date) {
        transactions.push({
          date,
          description,
          amount: Math.abs(amount), // Use absolute value
          transactionType: amount < 0 ? "debit" : "credit", // Negative = debit
          bank: bankName,
        });
      }
    }
  });

  return transactions;
};

module.exports = {
  parseExcel,
};

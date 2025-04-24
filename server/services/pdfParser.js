const fs = require('fs');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

/**
 * Parse a PDF file and extract transactions
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Array>} Array of transaction objects
 */
const parsePDF = async (filePath) => {
  try {
    // Read the PDF file
    const data = new Uint8Array(fs.readFileSync(filePath));
    
    // Load the PDF document
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    
    // Array to store extracted transactions
    const transactions = [];
    
    // Determine which bank statement it is
    const bankType = await determineBankType(pdfDocument);
    
    // Parse based on bank type
    switch(bankType) {
      case 'HDFC':
        return await parseHDFCStatement(pdfDocument);
      case 'ICICI':
        return await parseICICIStatement(pdfDocument);
      case 'SBI':
        return await parseSBIStatement(pdfDocument);
      default:
        // Generic parsing as fallback
        return await parseGenericStatement(pdfDocument);
    }
  } catch (error) {
    console.error('Error parsing PDF:', error);
    throw new Error(`Failed to parse PDF: ${error.message}`);
  }
};

/**
 * Determine the bank type from the PDF content
 * @param {Object} pdfDocument - The PDF document object
 * @returns {Promise<string>} The detected bank type
 */
const determineBankType = async (pdfDocument) => {
  try {
    // Extract text from first page
    const page = await pdfDocument.getPage(1);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    
    // Check for bank identifiers
    if (text.includes('HDFC BANK') || text.includes('HDFC Bank')) {
      return 'HDFC';
    } else if (text.includes('ICICI BANK') || text.includes('ICICI Bank')) {
      return 'ICICI';
    } else if (text.includes('STATE BANK OF INDIA') || text.includes('SBI')) {
      return 'SBI';
    } else {
      return 'UNKNOWN';
    }
  } catch (error) {
    console.error('Error determining bank type:', error);
    return 'UNKNOWN';
  }
};

/**
 * Parse HDFC Bank statement
 * @param {Object} pdfDocument - The PDF document object
 * @returns {Promise<Array>} Array of transaction objects
 */
const parseHDFCStatement = async (pdfDocument) => {
  const transactions = [];
  
  // Get number of pages
  const numPages = pdfDocument.numPages;
  
  // Regular expression for HDFC transaction rows
  // This is a simplified regex - actual implementation would be more robust
  const transactionRegex = /(\d{2}\/\d{2}\/\d{2,4})\s+(\d{2}\/\d{2}\/\d{2,4})?\s+([\w\s\-\/]+)\s+([\d,]+\.\d{2})\s*(Cr|Dr)?/g;
  
  // Process each page
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    
    // Find all matches
    let match;
    while ((match = transactionRegex.exec(text)) !== null) {
      const dateStr = match[1];
      const description = match[3].trim();
      const amountStr = match[4].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      const type = match[5] === 'Cr' ? 'credit' : 'debit';
      
      // Convert date string to Date object
      const dateParts = dateStr.split('/');
      const month = parseInt(dateParts[1]) - 1; // Months are 0-indexed in JS
      const day = parseInt(dateParts[0]);
      const year = dateParts[2].length === 2 ? 2000 + parseInt(dateParts[2]) : parseInt(dateParts[2]);
      const date = new Date(year, month, day);
      
      transactions.push({
        date,
        description,
        amount,
        transactionType: type,
        bank: 'HDFC'
      });
    }
  }
  
  return transactions;
};

/**
 * Parse ICICI Bank statement - simplified implementation
 * @param {Object} pdfDocument - The PDF document object
 * @returns {Promise<Array>} Array of transaction objects
 */
const parseICICIStatement = async (pdfDocument) => {
  // Similar to HDFC parser but with ICICI format
  // This is a placeholder implementation
  return parseGenericStatement(pdfDocument, 'ICICI');
};

/**
 * Parse SBI Bank statement - simplified implementation 
 * @param {Object} pdfDocument - The PDF document object
 * @returns {Promise<Array>} Array of transaction objects
 */
const parseSBIStatement = async (pdfDocument) => {
  // Similar to HDFC parser but with SBI format
  // This is a placeholder implementation
  return parseGenericStatement(pdfDocument, 'SBI');
};

/**
 * Generic PDF statement parser
 * @param {Object} pdfDocument - The PDF document object
 * @param {string} bankName - Bank name to use in the transactions
 * @returns {Promise<Array>} Array of transaction objects
 */
const parseGenericStatement = async (pdfDocument, bankName = 'UNKNOWN') => {
  const transactions = [];
  
  // Get number of pages
  const numPages = pdfDocument.numPages;
  
  // Generic date and amount regex patterns
  const dateRegex = /\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}/g;
  const amountRegex = /[\d,]+\.\d{2}/g;
  
  // Process each page
  for (let i = 1; i <= numPages; i++) {
    const page = await pdfDocument.getPage(i);
    const textContent = await page.getTextContent();
    const text = textContent.items.map(item => item.str).join(' ');
    
    // Look for dates and amounts (this is a very simplified approach)
    const dates = text.match(dateRegex) || [];
    const amounts = text.match(amountRegex) || [];
    
    // If we have both dates and amounts, try to construct transactions
    const minLength = Math.min(dates.length, amounts.length);
    
    for (let j = 0; j < minLength; j++) {
      const dateStr = dates[j];
      const amountStr = amounts[j].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      
      // Convert date string to Date object (assuming DD/MM/YYYY format)
      let date;
      try {
        const dateParts = dateStr.split(/[\/\-]/);
        const month = parseInt(dateParts[1]) - 1; // Months are 0-indexed in JS
        const day = parseInt(dateParts[0]);
        const year = dateParts[2].length === 2 ? 2000 + parseInt(dateParts[2]) : parseInt(dateParts[2]);
        date = new Date(year, month, day);
      } catch (e) {
        date = new Date(); // Fallback to current date if parsing fails
      }
      
      transactions.push({
        date,
        description: `Transaction on ${dateStr}`, // Generic description
        amount,
        transactionType: Math.random() > 0.5 ? 'credit' : 'debit', // Random type for demo
        bank: bankName
      });
    }
  }
  
  return transactions;
};

module.exports = {
  parsePDF
}; 
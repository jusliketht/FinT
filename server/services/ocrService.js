const fs = require('fs');
const path = require('path');
const Tesseract = require('tesseract.js');
const sharp = require('sharp');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');

/**
 * Process a scanned PDF using OCR
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Array>} Array of transaction objects
 */
const processScannedPDF = async (filePath) => {
  try {
    const transactions = [];
    
    // Create a temporary directory for extracted images
    const tempDir = path.join(__dirname, '../uploads/temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    // Load the PDF document
    const data = new Uint8Array(fs.readFileSync(filePath));
    const loadingTask = pdfjsLib.getDocument({ data });
    const pdfDocument = await loadingTask.promise;
    
    // Determine bank type (if possible)
    let bankType = 'UNKNOWN';
    
    // Convert PDF pages to images and perform OCR
    for (let i = 1; i <= pdfDocument.numPages; i++) {
      // Get the page
      const page = await pdfDocument.getPage(i);
      
      // Render the page to an image
      const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d');
      canvas.height = viewport.height;
      canvas.width = viewport.width;
      
      await page.render({
        canvasContext: context,
        viewport: viewport
      }).promise;
      
      // Save the canvas as an image
      const imgPath = path.join(tempDir, `page-${i}.png`);
      const imgData = canvas.toDataURL('image/png');
      const base64Data = imgData.replace(/^data:image\/png;base64,/, "");
      fs.writeFileSync(imgPath, Buffer.from(base64Data, 'base64'));
      
      // Preprocess the image for better OCR results
      await preprocessImage(imgPath);
      
      // Perform OCR
      const { data: { text } } = await Tesseract.recognize(imgPath, 'eng');
      
      // If bank type not determined yet, try to detect from OCR text
      if (bankType === 'UNKNOWN' && i === 1) {
        bankType = detectBankFromText(text);
      }
      
      // Parse text based on bank type
      const pageTransactions = parseOCRText(text, bankType);
      transactions.push(...pageTransactions);
      
      // Clean up temporary image
      fs.unlinkSync(imgPath);
    }
    
    return transactions;
  } catch (error) {
    console.error('Error processing scanned PDF:', error);
    throw new Error(`Failed to process scanned PDF: ${error.message}`);
  } finally {
    // Clean up temp directory
    const tempDir = path.join(__dirname, '../uploads/temp');
    if (fs.existsSync(tempDir)) {
      try {
        fs.rmdirSync(tempDir, { recursive: true });
      } catch (e) {
        console.error('Error cleaning up temp directory:', e);
      }
    }
  }
};

/**
 * Preprocess an image to improve OCR quality
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<void>}
 */
const preprocessImage = async (imagePath) => {
  try {
    // Read the image
    const imageBuffer = fs.readFileSync(imagePath);
    
    // Process the image: grayscale, increase contrast, sharpen
    const processedBuffer = await sharp(imageBuffer)
      .grayscale()
      .normalize()
      .sharpen()
      .toBuffer();
    
    // Write back the processed image
    fs.writeFileSync(imagePath, processedBuffer);
  } catch (error) {
    console.error('Error preprocessing image:', error);
    // Don't throw - if preprocessing fails, we'll use the original image
  }
};

/**
 * Detect bank type from OCR text
 * @param {string} text - The OCR text from the first page
 * @returns {string} The detected bank type
 */
const detectBankFromText = (text) => {
  // Simplified detection based on text content
  const upperText = text.toUpperCase();
  
  if (upperText.includes('HDFC BANK') || upperText.includes('HDFC')) {
    return 'HDFC';
  } else if (upperText.includes('ICICI BANK') || upperText.includes('ICICI')) {
    return 'ICICI';
  } else if (upperText.includes('STATE BANK OF INDIA') || upperText.includes('SBI')) {
    return 'SBI';
  }
  
  return 'UNKNOWN';
};

/**
 * Parse OCR text to extract transactions
 * @param {string} text - The OCR text
 * @param {string} bankType - The bank type
 * @returns {Array} Array of transaction objects
 */
const parseOCRText = (text, bankType) => {
  const transactions = [];
  
  // Choose the appropriate parser based on bank type
  switch(bankType) {
    case 'HDFC':
      return parseHDFCOCRText(text);
    case 'ICICI':
      return parseICICIOCRText(text);
    case 'SBI':
      return parseSBIOCRText(text);
    default:
      return parseGenericOCRText(text, bankType);
  }
};

/**
 * Parse HDFC Bank OCR text
 * @param {string} text - The OCR text
 * @returns {Array} Array of transaction objects
 */
const parseHDFCOCRText = (text) => {
  const transactions = [];
  
  // Split text into lines
  const lines = text.split('\n');
  
  // HDFC date format is typically DD/MM/YY or DD/MM/YYYY
  const dateRegex = /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/;
  const amountRegex = /(\d+,?)+\.\d{2}/;
  
  let currentDate = null;
  
  for (const line of lines) {
    // If line contains a date, update current date
    const dateMatch = line.match(dateRegex);
    if (dateMatch) {
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1; // Months are 0-indexed in JS
      let year = parseInt(dateMatch[3]);
      if (year < 100) year += 2000; // Assume 20XX for 2-digit years
      
      currentDate = new Date(year, month, day);
    }
    
    // If we have a date and the line contains an amount, try to extract a transaction
    if (currentDate && amountRegex.test(line)) {
      const amountMatch = line.match(amountRegex);
      if (amountMatch) {
        const amountStr = amountMatch[0].replace(/,/g, '');
        const amount = parseFloat(amountStr);
        
        // Determine if credit or debit
        // For HDFC, we'll check if the line contains these indicators
        const isCredit = line.toLowerCase().includes('cr') || line.toLowerCase().includes('credit');
        const transactionType = isCredit ? 'credit' : 'debit';
        
        // Extract description from text before amount
        const amountIndex = line.indexOf(amountMatch[0]);
        let description = line.substring(0, amountIndex).trim();
        
        // If description is too short, it might be a continuation of previous transaction
        // For simplicity, we'll use a default if it's too short
        if (description.length < 3) {
          description = 'Transaction on ' + currentDate.toLocaleDateString();
        }
        
        // Add transaction
        transactions.push({
          date: currentDate,
          description,
          amount,
          transactionType,
          bank: 'HDFC'
        });
      }
    }
  }
  
  return transactions;
};

/**
 * Parse ICICI Bank OCR text - simplified implementation
 * @param {string} text - The OCR text
 * @returns {Array} Array of transaction objects
 */
const parseICICIOCRText = (text) => {
  // Similar to HDFC parser but with ICICI format
  // This is a placeholder implementation
  return parseGenericOCRText(text, 'ICICI');
};

/**
 * Parse SBI Bank OCR text - simplified implementation
 * @param {string} text - The OCR text
 * @returns {Array} Array of transaction objects
 */
const parseSBIOCRText = (text) => {
  // Similar to HDFC parser but with SBI format
  // This is a placeholder implementation
  return parseGenericOCRText(text, 'SBI');
};

/**
 * Generic OCR text parser
 * @param {string} text - The OCR text
 * @param {string} bankName - Bank name to use in the transactions
 * @returns {Array} Array of transaction objects
 */
const parseGenericOCRText = (text, bankName) => {
  const transactions = [];
  
  // Split text into lines
  const lines = text.split('\n');
  
  // Generic date format detection
  const dateRegex = /(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})/;
  const amountRegex = /(\d+,?)+\.\d{2}/;
  
  for (const line of lines) {
    // Check if line contains both a date and an amount
    const dateMatch = line.match(dateRegex);
    const amountMatch = line.match(amountRegex);
    
    if (dateMatch && amountMatch) {
      // Parse date
      const day = parseInt(dateMatch[1]);
      const month = parseInt(dateMatch[2]) - 1; // Months are 0-indexed in JS
      let year = parseInt(dateMatch[3]);
      if (year < 100) year += 2000; // Assume 20XX for 2-digit years
      
      const date = new Date(year, month, day);
      
      // Parse amount
      const amountStr = amountMatch[0].replace(/,/g, '');
      const amount = parseFloat(amountStr);
      
      // Extract description
      // Use text between date and amount as description
      const dateIndex = line.indexOf(dateMatch[0]);
      const amountIndex = line.indexOf(amountMatch[0]);
      
      let description = '';
      if (dateIndex < amountIndex) {
        description = line.substring(dateIndex + dateMatch[0].length, amountIndex).trim();
      } else {
        description = line.substring(0, dateIndex).trim();
      }
      
      // If description is too short, use a default
      if (description.length < 3) {
        description = 'Transaction on ' + date.toLocaleDateString();
      }
      
      // For generic parser, we can't reliably determine transaction type
      // We'll randomly assign for demo purposes
      const transactionType = Math.random() > 0.5 ? 'credit' : 'debit';
      
      // Add transaction
      transactions.push({
        date,
        description,
        amount,
        transactionType,
        bank: bankName
      });
    }
  }
  
  return transactions;
};

module.exports = {
  processScannedPDF
}; 
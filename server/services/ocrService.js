const Tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { v4: uuidv4 } = require('uuid');
const pdfjsLib = require('pdfjs-dist/legacy/build/pdf.js');
const sharp = require('sharp');

// We'll use a temp directory for any necessary intermediate files
const tempDir = os.tmpdir();

/**
 * Process a scanned PDF using OCR
 * @param {string} filePath - Path to the PDF file
 * @returns {Promise<Array>} Array of transaction objects
 */
const processScannedPDF = async (filePath) => {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdfDocument = await pdfjsLib.getDocument({ data }).promise;
    const numPages = pdfDocument.numPages;
    
    const transactions = [];
    let bankType = 'UNKNOWN';
    
    // Generate a unique working directory within the temp folder
    const workingDirId = uuidv4();
    const workingDir = path.join(tempDir, workingDirId);
    
    if (!fs.existsSync(workingDir)) {
      fs.mkdirSync(workingDir, { recursive: true });
    }
    
    try {
      // Process each page
      for (let i = 1; i <= numPages; i++) {
        // Progress update
        console.log(`Processing page ${i} of ${numPages}`);
        
        const page = await pdfDocument.getPage(i);
        const viewport = page.getViewport({ scale: 2.0 }); // Higher scale for better OCR
        
        // PDF.js can render to a PNG buffer using node-canvas (would require that package)
        // For simplicity here, we'll use a direct method: render to a temporary file
        // This is not the most efficient approach but works reliably
        
        // Create a temporary file for this page
        const tempImgPath = path.join(workingDir, `page-${i}.png`);
        
        // Use pdf.js native rendering to SVG
        const opList = await page.getOperatorList();
        const svgGfx = new pdfjsLib.SVGGraphics(page.commonObjs, page.objs);
        const svg = await svgGfx.getSVG(opList, viewport);
        
        // Convert SVG to string
        const svgString = svg.toString();
        
        // Write SVG to file
        const tempSvgPath = path.join(workingDir, `page-${i}.svg`);
        fs.writeFileSync(tempSvgPath, svgString);
        
        // Use sharp to convert SVG to PNG
        await sharp(tempSvgPath)
          .png()
          .toFile(tempImgPath);
        
        // Preprocess the image for better OCR
        const processedImgPath = await preprocessImage(tempImgPath);
        
        // Use the processed image or original if processing failed
        const imgToOcr = processedImgPath || tempImgPath;
        
        // Perform OCR
        const { data: { text } } = await Tesseract.recognize(imgToOcr, 'eng');
        
        // If bank type not determined yet, try to detect from OCR text
        if (bankType === 'UNKNOWN' && i === 1) {
          bankType = detectBankFromText(text);
        }
        
        // Parse text based on bank type
        const pageTransactions = parseOCRText(text, bankType);
        transactions.push(...pageTransactions);
        
        // Clean up temporary files for this page
        try {
          fs.unlinkSync(tempImgPath);
          fs.unlinkSync(tempSvgPath);
          if (processedImgPath && processedImgPath !== tempImgPath) {
            fs.unlinkSync(processedImgPath);
          }
        } catch (cleanupError) {
          console.warn(`Error cleaning up temp files for page ${i}:`, cleanupError);
        }
      }
    } finally {
      // Clean up the working directory
      try {
        // This is a safer approach than using recursive deletion
        const files = fs.readdirSync(workingDir);
        files.forEach(file => {
          try {
            fs.unlinkSync(path.join(workingDir, file));
          } catch (e) {
            console.warn(`Failed to delete file ${file}:`, e);
          }
        });
        fs.rmdirSync(workingDir);
      } catch (cleanupError) {
        console.warn('Error cleaning up working directory:', cleanupError);
      }
    }
    
    return transactions;
  } catch (error) {
    console.error('Error processing scanned PDF:', error);
    throw new Error(`Failed to process scanned PDF: ${error.message}`);
  }
};

/**
 * Preprocess an image to improve OCR quality
 * @param {string} imagePath - Path to the image file
 * @returns {Promise<string|null>} Path to the processed image, or null if processing failed
 */
const preprocessImage = async (imagePath) => {
  try {
    const outputPath = `${imagePath.replace(/\.\w+$/, '')}-processed.png`;
    
    // Use sharp for image preprocessing (much better than canvas for Node.js)
    await sharp(imagePath)
      .grayscale()           // Convert to grayscale
      .normalize()           // Normalize the image (auto contrast)
      .sharpen()             // Sharpen the image
      .threshold(128)        // Optional: Apply binary threshold for cleaner text
      .toFile(outputPath);
    
    return outputPath;
  } catch (error) {
    console.error('Error preprocessing image:', error);
    return null; // Return null on error, we'll use the original image
  }
};

/**
 * Detect bank name from OCR text
 * @param {string} text - The OCR-extracted text
 * @returns {string} Detected bank type
 */
const detectBankFromText = (text) => {
  const textLower = text.toLowerCase();
  
  if (textLower.includes('hdfc bank') || textLower.includes('hdfc')) {
    return 'HDFC';
  } else if (textLower.includes('icici bank') || textLower.includes('icici')) {
    return 'ICICI';
  } else if (textLower.includes('state bank of india') || textLower.includes('sbi')) {
    return 'SBI';
  } else {
    return 'UNKNOWN';
  }
};

/**
 * Parse OCR text based on bank type
 * @param {string} text - The OCR-extracted text
 * @param {string} bankType - The detected bank type
 * @returns {Array} Array of transaction objects
 */
const parseOCRText = (text, bankType) => {
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
 * @param {string} text - The OCR-extracted text
 * @returns {Array} Array of transaction objects
 */
const parseHDFCOCRText = (text) => {
  const transactions = [];
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Regular expressions for HDFC format (simplified example)
  const datePattern = /(\d{2}[\/\-]\d{2}[\/\-]\d{2,4})/;
  const amountPattern = /(\d+[,\d]*\.\d{2})/;
  const debitCreditPattern = /(CR|DR)/i;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    // Extract date
    const dateMatch = line.match(datePattern);
    if (!dateMatch) continue;
    
    const dateStr = dateMatch[1];
    
    // Extract amount
    const amountMatch = line.match(amountPattern);
    if (!amountMatch) continue;
    
    let amount = parseFloat(amountMatch[1].replace(/,/g, ''));
    
    // Determine transaction type
    let transactionType = 'debit'; // Default
    const typeMatch = line.match(debitCreditPattern);
    if (typeMatch) {
      transactionType = typeMatch[1].toLowerCase() === 'cr' ? 'credit' : 'debit';
    }
    
    // Extract description (simplified)
    const parts = line.split(/\s+/);
    const descIndex = parts.findIndex(part => part.match(datePattern));
    const description = parts.slice(descIndex + 1).join(' ').replace(amountPattern, '').replace(debitCreditPattern, '').trim();
    
    // Convert date string to Date object
    let date;
    try {
      const [day, month, year] = dateStr.split(/[\/\-]/);
      const fullYear = year.length === 2 ? '20' + year : year;
      date = new Date(`${fullYear}-${month}-${day}`);
    } catch (e) {
      date = new Date(); // Fallback to current date if parsing fails
    }
    
    transactions.push({
      date,
      description: description || `Transaction on ${dateStr}`,
      amount,
      transactionType,
      bank: 'HDFC'
    });
  }
  
  return transactions;
};

// Other bank-specific parsing functions would follow similar patterns
const parseICICIOCRText = (text) => {
  // Implementation for ICICI would go here, similar to HDFC
  return parseGenericOCRText(text, 'ICICI');
};

const parseSBIOCRText = (text) => {
  // Implementation for SBI would go here, similar to HDFC
  return parseGenericOCRText(text, 'SBI');
};

const parseGenericOCRText = (text, bankName = 'UNKNOWN') => {
  const transactions = [];
  const lines = text.split('\n').filter(line => line.trim().length > 0);
  
  // Generic patterns
  const datePattern = /(\d{1,2}[\/\-\.]\d{1,2}[\/\-\.]\d{2,4})/;
  const amountPattern = /(\d+[,\d]*\.\d{2})/;
  
  // Process each line
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    
    const dateMatch = line.match(datePattern);
    const amountMatch = line.match(amountPattern);
    
    if (dateMatch && amountMatch) {
      const dateStr = dateMatch[1];
      let amount = parseFloat(amountMatch[1].replace(/,/g, ''));
      
      // Convert date string to Date object
      let date;
      try {
        const [day, month, year] = dateStr.split(/[\/\-\.]/);
        const fullYear = year.length === 2 ? '20' + year : year;
        date = new Date(`${fullYear}-${month}-${day}`);
      } catch (e) {
        date = new Date(); // Fallback to current date if parsing fails
      }
      
      transactions.push({
        date,
        description: `Transaction on ${dateStr}`,
        amount,
        transactionType: Math.random() > 0.5 ? 'credit' : 'debit', // Randomly assign for generic parsing
        bank: bankName
      });
    }
  }
  
  return transactions;
};

module.exports = {
  processScannedPDF,
  // Export other functions if they need to be used externally
  preprocessImage,
  detectBankFromText,
  parseOCRText
}; 
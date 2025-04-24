const PdfPrinter = require('pdfmake');
const fs = require('fs');
const path = require('path');

// Define default fallback font if custom fonts are not available
const defaultFont = {
  Roboto: {
    normal: 'Helvetica',
    bold: 'Helvetica-Bold',
    italics: 'Helvetica-Oblique',
    bolditalics: 'Helvetica-BoldOblique'
  }
};

// Try to load custom fonts, fall back to default if not available
const getFonts = () => {
  try {
    // Check if custom fonts exist
    const fontPaths = {
      normal: path.join(__dirname, '../assets/fonts/Roboto-Regular.ttf'),
      bold: path.join(__dirname, '../assets/fonts/Roboto-Medium.ttf'),
      italics: path.join(__dirname, '../assets/fonts/Roboto-Italic.ttf'),
      bolditalics: path.join(__dirname, '../assets/fonts/Roboto-MediumItalic.ttf')
    };
    
    // Verify all fonts exist
    const allFontsExist = Object.values(fontPaths).every(fontPath => fs.existsSync(fontPath));
    
    if (allFontsExist) {
      return {
        Roboto: fontPaths
      };
    }
    
    console.warn('Custom fonts not found. Using default fonts.');
    return defaultFont;
  } catch (error) {
    console.error('Error loading fonts:', error);
    return defaultFont;
  }
};

// Initialize the printer with the fonts
const printer = new PdfPrinter(getFonts());

/**
 * Format currency amount
 * @param {number} amount - Amount to format
 * @returns {string} Formatted amount
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2
  }).format(amount);
};

/**
 * Format date
 * @param {Date} date - Date to format
 * @returns {string} Formatted date
 */
const formatDate = (date) => {
  return date.toLocaleDateString('en-IN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  });
};

/**
 * Create header for reports
 * @param {string} title - Report title
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 * @returns {Array} Document header definition
 */
const createHeader = (title, startDate = null, endDate = null) => {
  const header = [
    {
      text: 'FinT Financial Management',
      style: 'companyName'
    },
    {
      text: title,
      style: 'reportTitle'
    }
  ];
  
  if (startDate && endDate) {
    header.push({
      text: `Period: ${formatDate(startDate)} to ${formatDate(endDate)}`,
      style: 'reportPeriod'
    });
  } else if (startDate || endDate) {
    const date = startDate || endDate;
    header.push({
      text: `As of: ${formatDate(date)}`,
      style: 'reportPeriod'
    });
  }
  
  header.push({
    text: `Generated on: ${formatDate(new Date())}`,
    style: 'generatedDate'
  });
  
  return header;
};

/**
 * Generate Balance Sheet PDF
 * @param {Object} balanceSheet - Balance sheet data
 * @param {Date} asOfDate - Balance sheet date
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateBalanceSheetPDF = async (balanceSheet, asOfDate) => {
  const docDefinition = {
    content: [
      ...createHeader('Balance Sheet', null, asOfDate),
      { text: '', margin: [0, 20] },
      
      // Assets section
      { text: 'Assets', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Account', style: 'tableHeader' },
              { text: 'Code', style: 'tableHeader' },
              { text: 'Balance', style: 'tableHeader' }
            ],
            ...balanceSheet.assets.map(account => [
              account.name,
              account.code,
              { text: formatCurrency(account.balance), alignment: 'right' }
            ]),
            [
              { text: 'Total Assets', style: 'totalRow' },
              '',
              { text: formatCurrency(balanceSheet.totalAssets), style: 'totalRow', alignment: 'right' }
            ]
          ]
        }
      },
      { text: '', margin: [0, 20] },
      
      // Liabilities section
      { text: 'Liabilities', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Account', style: 'tableHeader' },
              { text: 'Code', style: 'tableHeader' },
              { text: 'Balance', style: 'tableHeader' }
            ],
            ...balanceSheet.liabilities.map(account => [
              account.name,
              account.code,
              { text: formatCurrency(account.balance), alignment: 'right' }
            ]),
            [
              { text: 'Total Liabilities', style: 'totalRow' },
              '',
              { text: formatCurrency(balanceSheet.totalLiabilities), style: 'totalRow', alignment: 'right' }
            ]
          ]
        }
      },
      { text: '', margin: [0, 20] },
      
      // Equity section
      { text: 'Equity', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Account', style: 'tableHeader' },
              { text: 'Code', style: 'tableHeader' },
              { text: 'Balance', style: 'tableHeader' }
            ],
            ...balanceSheet.equity.map(account => [
              account.name,
              account.code,
              { text: formatCurrency(account.balance), alignment: 'right' }
            ]),
            [
              { text: 'Total Equity', style: 'totalRow' },
              '',
              { text: formatCurrency(balanceSheet.totalEquity), style: 'totalRow', alignment: 'right' }
            ]
          ]
        }
      },
      { text: '', margin: [0, 20] },
      
      // Total liabilities and equity
      {
        table: {
          headerRows: 0,
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Total Liabilities and Equity', style: 'grandTotal' },
              { text: formatCurrency(balanceSheet.totalLiabilities + balanceSheet.totalEquity), style: 'grandTotal', alignment: 'right' }
            ]
          ]
        }
      }
    ],
    styles: getDefaultStyles()
  };
  
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      
      pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      pdfDoc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Profit & Loss Statement PDF
 * @param {Object} profitLoss - Profit & loss data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateProfitLossPDF = async (profitLoss, startDate, endDate) => {
  const docDefinition = {
    content: [
      ...createHeader('Profit & Loss Statement', startDate, endDate),
      { text: '', margin: [0, 20] },
      
      // Revenue section
      { text: 'Revenue', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Account', style: 'tableHeader' },
              { text: 'Code', style: 'tableHeader' },
              { text: 'Amount', style: 'tableHeader' }
            ],
            ...profitLoss.revenue.map(account => [
              account.name,
              account.code,
              { text: formatCurrency(account.balance), alignment: 'right' }
            ]),
            [
              { text: 'Total Revenue', style: 'totalRow' },
              '',
              { text: formatCurrency(profitLoss.totalRevenue), style: 'totalRow', alignment: 'right' }
            ]
          ]
        }
      },
      { text: '', margin: [0, 20] },
      
      // Expenses section
      { text: 'Expenses', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Account', style: 'tableHeader' },
              { text: 'Code', style: 'tableHeader' },
              { text: 'Amount', style: 'tableHeader' }
            ],
            ...profitLoss.expenses.map(account => [
              account.name,
              account.code,
              { text: formatCurrency(account.balance), alignment: 'right' }
            ]),
            [
              { text: 'Total Expenses', style: 'totalRow' },
              '',
              { text: formatCurrency(profitLoss.totalExpenses), style: 'totalRow', alignment: 'right' }
            ]
          ]
        }
      },
      { text: '', margin: [0, 20] },
      
      // Net Income
      {
        table: {
          headerRows: 0,
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Net Income', style: 'grandTotal' },
              { text: formatCurrency(profitLoss.netIncome), style: 'grandTotal', alignment: 'right' }
            ]
          ]
        }
      }
    ],
    styles: getDefaultStyles()
  };
  
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      
      pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      pdfDoc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Generate Cash Flow Statement PDF
 * @param {Object} cashFlow - Cash flow data
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 * @returns {Promise<Buffer>} PDF buffer
 */
const generateCashFlowPDF = async (cashFlow, startDate, endDate) => {
  const docDefinition = {
    content: [
      ...createHeader('Cash Flow Statement', startDate, endDate),
      { text: '', margin: [0, 20] },
      
      // Operating Activities section
      { text: 'Operating Activities', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Description', style: 'tableHeader' },
              { text: 'Date', style: 'tableHeader' },
              { text: 'Amount', style: 'tableHeader' }
            ],
            ...cashFlow.operating.map(transaction => [
              transaction.description,
              formatDate(transaction.date),
              { 
                text: formatCurrency(transaction.transactionType === 'credit' ? transaction.amount : -transaction.amount), 
                alignment: 'right' 
              }
            ]),
            [
              { text: 'Net Cash from Operating Activities', style: 'totalRow', colSpan: 2 },
              {},
              { text: formatCurrency(cashFlow.operatingTotal), style: 'totalRow', alignment: 'right' }
            ]
          ]
        }
      },
      { text: '', margin: [0, 20] },
      
      // Investing Activities section
      { text: 'Investing Activities', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Description', style: 'tableHeader' },
              { text: 'Date', style: 'tableHeader' },
              { text: 'Amount', style: 'tableHeader' }
            ],
            ...cashFlow.investing.map(transaction => [
              transaction.description,
              formatDate(transaction.date),
              { 
                text: formatCurrency(transaction.transactionType === 'credit' ? transaction.amount : -transaction.amount), 
                alignment: 'right' 
              }
            ]),
            [
              { text: 'Net Cash from Investing Activities', style: 'totalRow', colSpan: 2 },
              {},
              { text: formatCurrency(cashFlow.investingTotal), style: 'totalRow', alignment: 'right' }
            ]
          ]
        }
      },
      { text: '', margin: [0, 20] },
      
      // Financing Activities section
      { text: 'Financing Activities', style: 'sectionHeader' },
      {
        table: {
          headerRows: 1,
          widths: ['*', 'auto', 'auto'],
          body: [
            [
              { text: 'Description', style: 'tableHeader' },
              { text: 'Date', style: 'tableHeader' },
              { text: 'Amount', style: 'tableHeader' }
            ],
            ...cashFlow.financing.map(transaction => [
              transaction.description,
              formatDate(transaction.date),
              { 
                text: formatCurrency(transaction.transactionType === 'credit' ? transaction.amount : -transaction.amount), 
                alignment: 'right' 
              }
            ]),
            [
              { text: 'Net Cash from Financing Activities', style: 'totalRow', colSpan: 2 },
              {},
              { text: formatCurrency(cashFlow.financingTotal), style: 'totalRow', alignment: 'right' }
            ]
          ]
        }
      },
      { text: '', margin: [0, 20] },
      
      // Net increase/decrease in cash
      {
        table: {
          headerRows: 0,
          widths: ['*', 'auto'],
          body: [
            [
              { text: 'Net Increase/Decrease in Cash', style: 'grandTotal' },
              { text: formatCurrency(cashFlow.netCashFlow), style: 'grandTotal', alignment: 'right' }
            ]
          ]
        }
      }
    ],
    styles: getDefaultStyles()
  };
  
  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  
  return new Promise((resolve, reject) => {
    try {
      const chunks = [];
      
      pdfDoc.on('data', (chunk) => {
        chunks.push(chunk);
      });
      
      pdfDoc.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      
      pdfDoc.end();
    } catch (error) {
      reject(error);
    }
  });
};

/**
 * Get default styles for PDFs
 * @returns {Object} Style definitions
 */
const getDefaultStyles = () => {
  return {
    companyName: {
      fontSize: 16,
      bold: true,
      margin: [0, 0, 0, 10]
    },
    reportTitle: {
      fontSize: 14,
      bold: true,
      margin: [0, 10, 0, 5]
    },
    reportPeriod: {
      fontSize: 10,
      margin: [0, 5, 0, 0]
    },
    generatedDate: {
      fontSize: 10,
      italics: true,
      margin: [0, 5, 0, 15]
    },
    sectionHeader: {
      fontSize: 12,
      bold: true,
      margin: [0, 10, 0, 10],
      decoration: 'underline'
    },
    tableHeader: {
      bold: true,
      fontSize: 10,
      color: 'black',
      fillColor: '#eeeeee'
    },
    totalRow: {
      bold: true,
      fontSize: 10
    },
    grandTotal: {
      bold: true,
      fontSize: 11
    }
  };
};

module.exports = {
  generateBalanceSheetPDF,
  generateProfitLossPDF,
  generateCashFlowPDF
}; 
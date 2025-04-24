const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Transaction = require('../models/Transaction');
const pdfParser = require('../services/pdfParser');
const excelParser = require('../services/excelParser');
const ocrService = require('../services/ocrService');
const ruleEngine = require('../services/ruleEngine');
const fileProcessingQueue = require('../queues/fileProcessingQueue');

// Set up multer storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

// Set up file filter
const fileFilter = (req, file, cb) => {
  // Accept only PDF and Excel files
  if (file.mimetype === 'application/pdf' || 
      file.mimetype === 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' ||
      file.mimetype === 'application/vnd.ms-excel') {
    cb(null, true);
  } else {
    cb(new Error('Only PDF and Excel files are allowed!'), false);
  }
};

// Initialize multer upload
const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB max file size
  fileFilter: fileFilter
});

// Helper function to handle file processing
const processFile = async (filePath, fileName, userId) => {
  try {
    let transactions = [];
    const fileExt = path.extname(fileName).toLowerCase();

    // Process based on file type
    if (fileExt === '.pdf') {
      // Check if it's a digital PDF or scanned PDF (simplified check)
      const buffer = fs.readFileSync(filePath);
      const isDigital = buffer.includes('%PDF');

      if (isDigital) {
        transactions = await pdfParser.parsePDF(filePath);
      } else {
        // Use OCR for scanned PDFs
        transactions = await ocrService.processScannedPDF(filePath);
      }
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      transactions = await excelParser.parseExcel(filePath);
    }

    // Apply rules to categorize transactions
    const categorizedTransactions = await ruleEngine.categorizeTransactions(transactions);

    // Save transactions to database
    const savedTransactions = await Transaction.insertMany(
      categorizedTransactions.map(transaction => ({
        ...transaction,
        sourceFile: fileName,
        createdBy: userId
      }))
    );

    return savedTransactions;
  } catch (error) {
    console.error('Error processing file:', error);
    throw error;
  }
};

// @desc    Upload files (PDF or Excel)
// @route   POST /api/upload
// @access  Private (accountant, admin)
const uploadFiles = async (req, res) => {
  try {
    // multer middleware will attach file info to req.file
    if (!req.file) {
      return res.status(400).json({ message: 'No file uploaded' });
    }

    // Get file info
    const filePath = req.file.path;
    const fileName = req.file.filename;
    const userId = req.user._id; // Assuming user info is attached by auth middleware

    // Add job to the queue instead of processing synchronously
    const job = await fileProcessingQueue.add({
      filePath,
      fileName,
      userId,
      // You could include organizationId as well if needed
      ...(req.user.organizationId && { organizationId: req.user.organizationId })
    });

    console.log(`Job added to queue: ${job.id} for file ${fileName}`);

    // Return a 202 Accepted response
    res.status(202).json({
      message: 'File upload accepted for processing',
      fileName: fileName,
      jobId: job.id,
      status: 'processing'
    });
  } catch (error) {
    console.error('Upload error:', error);
    
    // Clean up the uploaded file if queueing fails
    if (req.file && req.file.path) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error("Error deleting file after upload failure:", err);
      });
    }
    
    res.status(500).json({ message: 'Error queueing file for processing', error: error.message });
  }
};

// Export the controller along with multer middleware
module.exports = {
  uploadMiddleware: upload.single('file'),
  uploadFiles
}; 
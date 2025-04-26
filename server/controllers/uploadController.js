const multer = require('multer');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const pdfParser = require('../services/pdfParser');
const excelParser = require('../services/excelParser');
const ocrService = require('../services/ocrService');
const ruleEngine = require('../services/ruleEngine');
const fileProcessingQueue = require('../queues/fileProcessingQueue');
const { uploadFile } = require('../utils/supabaseUtils');

const prisma = new PrismaClient();

// Set up multer storage in memory
const storage = multer.memoryStorage();

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
const processFile = async (fileBuffer, fileName, userId) => {
  try {
    let transactions = [];
    const fileExt = path.extname(fileName).toLowerCase();

    // Upload file to Supabase Storage
    const uploadResult = await uploadFile(fileBuffer, fileName);
    const filePath = uploadResult.path;

    // Process based on file type
    if (fileExt === '.pdf') {
      // Check if it's a digital PDF or scanned PDF
      const isDigital = fileBuffer.includes('%PDF');

      if (isDigital) {
        transactions = await pdfParser.parsePDFBuffer(fileBuffer);
      } else {
        // Use OCR for scanned PDFs
        transactions = await ocrService.processScannedPDFBuffer(fileBuffer);
      }
    } else if (fileExt === '.xlsx' || fileExt === '.xls') {
      transactions = await excelParser.parseExcelBuffer(fileBuffer);
    }

    // Apply rules to categorize transactions
    const categorizedTransactions = await ruleEngine.categorizeTransactions(transactions);

    // Save transactions to database using Prisma
    const savedTransactions = await prisma.transaction.createMany({
      data: categorizedTransactions.map(transaction => ({
        ...transaction,
        sourceFile: filePath, // Store Supabase path instead of local file path
        createdById: userId
      }))
    });

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
    const fileBuffer = req.file.buffer;
    const fileName = req.file.originalname;
    const userId = req.user.id;

    // Add job to the queue instead of processing synchronously
    const job = await fileProcessingQueue.add({
      fileBuffer,
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
    res.status(500).json({ message: 'Error queueing file for processing', error: error.message });
  }
};

// Export the controller along with multer middleware
module.exports = {
  uploadMiddleware: upload.single('file'),
  uploadFiles
}; 
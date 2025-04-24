const Queue = require('bull');
const path = require('path');
const fs = require('fs');
const pdfParser = require('../services/pdfParser');
const excelParser = require('../services/excelParser');
const ocrService = require('../services/ocrService');
const ruleEngine = require('../services/ruleEngine');
const prisma = require('../db');  // Import Prisma client

// Create a Bull queue
const fileProcessingQueue = new Queue('file-processing', {
  redis: {
    port: process.env.REDIS_PORT || 6379,
    host: process.env.REDIS_HOST || 'localhost',
    password: process.env.REDIS_PASSWORD || undefined,
  },
  defaultJobOptions: {
    attempts: 3,  // Retry the job up to 3 times
    backoff: {
      type: 'exponential',
      delay: 1000, // 1s, 2s, 4s
    },
    removeOnComplete: true,  // Clean up completed jobs
  }
});

// Define the job processor
fileProcessingQueue.process(async (job) => {
  const { filePath, fileName, userId } = job.data;
  
  try {
    console.log(`Processing file: ${fileName} for user: ${userId}`);
    
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      throw new Error(`File not found: ${filePath}`);
    }
    
    // Determine file type based on extension
    const fileExt = path.extname(fileName).toLowerCase();
    let transactions = [];
    
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
    } else {
      throw new Error(`Unsupported file type: ${fileExt}`);
    }
    
    // Apply rules to categorize transactions
    const categorizedTransactions = await ruleEngine.categorizeTransactions(transactions, userId);
    
    // Save transactions to database (batch operation for better performance)
    const transactionData = categorizedTransactions.map(transaction => ({
      date: transaction.date,
      amount: transaction.amount,
      description: transaction.description,
      category: transaction.category,
      bank: transaction.bank,
      transactionType: transaction.transactionType,
      sourceFile: fileName,
      createdById: userId,
      // Include organizationId if available in the transaction data
      ...(transaction.organizationId && { organizationId: transaction.organizationId })
    }));
    
    // Use Prisma's createMany for batch insertion
    const result = await prisma.transaction.createMany({
      data: transactionData,
      skipDuplicates: true, // Optional - consider your business logic
    });
    
    console.log(`Successfully processed ${result.count} transactions from ${fileName}`);
    
    // Optionally, we can update some status table to indicate completion
    // await prisma.fileUpload.update({
    //   where: { id: fileUploadId },
    //   data: { status: 'completed', transactionCount: result.count }
    // });
    
    return { success: true, transactionCount: result.count };
  } catch (error) {
    console.error(`Error processing file ${fileName}:`, error);
    
    // Optionally update some status table to indicate error
    // await prisma.fileUpload.update({
    //   where: { id: fileUploadId },
    //   data: { status: 'error', error: error.message }
    // });
    
    // Rethrow the error to trigger Bull's retry mechanism
    throw error;
  }
});

// Event handlers for monitoring
fileProcessingQueue.on('completed', (job, result) => {
  console.log(`Job ${job.id} completed for file ${job.data.fileName}. Processed ${result.transactionCount} transactions.`);
});

fileProcessingQueue.on('failed', (job, error) => {
  console.error(`Job ${job.id} failed for file ${job.data.fileName}:`, error);
  
  // Clean up the uploaded file after all retries have failed
  if (job.attemptsMade >= job.opts.attempts) {
    try {
      if (fs.existsSync(job.data.filePath)) {
        fs.unlinkSync(job.data.filePath);
        console.log(`Cleaned up file ${job.data.filePath} after processing failure`);
      }
    } catch (unlinkError) {
      console.error(`Failed to clean up file ${job.data.filePath}:`, unlinkError);
    }
  }
});

module.exports = fileProcessingQueue; 
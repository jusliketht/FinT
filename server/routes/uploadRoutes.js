const express = require('express');
const { uploadMiddleware, uploadFiles } = require('../controllers/uploadController');
const { protect, checkRole } = require('../middleware/auth');

const router = express.Router();

// @route   POST /api/upload
// @desc    Upload files (PDF or Excel)
// @access  Private (accountant, admin)
router.post('/', 
  protect, 
  checkRole(['accountant', 'admin']), 
  uploadMiddleware, 
  uploadFiles
);

module.exports = router; 
const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const {
  registerUser,
  loginUser,
  getUserProfile,
  forgotPassword,
  resetPassword,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// @route   POST /register
// @desc    Register a new user
// @access  Public
router.post(
  '/register',
  [
    body('name').notEmpty().trim().withMessage('Name is required'),
    body('email').isEmail().normalizeEmail().withMessage('Please enter a valid email'),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  registerUser
);

// @route   POST /login
// @desc    Login user
// @access  Public
router.post(
  '/login',
  [
    body('email').isEmail().normalizeEmail(),
    body('password').exists()
  ],
  loginUser
);

// @route   GET /profile
// @desc    Get user profile
// @access  Private
router.get('/profile', protect, getUserProfile);

// @route   POST /forgot-password
// @desc    Request password reset
// @access  Public
router.post(
  '/forgot-password',
  [
    body('email').isEmail().normalizeEmail()
  ],
  forgotPassword
);

// @route   POST /reset-password
// @desc    Reset password
// @access  Public
router.post(
  '/reset-password',
  [
    body('token').exists(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long')
  ],
  resetPassword
);

module.exports = router; 
const express = require('express');
const router = express.Router();
const Account = require('../models/Account');
const { protect, authorize } = require('../middleware/auth');

// Get all accounts
router.get('/accounts', protect, async (req, res) => {
  try {
    const accounts = await Account.find().sort('code');
    res.json({
      success: true,
      data: accounts
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching accounts'
    });
  }
});

// Create new account
router.post('/accounts', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, code, type } = req.body;

    // Check if account code already exists
    const existingAccount = await Account.findOne({ code });
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Account code already exists'
      });
    }

    const account = await Account.create({
      name,
      code,
      type
    });

    res.status(201).json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error creating account'
    });
  }
});

// Update account
router.put('/accounts/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const { name, code, type } = req.body;

    // Check if new code conflicts with existing accounts
    const existingAccount = await Account.findOne({ 
      code, 
      _id: { $ne: req.params.id } 
    });
    
    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: 'Account code already exists'
      });
    }

    const account = await Account.findByIdAndUpdate(
      req.params.id,
      { name, code, type },
      { new: true, runValidators: true }
    );

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    res.json({
      success: true,
      data: account
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating account'
    });
  }
});

// Delete account
router.delete('/accounts/:id', protect, authorize('admin'), async (req, res) => {
  try {
    const account = await Account.findById(req.params.id);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: 'Account not found'
      });
    }

    // TODO: Add check if account is being used in any transactions
    // If used, prevent deletion

    await account.remove();

    res.json({
      success: true,
      data: {}
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error deleting account'
    });
  }
});

module.exports = router; 
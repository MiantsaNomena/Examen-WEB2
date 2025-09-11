const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const Transaction = require('../models/Expense');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = 'uploads/receipts';
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'receipt-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, PNG, and PDF files are allowed'));
    }
  }
});

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/expenses - Get all expenses with filtering
router.get('/', async (req, res) => {
  try {
    const { start, end, category, type, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    let expenses;
    
    // Build query based on filters
    if (start || end || category || type) {
      expenses = await Transaction.findWithFilters(userId, {
        start,
        end,
        category,
        type,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } else {
      expenses = await Transaction.findByUserId(userId, parseInt(limit), parseInt(offset));
    }
    
    res.json({
      message: 'Expenses retrieved successfully',
      expenses,
      total: expenses.length,
      filters: { start, end, category, type },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching expenses:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve expenses'
    });
  }
});

// GET /api/expenses/:id - Get single expense by ID
router.get('/:id', async (req, res) => {
  try {
    const expense = await Transaction.findById(req.params.id, req.user.id_utilisateur);
    
    if (!expense) {
      return res.status(404).json({ 
        error: 'Expense not found',
        message: 'The requested expense does not exist or you do not have access to it'
      });
    }
    
    res.json({
      message: 'Expense retrieved successfully',
      expense
    });
  } catch (error) {
    console.error('Error fetching expense:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve expense'
    });
  }
});

// POST /api/expenses - Create new expense with optional receipt
router.post('/', upload.single('receipt'), async (req, res) => {
  try {
    const { amount, date, categoryId, description, type = 'one-time', startDate, endDate } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!amount || !date) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Amount and date are required'
      });
    }

    // Validate amount is a positive number
    if (isNaN(amount) || parseFloat(amount) <= 0) {
      return res.status(400).json({ 
        error: 'Invalid amount',
        message: 'Amount must be a positive number'
      });
    }

    // Validate type
    if (!['one-time', 'recurring'].includes(type)) {
      return res.status(400).json({ 
        error: 'Invalid type',
        message: 'Type must be either "one-time" or "recurring"'
      });
    }

    // For recurring expenses, validate date range
    if (type === 'recurring' && !startDate) {
      return res.status(400).json({ 
        error: 'Missing start date',
        message: 'Start date is required for recurring expenses'
      });
    }

    // Get receipt path if file was uploaded
    const receiptPath = req.file ? req.file.path : null;

    // Create the expense (using 'expense' as type_transaction)
    const expense = await Transaction.create(
      userId,
      categoryId || null, // Can be null if no category specified
      null, // compte_id - we'll handle this later
      parseFloat(amount),
      'expense', // type_transaction
      description || null,
      date,
      type, // expenseType (one-time or recurring)
      type === 'recurring' ? startDate : null, // startDate
      type === 'recurring' ? endDate : null, // endDate
      receiptPath // receiptPath
    );

    res.status(201).json({
      message: 'Expense created successfully',
      expense: {
        ...expense,
        type: type,
        startDate: type === 'recurring' ? startDate : null,
        endDate: type === 'recurring' ? endDate : null,
        receiptPath: receiptPath
      }
    });
  } catch (error) {
    console.error('Error creating expense:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create expense'
    });
  }
});

// PUT /api/expenses/:id - Update existing expense
router.put('/:id', upload.single('receipt'), async (req, res) => {
  try {
    const { amount, date, categoryId, description, type } = req.body;
    const userId = req.user.id;
    const updates = {};

    // Only include fields that are provided
    if (amount !== undefined) {
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ 
          error: 'Invalid amount',
          message: 'Amount must be a positive number'
        });
      }
      updates.montant = parseFloat(amount);
    }
    
    if (date !== undefined) updates.date_transaction = date;
    if (categoryId !== undefined) updates.id_categorie = categoryId;
    if (description !== undefined) updates.description = description;

    if (Object.keys(updates).length === 0 && !req.file) {
      return res.status(400).json({ 
        error: 'No updates provided',
        message: 'No valid fields to update'
      });
    }

    const expense = await Transaction.update(req.params.id, userId, updates);
    
    if (!expense) {
      // Clean up uploaded file if expense not found
      if (req.file) {
        fs.unlink(req.file.path, (err) => {
          if (err) console.error('Error deleting uploaded file:', err);
        });
      }
      return res.status(404).json({ 
        error: 'Expense not found',
        message: 'The requested expense does not exist or you do not have access to it'
      });
    }

    // Handle receipt update
    let receiptPath = null;
    if (req.file) {
      receiptPath = req.file.path;
      // TODO: Delete old receipt file if it exists
    }

    res.json({
      message: 'Expense updated successfully',
      expense: {
        ...expense,
        receiptPath: receiptPath
      }
    });
  } catch (error) {
    console.error('Error updating expense:', error);
    
    // Clean up uploaded file if there was an error
    if (req.file) {
      fs.unlink(req.file.path, (err) => {
        if (err) console.error('Error deleting uploaded file:', err);
      });
    }
    
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update expense'
    });
  }
});

// DELETE /api/expenses/:id - Delete expense
router.delete('/:id', async (req, res) => {
  try {
    const expense = await Transaction.delete(req.params.id, req.user.id_utilisateur);
    
    if (!expense) {
      return res.status(404).json({ 
        error: 'Expense not found',
        message: 'The requested expense does not exist or you do not have access to it'
      });
    }

    // TODO: Delete associated receipt file if it exists

    res.json({
      message: 'Expense deleted successfully',
      expense
    });
  } catch (error) {
    console.error('Error deleting expense:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete expense'
    });
  }
});

module.exports = router;

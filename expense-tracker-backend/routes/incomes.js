const express = require('express');
const Transaction = require('../models/Expense');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/incomes - Get all incomes with filtering
router.get('/', async (req, res) => {
  try {
    const { start, end, limit = 50, offset = 0 } = req.query;
    const userId = req.user.id;

    let incomes;
    
    // Build query based on filters
    if (start || end) {
      incomes = await Transaction.findIncomeWithFilters(userId, {
        start,
        end,
        limit: parseInt(limit),
        offset: parseInt(offset)
      });
    } else {
      incomes = await Transaction.findByType(userId, 'income');
    }
    
    res.json({
      message: 'Incomes retrieved successfully',
      incomes,
      total: incomes.length,
      filters: { start, end },
      pagination: {
        limit: parseInt(limit),
        offset: parseInt(offset)
      }
    });
  } catch (error) {
    console.error('Error fetching incomes:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve incomes'
    });
  }
});

// GET /api/incomes/:id - Get single income by ID
router.get('/:id', async (req, res) => {
  try {
    const income = await Transaction.findById(req.params.id, req.user.id);
    
    if (!income) {
      return res.status(404).json({ 
        error: 'Income not found',
        message: 'The requested income does not exist or you do not have access to it'
      });
    }

    // Verify it's actually an income
    if (income.type !== 'income') {
      return res.status(404).json({ 
        error: 'Income not found',
        message: 'The requested transaction is not an income'
      });
    }
    
    res.json({
      message: 'Income retrieved successfully',
      income
    });
  } catch (error) {
    console.error('Error fetching income:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve income'
    });
  }
});

// POST /api/incomes - Create new income
router.post('/', async (req, res) => {
  try {
    const { amount, date, source, description } = req.body;
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

    // Find or create a category for the source
    let categoryId = null;
    if (source) {
      // For now, we'll set categoryId to null and include source in description
      // In a full implementation, you might want to create/find categories
    }

    // Create the income
    const income = await Transaction.create(
      userId,
      categoryId, // Can be null
      null, // accountId - we'll handle this later
      parseFloat(amount),
      'income', // type
      description ? `${source ? source + ': ' : ''}${description}` : source || null,
      date
    );

    res.status(201).json({
      message: 'Income created successfully',
      income: {
        ...income,
        source: source || null
      }
    });
  } catch (error) {
    console.error('Error creating income:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create income'
    });
  }
});

// PUT /api/incomes/:id - Update existing income
router.put('/:id', async (req, res) => {
  try {
    const { amount, date, source, description } = req.body;
    const userId = req.user.id;
    const updates = {};

    // First, verify the income exists and belongs to user
    const existingIncome = await Transaction.findById(req.params.id, userId);
    if (!existingIncome) {
      return res.status(404).json({ 
        error: 'Income not found',
        message: 'The requested income does not exist or you do not have access to it'
      });
    }

    // Verify it's actually an income
    if (existingIncome.type_transaction !== 'revenu') {
      return res.status(404).json({ 
        error: 'Income not found',
        message: 'The requested transaction is not an income'
      });
    }

    // Only include fields that are provided
    if (amount !== undefined) {
      if (isNaN(amount) || parseFloat(amount) <= 0) {
        return res.status(400).json({ 
          error: 'Invalid amount',
          message: 'Amount must be a positive number'
        });
      }
      updates.amount = parseFloat(amount);
    }
    
    if (date !== undefined) updates.date = date;
    
    if (description !== undefined || source !== undefined) {
      // Combine source and description
      const newDescription = description ? `${source ? source + ': ' : ''}${description}` : source || null;
      updates.description = newDescription;
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ 
        error: 'No updates provided',
        message: 'No valid fields to update'
      });
    }

    const income = await Transaction.update(req.params.id, userId, updates);
    
    if (!income) {
      return res.status(404).json({ 
        error: 'Income not found',
        message: 'The requested income does not exist or you do not have access to it'
      });
    }

    res.json({
      message: 'Income updated successfully',
      income: {
        ...income,
        source: source || null
      }
    });
  } catch (error) {
    console.error('Error updating income:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update income'
    });
  }
});

// DELETE /api/incomes/:id - Delete income
router.delete('/:id', async (req, res) => {
  try {
    // First, verify the income exists and belongs to user
    const existingIncome = await Transaction.findById(req.params.id, req.user.id);
    if (!existingIncome) {
      return res.status(404).json({ 
        error: 'Income not found',
        message: 'The requested income does not exist or you do not have access to it'
      });
    }

    // Verify it's actually an income
    if (existingIncome.type !== 'income') {
      return res.status(404).json({ 
        error: 'Income not found',
        message: 'The requested transaction is not an income'
      });
    }

    const income = await Transaction.delete(req.params.id, req.user.id);
    
    if (!income) {
      return res.status(404).json({ 
        error: 'Income not found',
        message: 'The requested income does not exist or you do not have access to it'
      });
    }

    res.json({
      message: 'Income deleted successfully',
      income
    });
  } catch (error) {
    console.error('Error deleting income:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete income'
    });
  }
});

module.exports = router;

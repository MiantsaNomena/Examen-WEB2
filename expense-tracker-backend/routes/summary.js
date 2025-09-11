const express = require('express');
const Transaction = require('../models/Expense');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/summary/monthly - Get current month's summary or specific month
router.get('/monthly', async (req, res) => {
  try {
    const userId = req.user.id;
    const { month } = req.query;
    
    let year, monthNum;
    
    if (month) {
      // Parse month parameter (format: YYYY-MM)
      const monthMatch = month.match(/^(\d{4})-(\d{2})$/);
      if (!monthMatch) {
        return res.status(400).json({
          error: 'Invalid month format',
          message: 'Month should be in format YYYY-MM (e.g., 2025-08)'
        });
      }
      year = parseInt(monthMatch[1]);
      monthNum = parseInt(monthMatch[2]);
    } else {
      // Use current month
      const now = new Date();
      year = now.getFullYear();
      monthNum = now.getMonth() + 1;
    }

    // Get monthly summary
    const summaryData = await Transaction.getMonthlySummaryForMonth(userId, year, monthNum);
    
    // Process the data
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeTransactions = 0;
    let expenseTransactions = 0;
    
    summaryData.forEach(row => {
      if (row.type_transaction === 'revenu') {
        totalIncome = parseFloat(row.total_montant) || 0;
        incomeTransactions = parseInt(row.nombre_transactions) || 0;
      } else if (row.type_transaction === 'depense') {
        totalExpenses = parseFloat(row.total_montant) || 0;
        expenseTransactions = parseInt(row.nombre_transactions) || 0;
      }
    });

    const balance = totalIncome - totalExpenses;
    const monthString = `${year}-${monthNum.toString().padStart(2, '0')}`;

    res.json({
      message: 'Monthly summary retrieved successfully',
      period: monthString,
      summary: {
        income: {
          total: totalIncome,
          transactions: incomeTransactions
        },
        expenses: {
          total: totalExpenses,
          transactions: expenseTransactions
        },
        balance: balance,
        savings_rate: totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching monthly summary:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve monthly summary'
    });
  }
});

// GET /api/summary - Get summary between two dates
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const { start, end } = req.query;

    // Validate required parameters
    if (!start || !end) {
      return res.status(400).json({
        error: 'Missing required parameters',
        message: 'Both start and end dates are required (format: YYYY-MM-DD)'
      });
    }

    // Validate date format
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(start) || !dateRegex.test(end)) {
      return res.status(400).json({
        error: 'Invalid date format',
        message: 'Dates should be in format YYYY-MM-DD'
      });
    }

    // Get summary data
    const summaryData = await Transaction.getSummaryByDateRange(userId, start, end);
    const categoryBreakdown = await Transaction.getCategoryBreakdown(userId, start, end);
    
    // Process the summary data
    let totalIncome = 0;
    let totalExpenses = 0;
    let incomeTransactions = 0;
    let expenseTransactions = 0;
    
    summaryData.forEach(row => {
      if (row.type_transaction === 'revenu') {
        totalIncome = parseFloat(row.total_montant) || 0;
        incomeTransactions = parseInt(row.nombre_transactions) || 0;
      } else if (row.type_transaction === 'depense') {
        totalExpenses = parseFloat(row.total_montant) || 0;
        expenseTransactions = parseInt(row.nombre_transactions) || 0;
      }
    });

    // Process category breakdown
    const expensesByCategory = {};
    const incomesByCategory = {};
    
    categoryBreakdown.forEach(row => {
      const categoryName = row.nom_categorie || 'Uncategorized';
      const amount = parseFloat(row.total_montant) || 0;
      const transactionCount = parseInt(row.nombre_transactions) || 0;
      
      if (row.type_transaction === 'depense') {
        expensesByCategory[categoryName] = {
          total: amount,
          transactions: transactionCount
        };
      } else if (row.type_transaction === 'revenu') {
        incomesByCategory[categoryName] = {
          total: amount,
          transactions: transactionCount
        };
      }
    });

    const balance = totalIncome - totalExpenses;

    res.json({
      message: 'Summary retrieved successfully',
      period: {
        start: start,
        end: end
      },
      summary: {
        income: {
          total: totalIncome,
          transactions: incomeTransactions,
          by_category: incomesByCategory
        },
        expenses: {
          total: totalExpenses,
          transactions: expenseTransactions,
          by_category: expensesByCategory
        },
        balance: balance,
        savings_rate: totalIncome > 0 ? ((balance / totalIncome) * 100).toFixed(2) : 0
      }
    });
  } catch (error) {
    console.error('Error fetching summary:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve summary'
    });
  }
});

// GET /api/summary/alerts - Returns alert if spending > income in current month
router.get('/alerts', async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Get current month data
    const now = new Date();
    const year = now.getFullYear();
    const month = now.getMonth() + 1;
    
    const summaryData = await Transaction.getMonthlySummaryForMonth(userId, year, month);
    
    // Process the data
    let totalIncome = 0;
    let totalExpenses = 0;
    
    summaryData.forEach(row => {
      if (row.type_transaction === 'revenu') {
        totalIncome = parseFloat(row.total_montant) || 0;
      } else if (row.type_transaction === 'depense') {
        totalExpenses = parseFloat(row.total_montant) || 0;
      }
    });

    const balance = totalIncome - totalExpenses;
    const overspent = totalExpenses > totalIncome;
    const overspentAmount = overspent ? totalExpenses - totalIncome : 0;

    let alertMessage = null;
    if (overspent && totalIncome > 0) {
      alertMessage = `You've exceeded your monthly budget by $${overspentAmount.toFixed(2)}`;
    } else if (overspent && totalIncome === 0) {
      alertMessage = `You have expenses of $${totalExpenses.toFixed(2)} but no recorded income this month`;
    } else if (totalExpenses > 0 && totalIncome > 0) {
      const spendingRate = (totalExpenses / totalIncome) * 100;
      if (spendingRate > 80) {
        alertMessage = `You've spent ${spendingRate.toFixed(1)}% of your monthly income. Consider monitoring your expenses.`;
      }
    }

    res.json({
      alert: overspent || (totalExpenses / totalIncome) > 0.8,
      message: alertMessage,
      current_month: `${year}-${month.toString().padStart(2, '0')}`,
      details: {
        total_income: totalIncome,
        total_expenses: totalExpenses,
        balance: balance,
        spending_rate: totalIncome > 0 ? ((totalExpenses / totalIncome) * 100).toFixed(1) : null
      }
    });
  } catch (error) {
    console.error('Error fetching alerts:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve alerts'
    });
  }
});

module.exports = router;

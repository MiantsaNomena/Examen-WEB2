const express = require('express');
const path = require('path');
const fs = require('fs');
const Transaction = require('../models/Expense');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/receipts/:idExpense - Download or view receipt file
router.get('/:idExpense', async (req, res) => {
  try {
    const expenseId = req.params.idExpense;
    const userId = req.user.id_utilisateur;

    // First, verify that the user owns this expense
    const expense = await Transaction.findById(expenseId, userId);
    
    if (!expense) {
      return res.status(404).json({
        error: 'Expense not found',
        message: 'The requested expense does not exist or you do not have access to it'
      });
    }

    // For now, we need to check if there's a receipt file associated with this expense
    // Since we don't have receipt paths stored in the database yet, we'll look for files
    // in the uploads directory that match the expense pattern
    const uploadsDir = path.join(process.cwd(), 'uploads', 'receipts');
    
    if (!fs.existsSync(uploadsDir)) {
      return res.status(404).json({
        error: 'No receipt found',
        message: 'No receipt file is associated with this expense'
      });
    }

    // Look for receipt files that might be associated with this expense
    // This is a temporary solution - ideally we'd store the file path in the database
    const files = fs.readdirSync(uploadsDir);
    const possibleReceipts = files.filter(file => 
      file.includes(`expense-${expenseId}`) || 
      file.includes(`receipt-${expenseId}`) ||
      file.startsWith(`receipt-`) // For now, we'll allow any receipt file
    );

    if (possibleReceipts.length === 0) {
      return res.status(404).json({
        error: 'No receipt found',
        message: 'No receipt file is associated with this expense'
      });
    }

    // Use the first matching file (in a real implementation, we'd have the exact path)
    const receiptFileName = possibleReceipts[0];
    const receiptPath = path.join(uploadsDir, receiptFileName);

    // Verify the file exists
    if (!fs.existsSync(receiptPath)) {
      return res.status(404).json({
        error: 'Receipt file not found',
        message: 'The receipt file no longer exists on the server'
      });
    }

    // Get file stats
    const stats = fs.statSync(receiptPath);
    const fileExtension = path.extname(receiptFileName).toLowerCase();
    
    // Set appropriate content type
    let contentType = 'application/octet-stream';
    switch (fileExtension) {
      case '.jpg':
      case '.jpeg':
        contentType = 'image/jpeg';
        break;
      case '.png':
        contentType = 'image/png';
        break;
      case '.pdf':
        contentType = 'application/pdf';
        break;
    }

    // Set headers for file download/view
    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Length', stats.size);
    res.setHeader('Content-Disposition', `inline; filename="${receiptFileName}"`);
    
    // For images and PDFs, allow inline viewing
    if (['image/jpeg', 'image/png', 'application/pdf'].includes(contentType)) {
      res.setHeader('Content-Disposition', `inline; filename="${receiptFileName}"`);
    } else {
      res.setHeader('Content-Disposition', `attachment; filename="${receiptFileName}"`);
    }

    // Stream the file
    const fileStream = fs.createReadStream(receiptPath);
    
    fileStream.on('error', (error) => {
      console.error('Error streaming receipt file:', error);
      if (!res.headersSent) {
        res.status(500).json({
          error: 'File streaming error',
          message: 'Failed to stream the receipt file'
        });
      }
    });

    fileStream.pipe(res);

  } catch (error) {
    console.error('Error retrieving receipt:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to retrieve receipt file'
    });
  }
});

module.exports = router;

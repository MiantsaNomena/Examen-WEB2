const express = require('express');
const Category = require('../models/Category');
const { authenticateToken } = require('../middleware/auth');
const router = express.Router();

// Apply authentication middleware to all routes
router.use(authenticateToken);

// GET /api/categories - Get all categories for the user
router.get('/', async (req, res) => {
  try {
    const userId = req.user.id;
    const categories = await Category.findByUserId(userId);
    
    res.json({
      message: 'Categories retrieved successfully',
      categories,
      total: categories.length
    });
  } catch (error) {
    console.error('Error fetching categories:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to retrieve categories'
    });
  }
});

// POST /api/categories - Create new category
router.post('/', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Category name is required'
      });
    }

    // Check if category name already exists for this user
    const existingCategories = await Category.findByUserId(userId);
    const nameExists = existingCategories.some(cat => 
      cat.name.toLowerCase() === name.trim().toLowerCase()
    );

    if (nameExists) {
      return res.status(400).json({ 
        error: 'Category already exists',
        message: 'A category with this name already exists'
      });
    }

    // Create the category with default type 'expense' (can be changed later)
    const category = await Category.create(userId, name.trim(), 'expense');

    res.status(201).json({
      message: 'Category created successfully',
      category
    });
  } catch (error) {
    console.error('Error creating category:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to create category'
    });
  }
});

// PUT /api/categories/:id - Update existing category (rename)
router.put('/:id', async (req, res) => {
  try {
    const { name } = req.body;
    const userId = req.user.id;
    const categoryId = req.params.id;

    // Validate required fields
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        message: 'Category name is required'
      });
    }

    // First, verify the category exists and belongs to user
    const existingCategory = await Category.findById(categoryId, userId);
    if (!existingCategory) {
      return res.status(404).json({ 
        error: 'Category not found',
        message: 'The requested category does not exist or you do not have access to it'
      });
    }

    // Check if new name already exists for this user (excluding current category)
    const allCategories = await Category.findByUserId(userId);
    const nameExists = allCategories.some(cat => 
      cat.name.toLowerCase() === name.trim().toLowerCase() && 
      cat.id !== parseInt(categoryId)
    );

    if (nameExists) {
      return res.status(400).json({ 
        error: 'Category already exists',
        message: 'A category with this name already exists'
      });
    }

    const updates = { name: name.trim() };
    const category = await Category.update(categoryId, userId, updates);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found',
        message: 'The requested category does not exist or you do not have access to it'
      });
    }

    res.json({
      message: 'Category updated successfully',
      category
    });
  } catch (error) {
    console.error('Error updating category:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to update category'
    });
  }
});

// DELETE /api/categories/:id - Delete category (if not used)
router.delete('/:id', async (req, res) => {
  try {
    const userId = req.user.id;
    const categoryId = req.params.id;

    // First, verify the category exists and belongs to user
    const existingCategory = await Category.findById(categoryId, userId);
    if (!existingCategory) {
      return res.status(404).json({ 
        error: 'Category not found',
        message: 'The requested category does not exist or you do not have access to it'
      });
    }

    // Check if category is used in any transactions
    const isUsed = await Category.isUsedInTransactions(categoryId, userId);
    if (isUsed) {
      return res.status(400).json({ 
        error: 'Category in use',
        message: 'Cannot delete category that is used in transactions. Please remove or reassign transactions first.'
      });
    }

    const category = await Category.delete(categoryId, userId);
    
    if (!category) {
      return res.status(404).json({ 
        error: 'Category not found',
        message: 'The requested category does not exist or you do not have access to it'
      });
    }

    res.json({
      message: 'Category deleted successfully',
      category
    });
  } catch (error) {
    console.error('Error deleting category:', error);
    res.status(500).json({ 
      error: 'Internal server error',
      message: 'Failed to delete category'
    });
  }
});

module.exports = router;

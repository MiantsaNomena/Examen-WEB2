const { prisma } = require('../config/database');

class Category {
  // Create a new category
  static async create(userId, name, type) {
    try {
      const category = await prisma.category.create({
        data: {
          userId: parseInt(userId),
          name: name,
          type: type
        }
      });
      return category;
    } catch (error) {
      console.error('Error creating category:', error);
      throw error;
    }
  }

  // Get all categories for a user
  static async findByUserId(userId) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          userId: parseInt(userId)
        },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ]
      });
      return categories;
    } catch (error) {
      console.error('Error finding categories by user ID:', error);
      throw error;
    }
  }

  // Get categories by type
  static async findByType(userId, type) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          userId: parseInt(userId),
          type: type
        },
        orderBy: {
          name: 'asc'
        }
      });
      return categories;
    } catch (error) {
      console.error('Error finding categories by type:', error);
      throw error;
    }
  }

  // Get category by ID
  static async findById(id, userId) {
    try {
      const category = await prisma.category.findFirst({
        where: {
          id: parseInt(id),
          userId: parseInt(userId)
        }
      });
      return category;
    } catch (error) {
      console.error('Error finding category by ID:', error);
      throw error;
    }
  }

  // Update category
  static async update(id, userId, updates) {
    try {
      const category = await prisma.category.update({
        where: {
          id: parseInt(id),
          userId: parseInt(userId)
        },
        data: updates
      });
      return category;
    } catch (error) {
      console.error('Error updating category:', error);
      throw error;
    }
  }

  // Check if category is used in transactions
  static async isUsedInTransactions(id, userId) {
    try {
      const count = await prisma.transaction.count({
        where: {
          categoryId: parseInt(id),
          userId: parseInt(userId)
        }
      });
      return count > 0;
    } catch (error) {
      console.error('Error checking category usage:', error);
      throw error;
    }
  }

  // Delete category
  static async delete(id, userId) {
    try {
      const category = await prisma.category.delete({
        where: {
          id: parseInt(id),
          userId: parseInt(userId)
        }
      });
      return category;
    } catch (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
  }

  // Get category with transaction count
  static async findWithTransactionCount(userId) {
    try {
      const categories = await prisma.category.findMany({
        where: {
          userId: parseInt(userId)
        },
        include: {
          transactions: {
            select: {
              amount: true
            }
          }
        },
        orderBy: [
          { type: 'asc' },
          { name: 'asc' }
        ]
      });
      
      return categories.map(category => ({
        ...category,
        nombre_transactions: category.transactions.length,
        total_montant: category.transactions.reduce((sum, t) => sum + t.amount, 0)
      }));
    } catch (error) {
      console.error('Error finding categories with transaction count:', error);
      throw error;
    }
  }
}

module.exports = Category;

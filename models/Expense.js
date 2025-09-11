const { prisma } = require('../config/database');

class Transaction {
  // Create a new transaction (expense)
  static async create(userId, categoryId, accountId, amount, type, description, date, expenseType = 'one-time', startDate = null, endDate = null, receiptPath = null) {
    try {
      const transaction = await prisma.transaction.create({
        data: {
          userId: parseInt(userId),
          categoryId: categoryId ? parseInt(categoryId) : null,
          accountId: accountId ? parseInt(accountId) : null,
          amount: parseFloat(amount),
          type: type,
          description: description,
          date: new Date(date),
          expenseType: expenseType,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          receiptPath: receiptPath
        },
        include: {
          category: true,
          account: true,
          user: true
        }
      });
      return transaction;
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  // Get all transactions for a user
  static async findByUserId(userId, limit = 50, offset = 0) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: parseInt(userId)
        },
        include: {
          category: true,
          account: true
        },
        orderBy: {
          date: 'desc'
        },
        take: limit,
        skip: offset
      });
      return transactions;
    } catch (error) {
      console.error('Error finding transactions by user ID:', error);
      throw error;
    }
  }

  // Get transaction by ID
  static async findById(id, userId) {
    try {
      const transaction = await prisma.transaction.findFirst({
        where: {
          id: parseInt(id),
          userId: parseInt(userId)
        },
        include: {
          category: true,
          account: true
        }
      });
      return transaction;
    } catch (error) {
      console.error('Error finding transaction by ID:', error);
      throw error;
    }
  }

  // Update transaction
  static async update(id, userId, updates) {
    try {
      // Convert field names to match Prisma schema
      const prismaUpdates = {};
      Object.keys(updates).forEach(key => {
        switch(key) {
          case 'montant':
            prismaUpdates.amount = parseFloat(updates[key]);
            break;
          case 'type_transaction':
            prismaUpdates.type = updates[key];
            break;
          case 'date_transaction':
            prismaUpdates.date = new Date(updates[key]);
            break;
          case 'id_categorie':
            prismaUpdates.categoryId = updates[key] ? parseInt(updates[key]) : null;
            break;
          case 'id_compte':
            prismaUpdates.accountId = updates[key] ? parseInt(updates[key]) : null;
            break;
          default:
            prismaUpdates[key] = updates[key];
        }
      });
      
      const transaction = await prisma.transaction.update({
        where: {
          id: parseInt(id),
          userId: parseInt(userId)
        },
        data: prismaUpdates,
        include: {
          category: true,
          account: true
        }
      });
      return transaction;
    } catch (error) {
      console.error('Error updating transaction:', error);
      throw error;
    }
  }

  // Delete transaction
  static async delete(id, userId) {
    try {
      const transaction = await prisma.transaction.delete({
        where: {
          id: parseInt(id),
          userId: parseInt(userId)
        }
      });
      return transaction;
    } catch (error) {
      console.error('Error deleting transaction:', error);
      throw error;
    }
  }

  // Get transactions by category
  static async findByCategory(userId, categoryId) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: parseInt(userId),
          categoryId: parseInt(categoryId)
        },
        include: {
          category: true,
          account: true
        },
        orderBy: {
          date: 'desc'
        }
      });
      return transactions;
    } catch (error) {
      console.error('Error finding transactions by category:', error);
      throw error;
    }
  }

  // Find all transactions by type for a user
  static async findByType(userId, type) {
    try {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: parseInt(userId),
          type: type
        },
        include: {
          category: true,
          account: true
        },
        orderBy: {
          date: 'desc'
        }
      });
      return transactions;
    } catch (error) {
      console.error('Error finding transactions by type:', error);
      throw error;
    }
  }

  // Get total by type for a user
  static async getTotalByType(userId, typeTransaction) {
    try {
      const result = await prisma.transaction.aggregate({
        where: {
          userId: parseInt(userId),
          type: typeTransaction
        },
        _sum: {
          amount: true
        }
      });
      return result._sum.amount || 0;
    } catch (error) {
      console.error('Error getting total by type:', error);
      throw error;
    }
  }

  // Get monthly summary
  static async getMonthlySummary(userId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const result = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
          userId: parseInt(userId),
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      });
      
      return result.map(item => ({
        type_transaction: item.type,
        nombre_transactions: item._count.id,
        total_montant: item._sum.amount || 0
      }));
    } catch (error) {
      console.error('Error getting monthly summary:', error);
      throw error;
    }
  }

  // Find transactions with filters (for expense routes)
  static async findWithFilters(userId, filters) {
    try {
      const whereClause = {
        userId: parseInt(userId),
        type: 'expense'
      };

      // Add date range filters
      if (filters.start || filters.end) {
        whereClause.date = {};
        if (filters.start) {
          whereClause.date.gte = new Date(filters.start);
        }
        if (filters.end) {
          whereClause.date.lte = new Date(filters.end);
        }
      }

      // Add category filter
      if (filters.category) {
        whereClause.category = {
          name: {
            contains: filters.category,
            mode: 'insensitive'
          }
        };
      }

      const transactions = await prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
          account: true
        },
        orderBy: {
          date: 'desc'
        },
        take: filters.limit || undefined,
        skip: filters.offset || undefined
      });

      return transactions;
    } catch (error) {
      console.error('Error finding transactions with filters:', error);
      throw error;
    }
  }

  // Find income transactions with filters
  static async findIncomeWithFilters(userId, filters) {
    try {
      const whereClause = {
        userId: parseInt(userId),
        type: 'income'
      };

      // Add date range filters
      if (filters.start || filters.end) {
        whereClause.date = {};
        if (filters.start) {
          whereClause.date.gte = new Date(filters.start);
        }
        if (filters.end) {
          whereClause.date.lte = new Date(filters.end);
        }
      }

      const transactions = await prisma.transaction.findMany({
        where: whereClause,
        include: {
          category: true,
          account: true
        },
        orderBy: {
          date: 'desc'
        },
        take: filters.limit || undefined,
        skip: filters.offset || undefined
      });

      return transactions;
    } catch (error) {
      console.error('Error finding income transactions with filters:', error);
      throw error;
    }
  }

  // Get summary for date range
  static async getSummaryByDateRange(userId, startDate, endDate) {
    try {
      const result = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
          userId: parseInt(userId),
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          }
        },
        _count: {
          id: true
        },
        _sum: {
          amount: true
        },
        _avg: {
          amount: true
        }
      });
      
      return result.map(item => ({
        type_transaction: item.type,
        nombre_transactions: item._count.id,
        total_montant: item._sum.amount || 0,
        montant_moyen: item._avg.amount || 0
      }));
    } catch (error) {
      console.error('Error getting summary by date range:', error);
      throw error;
    }
  }

  // Get monthly summary for specific month
  static async getMonthlySummaryForMonth(userId, year, month) {
    try {
      const startDate = new Date(year, month - 1, 1);
      const endDate = new Date(year, month, 0, 23, 59, 59);
      
      const result = await prisma.transaction.groupBy({
        by: ['type'],
        where: {
          userId: parseInt(userId),
          date: {
            gte: startDate,
            lte: endDate
          }
        },
        _count: {
          id: true
        },
        _sum: {
          amount: true
        },
        _avg: {
          amount: true
        }
      });
      
      return result.map(item => ({
        type_transaction: item.type,
        nombre_transactions: item._count.id,
        total_montant: item._sum.amount || 0,
        montant_moyen: item._avg.amount || 0
      }));
    } catch (error) {
      console.error('Error getting monthly summary:', error);
      throw error;
    }
  }

  // Get category breakdown for date range
  static async getCategoryBreakdown(userId, startDate, endDate) {
    try {
      const result = await prisma.transaction.groupBy({
        by: ['categoryId', 'type'],
        where: {
          userId: parseInt(userId),
          date: {
            gte: new Date(startDate),
            lte: new Date(endDate)
          },
          categoryId: {
            not: null
          }
        },
        _count: {
          id: true
        },
        _sum: {
          amount: true
        }
      });

      // Get category details for each group
      const categoryBreakdown = await Promise.all(
        result.map(async (item) => {
          const category = await prisma.category.findUnique({
            where: { id: item.categoryId }
          });
          
          return {
            nom_categorie: category?.name || 'Unknown',
            type_categorie: category?.type || 'unknown',
            type_transaction: item.type,
            nombre_transactions: item._count.id,
            total_montant: item._sum.amount || 0
          };
        })
      );

      return categoryBreakdown.sort((a, b) => b.total_montant - a.total_montant);
    } catch (error) {
      console.error('Error getting category breakdown:', error);
      throw error;
    }
  }
}

module.exports = Transaction;

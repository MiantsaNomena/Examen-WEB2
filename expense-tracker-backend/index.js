const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Import database connection
const { connectDatabase } = require('./config/database');

const startServer = async () => {
  try {
    // Connect to database
    await connectDatabase();

    // Middleware
    app.use(cors({
      origin: process.env.FRONTEND_URL || 'http://localhost:5173',
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization']
    }));
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Static file serving for uploaded receipts
    app.use('/uploads', express.static('uploads'));

    // Routes
    app.use('/api/auth', require('./routes/auth'));
    app.use('/api/expenses', require('./routes/expenses'));
    app.use('/api/incomes', require('./routes/incomes'));
    app.use('/api/categories', require('./routes/categories'));
    app.use('/api/summary', require('./routes/summary'));
    app.use('/api/user', require('./routes/user'));
    app.use('/api/receipts', require('./routes/receipts'));

    // Health check endpoint
    app.get('/health', (req, res) => {
      res.json({ 
        status: 'OK', 
        message: 'Expense Tracker API is running with SQLite + Prisma',
        timestamp: new Date().toISOString()
      });
    });

    // Root endpoint
    app.get('/', (req, res) => {
      res.json({
        message: 'Welcome to Expense Tracker API',
        version: '1.0.0',
        database: 'SQLite with Prisma ORM',
        endpoints: {
          auth: {
            signup: 'POST /api/auth/signup',
            login: 'POST /api/auth/login',
            me: 'GET /api/auth/me'
          },
          expenses: {
            list: 'GET /api/expenses',
            get: 'GET /api/expenses/:id',
            create: 'POST /api/expenses',
            update: 'PUT /api/expenses/:id',
            delete: 'DELETE /api/expenses/:id'
          },
          incomes: {
            list: 'GET /api/incomes',
            get: 'GET /api/incomes/:id',
            create: 'POST /api/incomes',
            update: 'PUT /api/incomes/:id',
            delete: 'DELETE /api/incomes/:id'
          },
          categories: {
            list: 'GET /api/categories',
            create: 'POST /api/categories',
            update: 'PUT /api/categories/:id',
            delete: 'DELETE /api/categories/:id'
          },
          summary: {
            monthly: 'GET /api/summary/monthly',
            dateRange: 'GET /api/summary',
            alerts: 'GET /api/summary/alerts'
          },
          user: {
            profile: 'GET /api/user/profile'
          },
          receipts: {
            get: 'GET /api/receipts/:idExpense'
          },
          health: 'GET /health'
        }
      });
    });

    // Error handling middleware
    app.use((err, req, res, next) => {
      console.error(err.stack);
      res.status(500).json({ 
        error: 'Something went wrong!',
        message: 'An unexpected error occurred'
      });
    });

    // 404 handler
    app.use((req, res) => {
      res.status(404).json({ 
        error: 'Route not found',
        message: 'The requested endpoint does not exist'
      });
    });

    // Start server
    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`📊 API Base URL: http://localhost:${PORT}/api`);
      console.log(`💾 Database: SQLite with Prisma ORM`);
      console.log(`🔐 Auth endpoints:`);
      console.log(`   POST http://localhost:${PORT}/api/auth/signup`);
      console.log(`   POST http://localhost:${PORT}/api/auth/login`);
      console.log(`   GET  http://localhost:${PORT}/api/auth/me`);
      console.log(`🏥 Health check: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

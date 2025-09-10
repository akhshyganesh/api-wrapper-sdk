const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

const { 
  errorHandler, 
  notFoundHandler, 
  requestLogger, 
  corsConfig 
} = require('./middleware');

// Import routes
const usersRoutes = require('./routes/users');
const postsRoutes = require('./routes/posts');
const productsRoutes = require('./routes/products');

const app = express();
const PORT = process.env.PORT || 3001;

// Security middleware
app.use(helmet());
app.use(cors(corsConfig));

// Logging middleware
app.use(morgan('combined'));
app.use(requestLogger);

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Wrapper Test Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// API documentation endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to API Wrapper Test Server',
    version: '1.0.0',
    endpoints: {
      users: {
        'GET /api/users': 'Get all users (with pagination and filtering)',
        'GET /api/users/:id': 'Get user by ID',
        'POST /api/users': 'Create new user',
        'PUT /api/users/:id': 'Update user',
        'PATCH /api/users/:id': 'Partially update user',
        'DELETE /api/users/:id': 'Delete user'
      },
      posts: {
        'GET /api/posts': 'Get all posts (with pagination and filtering)',
        'GET /api/posts/:id': 'Get post by ID',
        'POST /api/posts': 'Create new post',
        'PUT /api/posts/:id': 'Update post',
        'PATCH /api/posts/:id': 'Partially update post',
        'DELETE /api/posts/:id': 'Delete post'
      },
      products: {
        'GET /api/products': 'Get all products (with pagination and filtering)',
        'GET /api/products/:id': 'Get product by ID',
        'POST /api/products': 'Create new product',
        'PUT /api/products/:id': 'Update product',
        'PATCH /api/products/:id': 'Partially update product',
        'DELETE /api/products/:id': 'Delete product'
      }
    },
    queryParams: {
      pagination: {
        page: 'Page number (default: 1)',
        limit: 'Items per page (default: 10)'
      },
      filtering: 'Add any field as query parameter for exact match, prefix with ~ for partial search'
    },
    examples: {
      'GET /api/users?page=1&limit=5': 'Get first 5 users',
      'GET /api/users?age=30': 'Get users with age 30',
      'GET /api/posts?~title=api': 'Get posts with "api" in title',
      'GET /api/products?category=Electronics&inStock=true': 'Get electronics products in stock'
    },
    timestamp: new Date().toISOString()
  });
});

// API routes
app.use('/api/users', usersRoutes);
app.use('/api/posts', postsRoutes);
app.use('/api/products', productsRoutes);

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, () => {
  console.log(`🚀 API Wrapper Test Server is running on port ${PORT}`);
  console.log(`📖 API Documentation: http://localhost:${PORT}`);
  console.log(`💊 Health Check: http://localhost:${PORT}/health`);
  console.log(`👥 Users API: http://localhost:${PORT}/api/users`);
  console.log(`📝 Posts API: http://localhost:${PORT}/api/posts`);
  console.log(`🛍️  Products API: http://localhost:${PORT}/api/products`);
});

module.exports = app;

// Error handling middleware
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  // Default error response
  let error = {
    message: err.message || 'Internal Server Error',
    status: err.status || 500
  };

  // Handle specific error types
  if (err.name === 'ValidationError') {
    error.status = 400;
    error.message = 'Validation Error';
    error.details = err.details;
  }

  if (err.name === 'NotFoundError') {
    error.status = 404;
    error.message = err.message || 'Resource not found';
  }

  res.status(error.status).json({
    success: false,
    error: {
      message: error.message,
      status: error.status,
      ...(error.details && { details: error.details })
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

// 404 handler
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: `Route ${req.originalUrl} not found`,
      status: 404
    },
    timestamp: new Date().toISOString(),
    path: req.originalUrl
  });
};

// Request logger
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
};

// Validation middleware factory
const validateBody = (schema) => {
  return (req, res, next) => {
    const errors = [];
    
    Object.entries(schema).forEach(([field, rules]) => {
      const value = req.body[field];
      
      if (rules.required && (value === undefined || value === null || value === '')) {
        errors.push(`${field} is required`);
        return;
      }
      
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push(`${field} must be of type ${rules.type}`);
        }
        
        if (rules.minLength && value.length < rules.minLength) {
          errors.push(`${field} must be at least ${rules.minLength} characters long`);
        }
        
        if (rules.maxLength && value.length > rules.maxLength) {
          errors.push(`${field} must be no more than ${rules.maxLength} characters long`);
        }
        
        if (rules.min && value < rules.min) {
          errors.push(`${field} must be at least ${rules.min}`);
        }
        
        if (rules.max && value > rules.max) {
          errors.push(`${field} must be no more than ${rules.max}`);
        }
        
        if (rules.pattern && !rules.pattern.test(value)) {
          errors.push(`${field} format is invalid`);
        }
      }
    });
    
    if (errors.length > 0) {
      const error = new Error('Validation failed');
      error.name = 'ValidationError';
      error.details = errors;
      return next(error);
    }
    
    next();
  };
};

// CORS configuration
const corsConfig = {
  origin: process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

module.exports = {
  errorHandler,
  notFoundHandler,
  requestLogger,
  validateBody,
  corsConfig
};

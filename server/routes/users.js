const createCRUDRoutes = require('./crud');

// Validation schemas for users
const userValidation = {
  create: {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    email: {
      required: true,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    age: {
      required: false,
      type: 'number',
      min: 0,
      max: 150
    }
  },
  update: {
    name: {
      required: false,
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    email: {
      required: false,
      type: 'string',
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    },
    age: {
      required: false,
      type: 'number',
      min: 0,
      max: 150
    }
  }
};

module.exports = createCRUDRoutes('users', 'users', userValidation);

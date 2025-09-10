const createCRUDRoutes = require('./crud');

// Validation schemas for products
const productValidation = {
  create: {
    name: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 500
    },
    price: {
      required: true,
      type: 'number',
      min: 0
    },
    category: {
      required: true,
      type: 'string',
      minLength: 2,
      maxLength: 50
    },
    inStock: {
      required: false,
      type: 'boolean'
    }
  },
  update: {
    name: {
      required: false,
      type: 'string',
      minLength: 2,
      maxLength: 100
    },
    description: {
      required: false,
      type: 'string',
      maxLength: 500
    },
    price: {
      required: false,
      type: 'number',
      min: 0
    },
    category: {
      required: false,
      type: 'string',
      minLength: 2,
      maxLength: 50
    },
    inStock: {
      required: false,
      type: 'boolean'
    }
  }
};

module.exports = createCRUDRoutes('products', 'products', productValidation);

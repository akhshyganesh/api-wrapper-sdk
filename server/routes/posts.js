const createCRUDRoutes = require('./crud');

// Validation schemas for posts
const postValidation = {
  create: {
    title: {
      required: true,
      type: 'string',
      minLength: 5,
      maxLength: 200
    },
    content: {
      required: true,
      type: 'string',
      minLength: 10
    },
    authorId: {
      required: true,
      type: 'number',
      min: 1
    },
    tags: {
      required: false,
      type: 'object' // Array
    },
    published: {
      required: false,
      type: 'boolean'
    }
  },
  update: {
    title: {
      required: false,
      type: 'string',
      minLength: 5,
      maxLength: 200
    },
    content: {
      required: false,
      type: 'string',
      minLength: 10
    },
    authorId: {
      required: false,
      type: 'number',
      min: 1
    },
    tags: {
      required: false,
      type: 'object' // Array
    },
    published: {
      required: false,
      type: 'boolean'
    }
  }
};

module.exports = createCRUDRoutes('posts', postValidation);

const express = require('express');
const JsonDatabase = require('../database');
const { validateBody } = require('../middleware');

// Generic CRUD route factory
const createCRUDRoutes = (collection, validationSchema = {}) => {
  const router = express.Router();
  const db = new JsonDatabase();

  // GET /collection - Get all items with optional filtering and pagination
  router.get('/', async (req, res, next) => {
    try {
      const { page = 1, limit = 10, ...filters } = req.query;
      
      // Remove pagination params from filters
      delete filters.page;
      delete filters.limit;
      
      const result = await db.paginate(collection, parseInt(page), parseInt(limit), filters);
      
      res.json({
        success: true,
        data: result.data,
        pagination: result.pagination,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // GET /collection/:id - Get item by ID
  router.get('/:id', async (req, res, next) => {
    try {
      const item = await db.getById(collection, req.params.id);
      
      if (!item) {
        const error = new Error(`${collection.slice(0, -1)} not found`);
        error.name = 'NotFoundError';
        return next(error);
      }
      
      res.json({
        success: true,
        data: item,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // POST /collection - Create new item
  router.post('/', validateBody(validationSchema.create || {}), async (req, res, next) => {
    try {
      const newItem = await db.create(collection, req.body);
      
      res.status(201).json({
        success: true,
        data: newItem,
        message: `${collection.slice(0, -1)} created successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // PUT /collection/:id - Update item
  router.put('/:id', validateBody(validationSchema.update || {}), async (req, res, next) => {
    try {
      const updatedItem = await db.update(collection, req.params.id, req.body);
      
      if (!updatedItem) {
        const error = new Error(`${collection.slice(0, -1)} not found`);
        error.name = 'NotFoundError';
        return next(error);
      }
      
      res.json({
        success: true,
        data: updatedItem,
        message: `${collection.slice(0, -1)} updated successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // PATCH /collection/:id - Partial update
  router.patch('/:id', async (req, res, next) => {
    try {
      const updatedItem = await db.update(collection, req.params.id, req.body);
      
      if (!updatedItem) {
        const error = new Error(`${collection.slice(0, -1)} not found`);
        error.name = 'NotFoundError';
        return next(error);
      }
      
      res.json({
        success: true,
        data: updatedItem,
        message: `${collection.slice(0, -1)} updated successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  // DELETE /collection/:id - Delete item
  router.delete('/:id', async (req, res, next) => {
    try {
      const deletedItem = await db.delete(collection, req.params.id);
      
      if (!deletedItem) {
        const error = new Error(`${collection.slice(0, -1)} not found`);
        error.name = 'NotFoundError';
        return next(error);
      }
      
      res.json({
        success: true,
        data: deletedItem,
        message: `${collection.slice(0, -1)} deleted successfully`,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      next(error);
    }
  });

  return router;
};

module.exports = createCRUDRoutes;

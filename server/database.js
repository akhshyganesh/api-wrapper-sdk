const fs = require('fs').promises;
const path = require('path');

class JsonDatabase {
  constructor(dbPath = path.join(__dirname, 'data', 'db.json')) {
    this.dbPath = dbPath;
  }

  async readData() {
    try {
      const data = await fs.readFile(this.dbPath, 'utf8');
      return JSON.parse(data);
    } catch (error) {
      console.error('Error reading database:', error);
      throw new Error('Failed to read database');
    }
  }

  async writeData(data) {
    try {
      await fs.writeFile(this.dbPath, JSON.stringify(data, null, 2));
    } catch (error) {
      console.error('Error writing database:', error);
      throw new Error('Failed to write database');
    }
  }

  // Generic CRUD operations for any collection
  async getAll(collection) {
    const data = await this.readData();
    return data[collection] || [];
  }

  async getById(collection, id) {
    const data = await this.readData();
    const items = data[collection] || [];
    return items.find(item => item.id === parseInt(id));
  }

  async create(collection, item) {
    const data = await this.readData();
    if (!data[collection]) {
      data[collection] = [];
    }
    
    // Generate new ID
    const maxId = data[collection].reduce((max, current) => 
      current.id > max ? current.id : max, 0);
    
    const newItem = {
      ...item,
      id: maxId + 1,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    data[collection].push(newItem);
    await this.writeData(data);
    return newItem;
  }

  async update(collection, id, updates) {
    const data = await this.readData();
    const items = data[collection] || [];
    const index = items.findIndex(item => item.id === parseInt(id));
    
    if (index === -1) {
      return null;
    }
    
    const updatedItem = {
      ...items[index],
      ...updates,
      id: parseInt(id), // Ensure ID doesn't change
      updatedAt: new Date().toISOString()
    };
    
    data[collection][index] = updatedItem;
    await this.writeData(data);
    return updatedItem;
  }

  async delete(collection, id) {
    const data = await this.readData();
    const items = data[collection] || [];
    const index = items.findIndex(item => item.id === parseInt(id));
    
    if (index === -1) {
      return null;
    }
    
    const deletedItem = items[index];
    data[collection].splice(index, 1);
    await this.writeData(data);
    return deletedItem;
  }

  // Query operations
  async query(collection, filters = {}) {
    const items = await this.getAll(collection);
    
    return items.filter(item => {
      return Object.entries(filters).every(([key, value]) => {
        if (value === undefined || value === null) return true;
        
        // Handle different filter types
        if (typeof value === 'string' && value.startsWith('~')) {
          // Case-insensitive partial match
          const searchTerm = value.slice(1).toLowerCase();
          return item[key] && item[key].toString().toLowerCase().includes(searchTerm);
        }
        
        return item[key] === value;
      });
    });
  }

  async paginate(collection, page = 1, limit = 10, filters = {}) {
    const items = await this.query(collection, filters);
    const total = items.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    const paginatedItems = items.slice(offset, offset + limit);
    
    return {
      data: paginatedItems,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    };
  }
}

module.exports = JsonDatabase;

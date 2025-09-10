// Example of using the API wrapper SDK with the test server
// Make sure to start the server first: npm run server:dev

const path = require('path');

// Import your API wrapper (adjust path as needed)
// For now, we'll use a simple fetch-based example since the SDK might not be built yet

const API_BASE_URL = 'http://localhost:3001/api';

// Simple HTTP client for demonstration
class SimpleApiClient {
  constructor(baseURL) {
    this.baseURL = baseURL;
  }

  async request(method, endpoint, data = null) {
    const url = `${this.baseURL}${endpoint}`;
    const options = {
      method: method.toUpperCase(),
      headers: {
        'Content-Type': 'application/json',
      },
    };

    if (data) {
      options.body = JSON.stringify(data);
    }

    try {
      const response = await fetch(url, options);
      const result = await response.json();
      return { status: response.status, data: result };
    } catch (error) {
      console.error('Request failed:', error);
      throw error;
    }
  }

  async get(endpoint) {
    return this.request('GET', endpoint);
  }

  async post(endpoint, data) {
    return this.request('POST', endpoint, data);
  }

  async put(endpoint, data) {
    return this.request('PUT', endpoint, data);
  }

  async patch(endpoint, data) {
    return this.request('PATCH', endpoint, data);
  }

  async delete(endpoint) {
    return this.request('DELETE', endpoint);
  }
}

// Example usage
async function demonstrateApiUsage() {
  const client = new SimpleApiClient(API_BASE_URL);

  console.log('🚀 API Wrapper SDK Demo with Test Server\n');

  try {
    // 1. Get all users
    console.log('1. Fetching all users...');
    const users = await client.get('/users');
    console.log(`Found ${users.data.data.length} users`);
    console.log('First user:', users.data.data[0]);
    console.log('');

    // 2. Create a new user
    console.log('2. Creating a new user...');
    const newUser = {
      name: 'API Demo User',
      email: 'demo@apitest.com',
      age: 28
    };
    const createdUser = await client.post('/users', newUser);
    console.log('Created user:', createdUser.data.data);
    console.log('');

    // 3. Update the user
    console.log('3. Updating the user...');
    const updatedUserData = {
      name: 'Updated API Demo User',
      age: 29
    };
    const updatedUser = await client.patch(`/users/${createdUser.data.data.id}`, updatedUserData);
    console.log('Updated user:', updatedUser.data.data);
    console.log('');

    // 4. Get user by ID
    console.log('4. Fetching user by ID...');
    const userById = await client.get(`/users/${createdUser.data.data.id}`);
    console.log('User by ID:', userById.data.data);
    console.log('');

    // 5. Get users with pagination
    console.log('5. Fetching users with pagination...');
    const paginatedUsers = await client.get('/users?page=1&limit=2');
    console.log('Paginated users:', paginatedUsers.data.data);
    console.log('Pagination info:', paginatedUsers.data.pagination);
    console.log('');

    // 6. Filter users
    console.log('6. Filtering users by name...');
    const filteredUsers = await client.get('/users?~name=demo');
    console.log('Filtered users:', filteredUsers.data.data);
    console.log('');

    // 7. Work with posts
    console.log('7. Creating a new post...');
    const newPost = {
      title: 'My First API Test Post',
      content: 'This post was created using the API wrapper SDK test server!',
      authorId: createdUser.data.data.id,
      tags: ['api', 'test', 'demo'],
      published: true
    };
    const createdPost = await client.post('/posts', newPost);
    console.log('Created post:', createdPost.data.data);
    console.log('');

    // 8. Work with products
    console.log('8. Creating a new product...');
    const newProduct = {
      name: 'API Test Widget',
      description: 'A widget created for API testing purposes',
      price: 19.99,
      category: 'Test Tools',
      inStock: true
    };
    const createdProduct = await client.post('/products', newProduct);
    console.log('Created product:', createdProduct.data.data);
    console.log('');

    // 9. Get all products in a category
    console.log('9. Fetching products by category...');
    const categoryProducts = await client.get('/products?category=Test Tools');
    console.log('Products in Test Tools category:', categoryProducts.data.data);
    console.log('');

    // 10. Clean up - delete the created items
    console.log('10. Cleaning up...');
    await client.delete(`/users/${createdUser.data.data.id}`);
    await client.delete(`/posts/${createdPost.data.data.id}`);
    await client.delete(`/products/${createdProduct.data.data.id}`);
    console.log('Cleanup completed!');
    console.log('');

    console.log('✅ Demo completed successfully!');
    console.log('');
    console.log('You can now use this server to test your API wrapper SDK.');
    console.log('The server provides consistent, reliable endpoints for all CRUD operations.');

  } catch (error) {
    console.error('❌ Demo failed:', error.message);
    console.log('');
    console.log('Make sure the server is running:');
    console.log('  npm run server:dev');
  }
}

// Check if we're in a Node.js environment that supports fetch
if (typeof fetch === 'undefined') {
  console.log('This demo requires Node.js 18+ with fetch support, or you can install node-fetch:');
  console.log('npm install node-fetch');
  console.log('');
  console.log('Alternatively, run the server and test it with curl:');
  console.log('curl http://localhost:3001/health');
} else {
  demonstrateApiUsage();
}

module.exports = { SimpleApiClient, demonstrateApiUsage };

#!/usr/bin/env node

const http = require('http');

// Test configuration
const BASE_URL = 'http://localhost:3001';
const tests = [];
let passedTests = 0;
let failedTests = 0;

// Helper function to make HTTP requests
const makeRequest = (method, path, data = null) => {
  return new Promise((resolve, reject) => {
    const url = new URL(path, BASE_URL);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json'
      }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
};

// Test function
const test = (description, testFn) => {
  tests.push({ description, testFn });
};

// Assertion helper
const assert = (condition, message) => {
  if (condition) {
    console.log(`✅ ${message}`);
    passedTests++;
  } else {
    console.log(`❌ ${message}`);
    failedTests++;
    throw new Error(message);
  }
};

// Define tests
test('Health check endpoint', async () => {
  const response = await makeRequest('GET', '/health');
  assert(response.status === 200, 'Health check returns 200');
  assert(response.data.success === true, 'Health check returns success');
});

test('API documentation endpoint', async () => {
  const response = await makeRequest('GET', '/');
  assert(response.status === 200, 'API docs return 200');
  assert(response.data.success === true, 'API docs return success');
  assert(response.data.endpoints, 'API docs contain endpoints');
});

test('Get all users', async () => {
  const response = await makeRequest('GET', '/api/users');
  assert(response.status === 200, 'Get users returns 200');
  assert(response.data.success === true, 'Get users returns success');
  assert(Array.isArray(response.data.data), 'Users data is an array');
  assert(response.data.pagination, 'Response includes pagination');
});

test('Get user by ID', async () => {
  const response = await makeRequest('GET', '/api/users/1');
  assert(response.status === 200, 'Get user by ID returns 200');
  assert(response.data.success === true, 'Get user by ID returns success');
  assert(response.data.data.id === 1, 'Returns correct user');
});

test('Create new user', async () => {
  const newUser = {
    name: 'Test User',
    email: 'test@example.com',
    age: 25
  };
  const response = await makeRequest('POST', '/api/users', newUser);
  assert(response.status === 201, 'Create user returns 201');
  assert(response.data.success === true, 'Create user returns success');
  assert(response.data.data.name === newUser.name, 'Created user has correct name');
  assert(response.data.data.id, 'Created user has ID');
});

test('Update user', async () => {
  const updateData = {
    name: 'Updated Test User',
    email: 'updated@example.com'
  };
  const response = await makeRequest('PUT', '/api/users/1', updateData);
  assert(response.status === 200, 'Update user returns 200');
  assert(response.data.success === true, 'Update user returns success');
  assert(response.data.data.name === updateData.name, 'User name updated correctly');
});

test('Get all posts', async () => {
  const response = await makeRequest('GET', '/api/posts');
  assert(response.status === 200, 'Get posts returns 200');
  assert(response.data.success === true, 'Get posts returns success');
  assert(Array.isArray(response.data.data), 'Posts data is an array');
});

test('Get all products', async () => {
  const response = await makeRequest('GET', '/api/products');
  assert(response.status === 200, 'Get products returns 200');
  assert(response.data.success === true, 'Get products returns success');
  assert(Array.isArray(response.data.data), 'Products data is an array');
});

test('Pagination test', async () => {
  const response = await makeRequest('GET', '/api/users?page=1&limit=2');
  assert(response.status === 200, 'Pagination request returns 200');
  assert(response.data.pagination.limit === 2, 'Pagination limit is correct');
  assert(response.data.data.length <= 2, 'Returned data respects limit');
});

test('Filtering test', async () => {
  const response = await makeRequest('GET', '/api/users?~name=john');
  assert(response.status === 200, 'Filtering request returns 200');
  assert(response.data.success === true, 'Filtering returns success');
});

test('Error handling - 404', async () => {
  const response = await makeRequest('GET', '/api/users/999');
  assert(response.status === 404, 'Non-existent user returns 404');
  assert(response.data.success === false, 'Error response has success: false');
});

test('Validation error', async () => {
  const invalidUser = {
    name: 'A', // Too short
    email: 'invalid-email'
  };
  const response = await makeRequest('POST', '/api/users', invalidUser);
  assert(response.status === 400, 'Invalid data returns 400');
  assert(response.data.success === false, 'Validation error has success: false');
});

// Run all tests
const runTests = async () => {
  console.log('🧪 Starting API Test Suite...\n');
  
  for (const { description, testFn } of tests) {
    try {
      console.log(`Testing: ${description}`);
      await testFn();
      console.log('');
    } catch (error) {
      console.log(`Test failed: ${error.message}\n`);
    }
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}`);
  console.log(`❌ Failed: ${failedTests}`);
  console.log(`📈 Success Rate: ${((passedTests / (passedTests + failedTests)) * 100).toFixed(1)}%`);
  
  if (failedTests === 0) {
    console.log('\n🎉 All tests passed!');
    process.exit(0);
  } else {
    console.log('\n⚠️  Some tests failed. Check the server and try again.');
    process.exit(1);
  }
};

// Check if server is running first
const checkServer = async () => {
  try {
    await makeRequest('GET', '/health');
    console.log('✅ Server is running\n');
    runTests();
  } catch (error) {
    console.log('❌ Server is not running. Please start the server first:');
    console.log('   cd server && npm start');
    console.log('   or');
    console.log('   cd server && npm run dev');
    process.exit(1);
  }
};

checkServer();

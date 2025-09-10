# 🎯 Maintainability Guide

This guide explains how to maintain and extend the API wrapper package with minimal effort.

## 🔧 The One-File Rule

**90% of your changes will only require editing `src/endpoints.ts`**

This configuration-driven architecture means:
- ✅ New endpoints = Add to `endpoints.ts` only
- ✅ Modify endpoints = Edit configuration in `endpoints.ts` only  
- ✅ Remove endpoints = Delete from `endpoints.ts` only

## 📋 Adding a New Endpoint - Step by Step

### Step 1: Define Types (if needed)

```typescript
// In src/endpoints.ts - Add new interface definitions

export interface OrderQueryParams {
  status?: 'pending' | 'completed' | 'cancelled';
  customerId?: number;
  dateFrom?: string;
  dateTo?: string;
}

export interface OrderResponse {
  id: number;
  customerId: number;
  status: string;
  total: number;
  items: OrderItem[];
  createdAt: string;
}

export interface CreateOrderBody {
  customerId: number;
  items: OrderItem[];
  shippingAddress: Address;
}
```

### Step 2: Add Endpoint Configuration

```typescript
// In src/endpoints.ts - Add to API_ENDPOINTS object

export const API_ENDPOINTS = {
  // ... existing endpoints ...

  getOrders: {
    path: '/orders',
    method: 'GET' as HttpMethod,
    queryParams: {
      status: { type: 'string', description: 'Filter by order status' },
      customerId: { type: 'number', description: 'Filter by customer ID' },
      dateFrom: { type: 'string', description: 'Filter orders from date (ISO)' },
      dateTo: { type: 'string', description: 'Filter orders to date (ISO)' }
    },
    description: 'Get orders with optional filtering'
  } as EndpointConfig<OrderQueryParams, never, OrderResponse[]>,

  getOrderById: {
    path: '/orders/:id',
    method: 'GET' as HttpMethod,
    description: 'Get a specific order by ID'
  } as EndpointConfig<never, never, OrderResponse>,

  createOrder: {
    path: '/orders',
    method: 'POST' as HttpMethod,
    requestBody: {
      customerId: { required: true, type: 'number', description: 'Customer ID' },
      items: { required: true, type: 'array', description: 'Order items' },
      shippingAddress: { required: true, type: 'object', description: 'Shipping address' }
    },
    description: 'Create a new order'
  } as EndpointConfig<never, CreateOrderBody, OrderResponse>
};
```

### Step 3: Add Convenience Methods (Optional)

```typescript
// In src/api-client.ts - Add to ApiClient class

// Order operations
async getOrders(queryParams?: OrderQueryParams) {
  return this.get('getOrders', queryParams);
}

async getOrderById(orderId: string | number) {
  return this.get('getOrderById', undefined, { id: orderId });
}

async createOrder(orderData: CreateOrderBody) {
  return this.post('createOrder', orderData);
}
```

**That's it!** Your new endpoints are now fully functional with:
- ✅ Full type safety
- ✅ Automatic validation  
- ✅ IntelliSense support
- ✅ Error handling
- ✅ Retry logic

## 🔄 Modifying Existing Endpoints

### Change Request/Response Structure

Simply update the interface and endpoint configuration:

```typescript
// Update the interface
export interface UserResponse {
  id: number;
  name: string;
  email: string;
  phone?: string;        // ← New field
  avatar?: string;       // ← New field
  createdAt: string;
}

// Configuration automatically uses the updated interface
// No other changes needed!
```

### Add New Query Parameters

```typescript
export const API_ENDPOINTS = {
  getUsers: {
    path: '/users',
    method: 'GET' as HttpMethod,
    queryParams: {
      page: { type: 'number', description: 'Page number for pagination' },
      limit: { type: 'number', description: 'Number of items per page' },
      search: { type: 'string', description: 'Search term for filtering users' },
      role: { type: 'string', description: 'Filter by user role' },      // ← New param
      isActive: { type: 'boolean', description: 'Filter by active status' } // ← New param
    },
    description: 'Get a list of users with optional filtering and pagination'
  } as EndpointConfig<UserQueryParams, never, UserResponse[]>
};
```

### Change Validation Rules

```typescript
export const API_ENDPOINTS = {
  createUser: {
    path: '/users',
    method: 'POST' as HttpMethod,
    requestBody: {
      name: { required: true, type: 'string', description: 'User name' },
      email: { required: true, type: 'string', description: 'User email' },
      password: { required: true, type: 'string', description: 'User password' },
      phone: { required: false, type: 'string', description: 'User phone' }, // ← New field
      role: { required: true, type: 'string', description: 'User role' }      // ← New required field
    },
    description: 'Create a new user'
  } as EndpointConfig<never, CreateUserBody, UserResponse>
};
```

## 🗂 File Organization Strategy

### Core Files (Rarely Modified)
- `src/types.ts` - Core type definitions
- `src/validator.ts` - Validation logic  
- `src/http-client.ts` - HTTP client with retry logic
- `src/api-client.ts` - Main API client class
- `src/index.ts` - Public exports

### Configuration File (Frequently Modified)
- `src/endpoints.ts` - **THE MAIN FILE YOU'LL EDIT**

### Usage Examples
- `examples/usage.ts` - Update when adding major new patterns
- `demo.js` - Update when demonstrating new features

## 🧪 Testing New Endpoints

### 1. Unit Tests
Add tests to `src/__tests__/api-client.test.ts`:

```typescript
describe('Order Endpoints', () => {
  test('should handle order creation', async () => {
    const httpClientRequestSpy = jest.spyOn((apiClient as any).httpClient, 'request');
    httpClientRequestSpy.mockResolvedValue({ data: {}, status: 201, statusText: 'Created', headers: {} });

    await apiClient.createOrder({
      customerId: 123,
      items: [],
      shippingAddress: {}
    });

    expect(httpClientRequestSpy).toHaveBeenCalledWith(
      expect.objectContaining({
        path: '/orders',
        method: 'POST'
      }),
      expect.objectContaining({
        body: expect.any(Object)
      })
    );
  });
});
```

### 2. Manual Testing
Update `demo.js` or create a test script:

```javascript
const { createApiClient } = require('./dist/index.js');

const client = createApiClient({
  baseURL: 'https://your-api.com'
});

// Test your new endpoint
client.getOrders({ status: 'pending' })
  .then(response => console.log('Orders:', response.data))
  .catch(error => console.error('Error:', error));
```

## 📊 Configuration Patterns

### Simple GET Endpoint
```typescript
simpleGet: {
  path: '/simple',
  method: 'GET' as HttpMethod,
  description: 'Simple GET endpoint'
} as EndpointConfig<never, never, SimpleResponse>
```

### GET with Query Parameters
```typescript
filteredGet: {
  path: '/items',
  method: 'GET' as HttpMethod,
  queryParams: {
    category: { type: 'string', description: 'Filter by category' },
    inStock: { type: 'boolean', description: 'Filter by stock availability' }
  }
} as EndpointConfig<FilterParams, never, ItemResponse[]>
```

### POST with Body Validation
```typescript
createEndpoint: {
  path: '/items',
  method: 'POST' as HttpMethod,
  requestBody: {
    name: { required: true, type: 'string', description: 'Item name' },
    price: { required: true, type: 'number', description: 'Item price' },
    description: { required: false, type: 'string', description: 'Item description' }
  }
} as EndpointConfig<never, CreateItemBody, ItemResponse>
```

### Endpoint with Path Parameters
```typescript
getSpecific: {
  path: '/items/:id',
  method: 'GET' as HttpMethod,
  description: 'Get specific item by ID'
} as EndpointConfig<never, never, ItemResponse>

// Usage: client.getSpecific(undefined, { id: 123 })
// Or add convenience method: client.getItemById(123)
```

## 🚀 Performance Considerations

### Lazy Loading Endpoints
For large APIs, consider splitting endpoints into modules:

```typescript
// src/endpoints/user-endpoints.ts
export const USER_ENDPOINTS = { ... };

// src/endpoints/order-endpoints.ts  
export const ORDER_ENDPOINTS = { ... };

// src/endpoints.ts
export const API_ENDPOINTS = {
  ...USER_ENDPOINTS,
  ...ORDER_ENDPOINTS
};
```

### Bundle Size Optimization
The configuration-driven approach keeps bundle size minimal because:
- No code duplication
- Shared validation logic
- Tree-shakable exports

## 🔧 Advanced Customization

### Custom Headers per Endpoint
```typescript
secureEndpoint: {
  path: '/secure-data',
  method: 'GET' as HttpMethod,
  headers: {
    'X-Require-Auth': 'true',
    'X-API-Version': '2.0'
  }
} as EndpointConfig<never, never, SecureResponse>
```

### Custom Timeout per Endpoint
```typescript
slowEndpoint: {
  path: '/slow-operation',
  method: 'POST' as HttpMethod,
  timeout: 60000, // 60 seconds
  requestBody: { ... }
} as EndpointConfig<never, SlowRequestBody, SlowResponse>
```

## 📈 Scaling Your API Wrapper

### 1. Version Management
Create version-specific endpoint files:

```
src/
├── endpoints/
│   ├── v1-endpoints.ts
│   ├── v2-endpoints.ts
│   └── index.ts
```

### 2. Environment-Specific Configs
```typescript
const API_ENDPOINTS = {
  ...COMMON_ENDPOINTS,
  ...(process.env.NODE_ENV === 'production' ? PROD_ENDPOINTS : DEV_ENDPOINTS)
};
```

### 3. Plugin System
Extend the client with plugins:

```typescript
class PluginApiClient extends ApiClient {
  constructor(config, plugins = []) {
    super(config);
    plugins.forEach(plugin => plugin.install(this));
  }
}
```

## 🎯 Best Practices Summary

1. **Always update `endpoints.ts` first** - This is your single source of truth
2. **Use descriptive endpoint names** - Makes the API self-documenting  
3. **Keep interfaces simple** - Complex nested types can be broken down
4. **Add descriptions** - Helps with API documentation generation
5. **Test new endpoints** - Add at least one test case per endpoint
6. **Update examples** - Keep usage examples current
7. **Version your changes** - Use semantic versioning for breaking changes

## 🆘 Troubleshooting

### Common Issues

**TypeScript errors after adding endpoint:**
- Check interface definitions match endpoint configuration
- Ensure proper type imports
- Verify `as EndpointConfig<...>` casting

**Validation not working:**
- Check `required` flags in configuration  
- Verify type mappings (`string`, `number`, `boolean`, etc.)
- Test with proper data types

**Path parameters not working:**
- Ensure path uses `:paramName` syntax
- Pass path params as second argument to request methods
- Check convenience method implementations

## 🎉 You're Ready!

With this configuration-driven architecture, you can:
- Add dozens of endpoints with minimal code changes
- Maintain type safety across your entire API
- Scale your codebase without increasing complexity
- Onboard new developers quickly with clear patterns

The key is the **One-File Rule**: `src/endpoints.ts` is your main workspace!

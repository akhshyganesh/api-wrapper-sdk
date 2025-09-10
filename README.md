# API Wrapper SDK

A highly maintainable, type-safe TypeScript API wrapper that provides excellent developer experience through configuration-driven endpoint management.

## 🚀 Features

- **🔧 Configuration-Driven**: Add new endpoints by simply updating the configuration file
- **🔒 Type Safety**: Full TypeScript support with intelligent IntelliSense
- **✅ Automatic Validation**: Request/response validation with detailed error messages
- **🔄 Smart Retries**: Configurable retry logic with exponential backoff
- **📊 Built-in Logging**: Request/response logging for debugging
- **🎯 Path Parameters**: Automatic handling of dynamic URL parameters
- **🛠 Extensible**: Easy to extend with custom business logic

## 📦 Installation

```bash
npm install api-wrapper-sdk
# or
yarn add api-wrapper-sdk
```

## 🏗 Architecture

This package follows a **configuration-driven architecture** that prioritizes maintainability:

```
src/
├── types.ts           # Core type definitions
├── endpoints.ts       # 🎯 ENDPOINT CONFIGURATIONS (Main file to modify)
├── validator.ts       # Request/response validation logic
├── http-client.ts     # HTTP client with retry logic
├── api-client.ts      # Main API client class
└── index.ts          # Public API exports
```

### The Key Principle: **Single File Updates**

When you need to add a new endpoint, you **ONLY** need to modify `src/endpoints.ts`. The entire system automatically:
- Generates type-safe methods
- Handles validation
- Provides IntelliSense support
- Manages path parameters

## 🚀 Quick Start

### 1. Basic Setup

```typescript
import { createApiClient } from 'api-wrapper-sdk';

const apiClient = createApiClient({
  baseURL: 'https://api.example.com',
  timeout: 30000,
  retries: 3,
  retryDelay: 1000,
  defaultHeaders: {
    'Authorization': 'Bearer your-token-here',
    'Content-Type': 'application/json'
  }
});
```

### 2. Making API Calls

```typescript
// Get users with pagination
const users = await apiClient.getUsers({
  page: 1,
  limit: 10,
  search: 'john'
});

// Get specific user
const user = await apiClient.getUserById(123);

// Create new user
const newUser = await apiClient.createUser({
  name: 'John Doe',
  email: 'john@example.com',
  password: 'securepassword123'
});

// Update user
const updatedUser = await apiClient.updateUser(123, {
  name: 'John Updated'
});
```

## 🎯 Adding New Endpoints

This is where the magic happens! To add a new endpoint, you **ONLY** need to update `src/endpoints.ts`:

### Step 1: Define Types (if needed)

```typescript
// In src/endpoints.ts
export interface ProductQueryParams {
  category?: string;
  minPrice?: number;
  maxPrice?: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  price: number;
  category: string;
}

export interface CreateProductBody {
  name: string;
  price: number;
  category: string;
  description?: string;
}
```

### Step 2: Add Endpoint Configuration

```typescript
// In src/endpoints.ts - Add to API_ENDPOINTS object
export const API_ENDPOINTS = {
  // ... existing endpoints ...
  
  getProducts: {
    path: '/products',
    method: 'GET' as HttpMethod,
    queryParams: {
      category: { type: 'string', description: 'Filter by category' },
      minPrice: { type: 'number', description: 'Minimum price filter' },
      maxPrice: { type: 'number', description: 'Maximum price filter' }
    },
    description: 'Get products with filtering options'
  } as EndpointConfig<ProductQueryParams, never, ProductResponse[]>,

  createProduct: {
    path: '/products',
    method: 'POST' as HttpMethod,
    requestBody: {
      name: { required: true, type: 'string', description: 'Product name' },
      price: { required: true, type: 'number', description: 'Product price' },
      category: { required: true, type: 'string', description: 'Product category' },
      description: { type: 'string', description: 'Product description' }
    },
    description: 'Create a new product'
  } as EndpointConfig<never, CreateProductBody, ProductResponse>
};
```

### Step 3: Add Convenience Methods (Optional)

```typescript
// In src/api-client.ts - Add to ApiClient class
async getProducts(queryParams?: ProductQueryParams) {
  return this.get('getProducts', queryParams);
}

async createProduct(productData: CreateProductBody) {
  return this.post('createProduct', productData);
}
```

**That's it!** The new endpoints are now fully functional with:
- ✅ Type safety
- ✅ Validation
- ✅ IntelliSense support
- ✅ Error handling

## 🔧 Configuration Options

### Client Configuration

```typescript
interface ClientConfig {
  baseURL: string;           // API base URL
  defaultHeaders?: Headers;  // Default headers for all requests
  timeout?: number;          // Request timeout (ms)
  retries?: number;          // Number of retry attempts
  retryDelay?: number;       // Delay between retries (ms)
}
```

### Endpoint Configuration

```typescript
interface EndpointConfig {
  path: string;              // URL path (supports :id parameters)
  method: HttpMethod;        // HTTP method
  queryParams?: {            // Query parameter validation schema
    [key]: {
      required?: boolean;
      type: 'string' | 'number' | 'boolean';
      description?: string;
    };
  };
  requestBody?: {            // Request body validation schema
    [key]: {
      required?: boolean;
      type: 'string' | 'number' | 'boolean' | 'object' | 'array';
      description?: string;
    };
  };
  headers?: Headers;         // Endpoint-specific headers
  timeout?: number;          // Endpoint-specific timeout
  description?: string;      // Endpoint description
}
```

## 🛡 Error Handling

The SDK provides detailed error information:

```typescript
try {
  await apiClient.createUser({
    name: 'John',
    // email missing - validation error
  });
} catch (error) {
  if (error.name === 'ApiValidationError') {
    console.log('Validation errors:', error.errors);
    // [{ field: 'email', message: 'Required field is missing', expectedType: 'string', actualValue: undefined }]
  } else if (error.name === 'ApiRequestError') {
    console.log('Request failed:', {
      status: error.status,
      statusText: error.statusText,
      response: error.response
    });
  }
}
```

## 🎨 Advanced Usage

### Custom Business Logic

```typescript
class CustomApiClient extends ApiClient {
  async getUserWithPosts(userId: number) {
    const [user, posts] = await Promise.all([
      this.getUserById(userId),
      this.getPosts({ authorId: userId })
    ]);
    
    return { user: user.data, posts: posts.data };
  }
}
```

### Generic Request Method

```typescript
// For dynamic endpoint calls
const response = await apiClient.request('getUsers', {
  queryParams: { limit: 5 },
  headers: { 'Custom-Header': 'value' }
});
```

### Path Parameters

```typescript
// Endpoints with :id parameters are handled automatically
await apiClient.getUserById(123);          // GET /users/123
await apiClient.updateUser(123, userData); // PUT /users/123
await apiClient.deleteUser(123);           // DELETE /users/123
```

## 📊 Built-in Features

### Request Logging
All requests are automatically logged:
```
[API] GET /users?page=1&limit=10
[API] Response 200 for /users?page=1&limit=10
```

### Automatic Retries
Failed requests are automatically retried based on configuration:
```
[API] Retrying request (1/3)
```

### Type-Safe Responses
All responses are properly typed:
```typescript
const response = await apiClient.getUsers();
// response.data is typed as UserResponse[]
// response.status is number
// response.headers is Headers
```

## 🧪 Testing

```bash
npm test
```

## 🔨 Development

```bash
# Install dependencies
npm install

# Build the package
npm run build

# Watch mode for development
npm run dev

# Lint code
npm run lint

# Format code
npm run format
```

## 📝 Contributing

We welcome contributions to the API Wrapper SDK! Here's how you can contribute:

### Getting Started

1. **Fork the repository** on GitHub
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/api-wrapper-sdk.git
   cd api-wrapper-sdk
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Create a feature branch**:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Development Workflow

1. **Make your changes** following our coding standards:
   - Add new endpoints by updating `src/endpoints.ts`
   - Add convenience methods to `src/api-client.ts` if needed
   - Write tests for new functionality in `src/__tests__/`
   
2. **Test your changes**:
   ```bash
   npm test                    # Run all tests
   npm run lint               # Check code style
   npm run format             # Format code
   npm run build              # Ensure build works
   ```

3. **Update documentation** if needed:
   - Update README.md for new features
   - Add JSDoc comments to new functions
   - Update type definitions

### Contribution Guidelines

- **Code Style**: We use ESLint and Prettier for consistent code formatting
- **Commit Messages**: Use clear, descriptive commit messages
- **Testing**: Add tests for new features and ensure existing tests pass
- **Documentation**: Update documentation for any new features or changes
- **Type Safety**: Maintain full TypeScript compatibility

### Types of Contributions

- 🐛 **Bug fixes**
- ✨ **New features** (new endpoints, client improvements)
- 📝 **Documentation improvements**
- 🧪 **Tests** (unit tests, integration tests)
- 🎨 **Code style improvements**
- ⚡ **Performance improvements**

### Submitting Changes

1. **Commit your changes**:
   ```bash
   git add .
   git commit -m "feat: add amazing new feature"
   ```
2. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```
3. **Create a Pull Request** on GitHub with:
   - Clear description of changes
   - Reference to any related issues
   - Screenshots/examples if applicable

### Code Review Process

- All submissions require review
- We aim to review PRs within 48 hours
- Address feedback promptly
- Ensure CI checks pass

### Questions or Issues?

- Check existing [issues](https://github.com/akhshyganesh/api-wrapper-sdk/issues)
- Create a new issue for bugs or feature requests
- Join discussions in existing issues

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

### MIT License Summary

- ✅ **Commercial use** - You can use this software commercially
- ✅ **Modification** - You can modify the source code
- ✅ **Distribution** - You can distribute the software
- ✅ **Private use** - You can use this software privately
- ❌ **Liability** - Authors are not liable for any damages
- ❌ **Warranty** - No warranty is provided

**Copyright (c) 2025 akhshyganesh**

---

## 🎯 Why This Architecture?

This configuration-driven approach provides several key benefits:

1. **Maintainability**: New endpoints require changes to only one file
2. **Type Safety**: Full TypeScript support with intelligent IntelliSense
3. **Consistency**: All endpoints follow the same patterns
4. **Validation**: Automatic request/response validation
5. **Documentation**: Self-documenting through configuration
6. **Testability**: Easy to mock and test individual endpoints
7. **Scalability**: Scales effortlessly as your API grows

The result is a codebase that remains clean and maintainable even as you add dozens or hundreds of endpoints!

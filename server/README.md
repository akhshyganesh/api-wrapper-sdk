# API Wrapper Test Server

A comprehensive Express.js server with CRUD operations using a JSON file as database for testing API wrapper functionality.

## Features

- **RESTful CRUD operations** for Users, Posts, and Products
- **JSON file database** with automatic persistence
- **Validation middleware** with comprehensive error handling
- **Pagination and filtering** support
- **CORS enabled** for cross-origin requests
- **Security headers** with Helmet
- **Request logging** with Morgan
- **Health check endpoint**
- **Auto-generated API documentation**

## Quick Start

### Installation

```bash
cd server
npm install
```

### Development

```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production

```bash
npm start
```

The server will start on `http://localhost:3001`

## API Endpoints

### Base URLs
- Health Check: `GET /health`
- API Documentation: `GET /`

### Users API (`/api/users`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users` | Get all users with pagination |
| GET | `/api/users/:id` | Get user by ID |
| POST | `/api/users` | Create new user |
| PUT | `/api/users/:id` | Update user |
| PATCH | `/api/users/:id` | Partially update user |
| DELETE | `/api/users/:id` | Delete user |

#### User Schema
```json
{
  "name": "string (required, 2-100 chars)",
  "email": "string (required, valid email)",
  "age": "number (optional, 0-150)"
}
```

### Posts API (`/api/posts`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/posts` | Get all posts with pagination |
| GET | `/api/posts/:id` | Get post by ID |
| POST | `/api/posts` | Create new post |
| PUT | `/api/posts/:id` | Update post |
| PATCH | `/api/posts/:id` | Partially update post |
| DELETE | `/api/posts/:id` | Delete post |

#### Post Schema
```json
{
  "title": "string (required, 5-200 chars)",
  "content": "string (required, min 10 chars)",
  "authorId": "number (required, min 1)",
  "tags": "array (optional)",
  "published": "boolean (optional)"
}
```

### Products API (`/api/products`)

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | Get all products with pagination |
| GET | `/api/products/:id` | Get product by ID |
| POST | `/api/products` | Create new product |
| PUT | `/api/products/:id` | Update product |
| PATCH | `/api/products/:id` | Partially update product |
| DELETE | `/api/products/:id` | Delete product |

#### Product Schema
```json
{
  "name": "string (required, 2-100 chars)",
  "description": "string (optional, max 500 chars)",
  "price": "number (required, min 0)",
  "category": "string (required, 2-50 chars)",
  "inStock": "boolean (optional)"
}
```

## Query Parameters

### Pagination
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10, max: 100)

### Filtering
- Add any field as query parameter for exact match
- Prefix with `~` for partial search (case-insensitive)

## Example Requests

### Get paginated users
```bash
GET /api/users?page=2&limit=5
```

### Filter users by age
```bash
GET /api/users?age=30
```

### Search posts by title (partial match)
```bash
GET /api/posts?~title=api
```

### Filter products by category and stock status
```bash
GET /api/products?category=Electronics&inStock=true
```

### Create a new user
```bash
POST /api/users
Content-Type: application/json

{
  "name": "Alice Johnson",
  "email": "alice@example.com",
  "age": 28
}
```

### Update a user
```bash
PUT /api/users/1
Content-Type: application/json

{
  "name": "John Updated",
  "email": "john.updated@example.com",
  "age": 31
}
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "message": "Operation completed successfully",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response
```json
{
  "success": true,
  "data": [ /* array of items */ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 50,
    "totalPages": 5,
    "hasNext": true,
    "hasPrev": false
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "message": "Error description",
    "status": 400,
    "details": ["Validation error details"]
  },
  "timestamp": "2024-01-01T00:00:00.000Z",
  "path": "/api/users"
}
```

## Database

The server uses a JSON file (`data/db.json`) as the database. The file is automatically created and managed by the JsonDatabase class.

### Database Structure
```json
{
  "users": [],
  "posts": [],
  "products": []
}
```

## Environment Variables

- `PORT`: Server port (default: 3001)
- `NODE_ENV`: Environment (development/production)
- `ALLOWED_ORIGINS`: Comma-separated list of allowed CORS origins

## Testing with Your API Wrapper

This server is designed to work perfectly with your API wrapper SDK. Example configuration:

```typescript
import { ApiClient } from 'api-wrapper-sdk';

const client = new ApiClient({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Test your endpoints
const users = await client.get('/users');
const newUser = await client.post('/users', {
  name: 'Test User',
  email: 'test@example.com'
});
```

## Architecture

- **`index.js`**: Main server file with Express app setup
- **`database.js`**: JSON file database utility with CRUD operations
- **`routes/crud.js`**: Generic CRUD route factory
- **`routes/`**: Specific route files for each resource
- **`middleware/`**: Error handling, validation, and utility middleware
- **`data/db.json`**: JSON database file

This modular architecture makes it easy to add new resources or modify existing ones.
